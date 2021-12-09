import json
import logging
from typing import Any, Optional

import requests
from flask import g, request, Response
from flask_appbuilder.api import expose, permission_name, protect, rison, safe
from flask_appbuilder.hooks import before_request
from flask_appbuilder.models.sqla.interface import SQLAInterface
from marshmallow import ValidationError

from superset import is_feature_enabled
from superset.active_reports.commands.create import CreateActiveReportCommand
from superset.active_reports.commands.delete import DeleteActiveReportCommand
from superset.active_reports.commands.exceptions import (
    ActiveReportCreateFailedError,
    ActiveReportDeleteFailedError,
    ActiveReportForbiddenError,
    ActiveReportInvalidError,
    ActiveReportNotFoundError,
    ActiveReportUpdateFailedError,
)
from superset.active_reports.commands.update import UpdateActiveReportCommand
from superset.active_reports.dao import ActiveReportsDAO
from superset.active_reports.filters import (
    ActiveReportAccessFilter,
    ActiveReportAllTextFilter,
)
from superset.active_reports.schemas import (
    ActiveReportPostSchema,
    ActiveReportPutSchema,
    openapi_spec_methods_override,
    get_fav_star_ids_schema,
)
from superset.charts.schemas import ChartEntityResponseSchema
from superset.constants import MODEL_API_RW_METHOD_PERMISSION_MAP, RouteMethod
from superset.extensions import event_logger
from superset.models.active_reports import ActiveReport
from superset.views.base_api import (
    BaseSupersetModelRestApi,
    RelatedFieldFilter,
    statsd_metrics,
)
from superset.views.filters import FilterRelatedOwners

logger = logging.getLogger(__name__)


class ActiveReportsRestApi(BaseSupersetModelRestApi):
    datamodel = SQLAInterface(ActiveReport)
    resource_name = "active_reports"

    allow_browser_login = True

    @before_request
    def ensure_activereports_enabled(self) -> Optional[Response]:
        if not is_feature_enabled("ACTIVE_REPORTS_JS"):
            return self.response_404()
        return None

    include_route_methods = RouteMethod.REST_MODEL_VIEW_CRUD_SET | {
        RouteMethod.RELATED,
        "get_charts",
        "favorite_status",
    }
    class_permission_name = "ActiveReport"
    method_permission_name = MODEL_API_RW_METHOD_PERMISSION_MAP

    show_columns = [
        "id",
        "report_name",
        "report_data",
    ]
    show_select_columns = show_columns
    list_columns = [
        "id",
        "report_name",
        "url",
        "changed_by.first_name",
        "changed_by.last_name",
        "changed_by.username",
        "changed_by.id",
        "changed_by_name",
        "changed_by_url",
        "changed_on_utc",
        "changed_on_delta_humanized",
        "created_by.first_name",
        "created_by.id",
        "created_by.last_name",
        "owners.id",
        "owners.username",
        "owners.first_name",
        "owners.last_name",
    ]
    list_select_columns = list_columns + ["changed_on", "changed_by_fk"]
    add_columns = [
        "report_name",
        "report_data",
        "owners",
        "published",
    ]
    edit_columns = add_columns
    add_model_schema = ActiveReportPostSchema()
    edit_model_schema = ActiveReportPutSchema()
    chart_entity_response_schema = ChartEntityResponseSchema()

    order_columns = [
        "changed_by.first_name",
        "changed_on_delta_humanized",
        "created_by.first_name",
        "report_name",
        "published",
    ]
    search_columns = (
        "id",
        "report_name",
        "created_by",
        "changed_by",
        "owners",
        "published",
    )

    base_filters = [["id", ActiveReportAccessFilter, lambda: []]]
    search_filters = {"report_name": [ActiveReportAllTextFilter]}
    allowed_rel_fields = {"owners", "created_by"}
    related_field_filters = {
        "owners": RelatedFieldFilter("first_name", FilterRelatedOwners),
        "created_by": RelatedFieldFilter("first_name", FilterRelatedOwners),
    }
    # text_field_rel_fields = {
    #     "dashboard": "dashboard_title",
    #     "chart": "slice_name",
    #     "database": "database_name",
    # }
    filter_rel_fields = {
        # "dashboard": "dashboard_title",
        # "chart": "slice_name",
        # "database": "database_name",
        "owners": RelatedFieldFilter("first_name", FilterRelatedOwners),
    }

    # apispec_parameter_schemas = {
    #     "get_delete_ids_schema": get_delete_ids_schema,
    # }
    openapi_spec_tag = "Report Schedules"
    openapi_spec_methods = openapi_spec_methods_override

    @expose("/<int:pk>", methods=["DELETE"])
    @protect()
    @safe
    @statsd_metrics
    @permission_name("delete")
    @event_logger.log_this_with_context(
        action=lambda self, *args, **kwargs: f"{self.__class__.__name__}.delete",
        log_to_statsd=False,
    )
    def delete(self, pk: int) -> Response:
        """Delete a Active Report
        ---
        delete:
          description: >-
            Delete a Active Report
          parameters:
          - in: path
            schema:
              type: integer
            name: pk
            description: The active report pk
          responses:
            200:
              description: Item deleted
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      message:
                        type: string
            403:
              $ref: '#/components/responses/403'
            404:
              $ref: '#/components/responses/404'
            422:
              $ref: '#/components/responses/422'
            500:
              $ref: '#/components/responses/500'
        """
        try:
            DeleteActiveReportCommand(g.user, pk).run()
            return self.response(200, message="OK")
        except ActiveReportNotFoundError:
            return self.response_404()
        except ActiveReportForbiddenError:
            return self.response_403()
        except ActiveReportDeleteFailedError as ex:
            logger.error(
                "Error deleting active report %s: %s",
                self.__class__.__name__,
                str(ex),
                exc_info=True,
            )
            return self.response_422(message=str(ex))

    @expose("/", methods=["POST"])
    @protect()
    @safe
    @statsd_metrics
    @permission_name("post")
    @event_logger.log_this_with_context(
        action=lambda self, *args, **kwargs: f"{self.__class__.__name__}.post",
        log_to_statsd=False,
    )
    def post(self) -> Response:
        """Creates a new Active Report
        ---
        post:
          description: >-
            Create a new Active Report
          requestBody:
            description: Active Report schema
            required: true
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/{{self.__class__.__name__}}.post'
          responses:
            201:
              description: Active Report added
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      id:
                        type: number
                      result:
                        $ref: '#/components/schemas/{{self.__class__.__name__}}.post'
            400:
              $ref: '#/components/responses/400'
            401:
              $ref: '#/components/responses/401'
            404:
              $ref: '#/components/responses/404'
            500:
              $ref: '#/components/responses/500'
        """
        if not request.is_json:
            return self.response_400(message="Request is not JSON")
        try:

            item = self.add_model_schema.load(request.json)

        # This validates custom Schema with custom validations
        except ValidationError as error:
            return self.response_400(message=error.messages)
        try:
            new_model = CreateActiveReportCommand(g.user, item).run()
            return self.response(201, id=new_model.id, result=item)
        except ActiveReportNotFoundError as ex:
            return self.response_400(message=str(ex))
        except ActiveReportInvalidError as ex:
            return self.response_422(message=ex.normalized_messages())
        except ActiveReportCreateFailedError as ex:
            logger.error(
                "Error creating active report %s: %s",
                self.__class__.__name__,
                str(ex),
                exc_info=True,
            )
            return self.response_422(message=str(ex))

    @expose("/<int:pk>", methods=["PUT"])
    @protect()
    @safe
    @statsd_metrics
    @permission_name("put")
    @event_logger.log_this_with_context(
        action=lambda self, *args, **kwargs: f"{self.__class__.__name__}.put",
        log_to_statsd=False,
    )
    def put(self, pk: int) -> Response:  # pylint: disable=too-many-return-statements
        """Updates an Report Schedule
        ---
        put:
          description: >-
            Updates a Report Schedule
          parameters:
          - in: path
            schema:
              type: integer
            name: pk
            description: The Report Schedule pk
          requestBody:
            description: Report Schedule schema
            required: true
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/{{self.__class__.__name__}}.put'
          responses:
            200:
              description: Report Schedule changed
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      id:
                        type: number
                      result:
                        $ref: '#/components/schemas/{{self.__class__.__name__}}.put'
            400:
              $ref: '#/components/responses/400'
            401:
              $ref: '#/components/responses/401'
            403:
              $ref: '#/components/responses/403'
            404:
              $ref: '#/components/responses/404'
            500:
              $ref: '#/components/responses/500'
        """
        if not request.is_json:
            return self.response_400(message="Request is not JSON")
        try:
            item = self.edit_model_schema.load(request.json)
        # This validates custom Schema with custom validations
        except ValidationError as error:
            return self.response_400(message=error.messages)
        try:
            new_model = UpdateActiveReportCommand(g.user, pk, item).run()
            return self.response(200, id=new_model.id, result=item)
        except ActiveReportNotFoundError:
            return self.response_404()
        except ActiveReportInvalidError as ex:
            return self.response_422(message=ex.normalized_messages())
        except ActiveReportForbiddenError:
            return self.response_403()
        except ActiveReportUpdateFailedError as ex:
            logger.error(
                "Error updating active report %s: %s",
                self.__class__.__name__,
                str(ex),
                exc_info=True,
            )
            return self.response_422(message=str(ex))

    @expose("/<int:report_id>/datasets", methods=["GET"])
    @protect()
    @safe
    @statsd_metrics
    @event_logger.log_this_with_context(
        action=lambda self, *args, **kwargs: f"{self.__class__.__name__}.get_charts",
        log_to_statsd=False,
    )
    def get_charts(self, report_id: str) -> Response:
        """Gets the chart definitions for a given report
        ---
        get:
          description: >-
            Get the chart definitions for a given report
          parameters:
          - in: path
            schema:
              type: string
            name: id
          responses:
            200:
              description: Report chart definitions
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      result:
                        type: array
                        items:
                          $ref: '#/components/schemas/ChartEntityResponseSchema'
            302:
              description: Redirects to the current digest
            400:
              $ref: '#/components/responses/400'
            401:
              $ref: '#/components/responses/401'
            404:
              $ref: '#/components/responses/404'
        """
        try:
            charts = ActiveReportsDAO.get_charts_for_report(report_id)
            result = [self.chart_entity_response_schema.dump(chart) for chart in charts]

            return self.response(200, result=result)
        except ActiveReportNotFoundError:
            return self.response_404()

    @expose("/favorite_status/", methods=["GET"])
    @protect()
    @safe
    @statsd_metrics
    @rison(get_fav_star_ids_schema)
    @event_logger.log_this_with_context(
        action=lambda self, *args, **kwargs: f"{self.__class__.__name__}.favorite_status",
        log_to_statsd=False,
    )
    def favorite_status(self, **kwargs: Any) -> Response:
        """Favorite Stars for Active Reports
        ---
        get:
          description: >-
            Check favorited dashboards for current user
          parameters:
          - in: query
            name: q
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/get_fav_star_ids_schema'
          responses:
            200:
              description:
              content:
                application/json:
                  schema:
                    $ref: "#/components/schemas/GetFavStarIdsSchema"
            400:
              $ref: '#/components/responses/400'
            401:
              $ref: '#/components/responses/401'
            404:
              $ref: '#/components/responses/404'
            500:
              $ref: '#/components/responses/500'
        """
        requested_ids = kwargs["rison"]
        active_reports = ActiveReportsDAO.find_by_ids(requested_ids)
        if not active_reports:
            return self.response_404()
        favorited_active_reports_ids = ActiveReportsDAO.favorited_ids(
            active_reports, g.user.get_id()
        )
        res = [
            {"id": request_id, "value": request_id in favorited_active_reports_ids}
            for request_id in requested_ids
        ]
        return self.response(200, result=res)
