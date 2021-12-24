import logging

from flask import Response, request, g
from flask_appbuilder.api import expose, protect
from marshmallow import ValidationError

from flask_appbuilder.models.sqla.interface import SQLAInterface
from superset.constants import MODEL_API_RW_METHOD_PERMISSION_MAP, RouteMethod
from superset.reports_integration.api.report_definitions.schemas import (
    ReportDefinitionPostSchema,
    ReportDefinitionPutSchema
)
from superset.reports_integration.models.report_definitions import ReportDefinition
from superset.reports_integration.api.report_definitions.commands.create import CreateReportDefinitionCommand
from superset.reports_integration.api.report_definitions.commands.delete import DeleteReportDefinitionCommand
from superset.reports_integration.api.report_definitions.commands.update import UpdateReportDefinitionCommand
from superset.reports_integration.api.report_definitions.commands.export_report import ExportReportDefinitionCommand
from superset.reports_integration.api.report_definitions.commands.exceptions import (
    ReportDefinitionInvalidError,
    ReportDefinitionNotFoundError,
    ReportDefitinionDeleteFailedError,
    ReportDefinitionCreateFailedError,
    ReportDefinitionUpdateFailedError,
)
from superset.reports_integration.api.report_definitions.filters import (ReportDefinitionFilter, ReportDefinitionTitleOrNameFilter)
from superset.views.filters import FilterRelatedOwners
from superset.views.base_api import (
    BaseSupersetModelRestApi,
    RelatedFieldFilter
)

logger = logging.getLogger(__name__)


class ReportDefinitionRestApi(BaseSupersetModelRestApi):
    csrf_exempt = True
    datamodel = SQLAInterface(ReportDefinition)

    include_route_methods = RouteMethod.REST_MODEL_VIEW_CRUD_SET | {
        RouteMethod.RELATED,
        "render_report",
    }

    resource_name = "report_definitions"
    class_permission_name = "ReportDefinitions"
    method_permission_name = MODEL_API_RW_METHOD_PERMISSION_MAP
    allow_browser_login = True
    base_filters = [["id", ReportDefinitionFilter, lambda: []]]

    show_columns = [
        "id",
        "report_name",
        "report_title"
    ]

    list_columns = [
        "id",
        "report_name",
        "report_title",
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

    add_columns = [
        "report_name",
        "report_definition"
    ]

    edit_columns = add_columns

    list_select_columns = list_columns + ["changed_on", "changed_by_fk"]

    order_columns = [
        "id",
        "report_name",
        "report_title",
        "changed_on_delta_humanized",
    ]

    base_order = ("changed_on", "desc")

    add_model_schema = ReportDefinitionPostSchema()
    edit_model_schema = ReportDefinitionPutSchema()

    search_columns = (
        "id",
        "report_name",
        "report_title",
        "created_by",
        "changed_by",
        "owners",
    )

    search_filters = {
        "report_title": [ReportDefinitionTitleOrNameFilter],
        "report_name": [ReportDefinitionTitleOrNameFilter],
    }

    allowed_rel_fields = {"owners", "created_by"}

    related_field_filters = {
        "owners": RelatedFieldFilter("first_name", FilterRelatedOwners),
        "created_by": RelatedFieldFilter("first_name", FilterRelatedOwners),
    }

    @expose("/", methods=["POST"])
    @protect()
    def post(self) -> Response:
        """Creates a new ReportDefinition
        ---
        post:
          description: >-
            Create a new ReportDefinition.
          requestBody:
            description: ReportDefinition schema
            required: true
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/{{self.__class__.__name__}}.post'
          responses:
            201:
              description: ReportDefinition added
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      id:
                        type: number
                      result:
                        $ref: '#/components/schemas/{{self.__class__.__name__}}.post'
            302:
              description: Redirects to the current digest
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
        except ValidationError as error:
            return self.response_400(message=error.messages)

        try:
            new_model = CreateReportDefinitionCommand(g.user, item).run()
            return self.response(201, id=new_model.id, result=item)
        except ReportDefinitionInvalidError as ex:
            return self.response_422(message=ex.normalized_messages())
        except ReportDefinitionCreateFailedError as ex:
            logger.error(
                "Error creating model %s: %s",
                self.__class__.__name__,
                str(ex),
                exc_info=True,
            )

    @expose("/", methods=["PUT"])
    @protect()
    def put(self, pk: int) -> Response:
        """Changes a ReportDefinition
        ---
        put:
          description: >-
            Changes a ReportDefinition.
          parameters:
          - in: path
            schema:
              type: integer
            name: pk
          requestBody:
            description: ReportDefinition schema
            required: true
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/{{self.__class__.__name__}}.put'
          responses:
            200:
              description: ReportDefinition changed
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
            422:
              $ref: '#/components/responses/422'
            500:
              $ref: '#/components/responses/500'
        """
        if not request.is_json:
            return self.response_400(message="Request is not JSON")

        try:
            item = self.edit_model_schema.load(request.json)
        except ValidationError as error:
            return self.response_400(message=error.messages)

        try:
            changed_model = UpdateReportDefinitionCommand(g.user, pk, item).run()
            return self.response(200, id=changed_model.id, result=item)
        except ReportDefinitionNotFoundError:
            return self.response_404()
        except ReportDefinitionInvalidError as ex:
            return self.response_422(message=ex.normalized_messages())
        except ReportDefinitionUpdateFailedError as ex:
            logger.error(
                "Error updating model %s: %s",
                self.__class__.__name__,
                str(ex),
                exc_info=True,
            )

    @expose("/", methods=["DELETE"])
    @protect()
    def delete(self, pk: int) -> Response:
        """Deletes a ReportDefinition
        ---
        delete:
          description: >-
            Deletes a ReportDefinition.
          parameters:
          - in: path
            schema:
              type: integer
            name: pk
          responses:
            200:
              description: ReportDefinition deleted
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      message:
                        type: string
            401:
              $ref: '#/components/responses/401'
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
            DeleteReportDefinitionCommand(g.user, pk).run()
            return self.response(200, message="OK")
        except ReportDefinitionNotFoundError:
            return self.response_404()
        except ReportDefitinionDeleteFailedError as ex:
            logger.error(
                "Error deleting model %s: %s",
                self.__class__.__name__,
                str(ex),
                exc_info=True,
            )

    @expose("/render/<int:pk>/<string:format_type>", methods=["GET"])
    @protect()
    def render_report(self, pk: int, format_type: str) -> Response:
        # if not request.is_json:
        #     return self.response_400(message="Request is not JSON")

        # try:
        #     item = ValidateReportSchema().load(request.json)
        # except ValidationError as error:
        #     return self.response_400(message=error.messages)

        try:
            response = ExportReportDefinitionCommand(g.user, pk, format_type).run()
            if response:
                body = {
                    "content": response.content
                }
                return self.response(200, json=body)
            else:
                self.response_400(message="Reporte invalido")
        except Exception as e:
            return self.response_400(message=e.messages)
