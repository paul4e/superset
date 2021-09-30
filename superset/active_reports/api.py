
import logging
from typing import Any, Optional

from flask import g, request, Response
from flask_appbuilder.api import expose, permission_name, protect, rison, safe
from flask_appbuilder.hooks import before_request
from flask_appbuilder.models.sqla.interface import SQLAInterface
from marshmallow import ValidationError

from superset import is_feature_enabled
from superset.constants import MODEL_API_RW_METHOD_PERMISSION_MAP, RouteMethod

from superset.views.base_api import (
    BaseSupersetModelRestApi,
    RelatedFieldFilter,
    statsd_metrics,
)

from superset.models.active_reports import ActiveReport
from superset.active_reports.schemas import (
    ActiveReportPostSchema,
    ActiveReportPutSchema
)
from superset.active_reports.commands.create import CreateActiveReportCommand
from superset.active_reports.commands.update import UpdateActiveReportCommand
from superset.active_reports.commands.delete import DeleteActiveReportCommand

from superset.active_reports.commands.exceptions import (
    ActiveReportInvalidError,
    ActiveReportForbiddenError,
    ActiveReportCreateFailedError,
    ActiveReportDeleteFailedError,
    ActiveReportNotFoundError,
    ActiveReportUpdateFailedError
)
logger = logging.getLogger(__name__)


class ActiveReportsRestApi(BaseSupersetModelRestApi):
    datamodel = SQLAInterface(ActiveReport)

    resource_name = "active_report"
    allow_browser_login = True

    @before_request
    def ensure_alert_reports_enabled(self) -> Optional[Response]:
        if not is_feature_enabled("ACTIVE_REPORTS_JS"):
            return self.response_404()
        return None

    include_route_methods = RouteMethod.REST_MODEL_VIEW_CRUD_SET
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
    ]
    add_columns = [
        "id",
        "report_name",
        "report_data",
    ]
    edit_columns = add_columns
    add_model_schema = ActiveReportPostSchema()
    edit_model_schema = ActiveReportPutSchema()

    order_columns = [
        "report_name",
    ]
    search_columns = [
        "id",
        "report_name",
    ]
    # search_filters = {"name": [ReportScheduleAllTextFilter]}
    # allowed_rel_fields = {"owners", "chart", "dashboard", "database", "created_by"}
    # filter_rel_fields = {
    #     "chart": [["id", ChartFilter, lambda: []]],
    #     "dashboard": [["id", DashboardAccessFilter, lambda: []]],
    #     "database": [["id", DatabaseFilter, lambda: []]],
    # }
    # text_field_rel_fields = {
    #     "dashboard": "dashboard_title",
    #     "chart": "slice_name",
    #     "database": "database_name",
    # }
    # related_field_filters = {
    #     "dashboard": "dashboard_title",
    #     "chart": "slice_name",
    #     "database": "database_name",
    #     "owners": RelatedFieldFilter("first_name", FilterRelatedOwners),
    # }

    # apispec_parameter_schemas = {
    #     "get_delete_ids_schema": get_delete_ids_schema,
    # }
    # openapi_spec_tag = "Report Schedules"
    # openapi_spec_methods = openapi_spec_methods_override

    @expose("/<int:pk>", methods=["DELETE"])
    @protect()
    @safe
    @statsd_metrics
    @permission_name("delete")
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
        logger.debug(request)
        logger.debug(request.args)
        logger.debug(request.form)
        logger.debug(request.json)
        logger.debug(type(request.json))
        logger.debug("report name")
        logger.debug(request.json['report_name'])
        logger.debug("report data")
        logger.debug(request.json['report_data'])
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

