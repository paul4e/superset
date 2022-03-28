import logging

from flask import Response, request, g
from flask_appbuilder.api import expose, protect
from marshmallow import ValidationError

from flask_appbuilder.models.sqla.interface import SQLAInterface
from superset.constants import MODEL_API_RW_METHOD_PERMISSION_MAP, RouteMethod
from superset.reports_integration.api.report_engines.schemas import (
    ReportEnginesPostSchema,
    ReportEnginesPutSchema,
    ValidateReportSchema,
)
from superset.reports_integration.models.report_engines import ReportEngine
from superset.reports_integration.api.report_engines.filters import (ReportEngineFilter, ReportEngineNameFilter)
from superset.reports_integration.api.report_engines.commands.create import CreateReportEngineCommand
from superset.reports_integration.api.report_engines.commands.update import UpdateReportEngineCommand
from superset.reports_integration.api.report_engines.commands.delete import DeleteReportEngineCommand
from superset.reports_integration.api.report_engines.commands.validate_report import ValidateReportDefinitionCommand
from superset.reports_integration.api.report_engines.commands.exceptions import (
    ReportEngineDeleteFailedError,
    ReportEngineNotFoundError,
    ReportEngineInvalidError,
    ReportEngineCreateFailedError,
    ReportEngineUpdateFailedError
)
from superset.views.filters import FilterRelatedOwners
from superset.views.base_api import (
    BaseSupersetModelRestApi,
    RelatedFieldFilter
)

logger = logging.getLogger(__name__)


class ReportEngineRestApi(BaseSupersetModelRestApi):
    datamodel = SQLAInterface(ReportEngine)

    include_route_methods = RouteMethod.REST_MODEL_VIEW_CRUD_SET | {
        RouteMethod.RELATED,
        'validate_report',
    }

    resource_name = "report_engines"
    class_permission_name = "ReportEngines"
    method_permission_name = MODEL_API_RW_METHOD_PERMISSION_MAP
    allow_browser_login = True
    base_filters = [["id", ReportEngineFilter, lambda: []]]

    show_columns = [
        "id",
        "verbose_name",
        "reports_engine_type",
        "owners.first_name",
        "owners.id",
        "owners.last_name",
        "owners.username",
        "description",
    ]

    list_columns = [
        "id",
        "verbose_name",
        "reports_engine_type",
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
        "reports_engine_type",
        "description",
    ]

    add_columns = [
        "verbose_name",
        "reports_engine_type",
        "owners",
    ]

    edit_columns = add_columns

    list_select_columns = list_columns + ["changed_on", "changed_by_fk"]

    order_columns = [
        "id",
        "verbose_name",
        "reports_engine_type",
        "changed_on_delta_humanized",
    ]

    base_order = ("changed_on", "desc")

    add_model_schema = ReportEnginesPostSchema()
    edit_model_schema = ReportEnginesPutSchema()

    search_columns = (
        "id",
        "verbose_name",
        "reports_engine_type",
        "created_by",
        "changed_by",
        "owners",
    )

    search_filters = {
        "verbose_name": [ReportEngineNameFilter],
    }

    allowed_rel_fields = {"owners", "created_by"}
    related_field_filters = {
        "owners": RelatedFieldFilter("first_name", FilterRelatedOwners),
        "created_by": RelatedFieldFilter("first_name", FilterRelatedOwners),
    }

    @expose("/", methods=["POST"])
    @protect()
    def post(self) -> Response:
        """Creates a new ReportEngine
        ---
        post:
          description: >-
            Create a new ReportEngine.
          requestBody:
            description: ReportEngine schema
            required: true
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/{{self.__class__.__name__}}.post'
          responses:
            201:
              description: ReportEngine added
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
        print(request.json)
        try:
            item = self.add_model_schema.load(request.json)
        except ValidationError as error:
            return self.response_400(message=error.messages)

        try:
            new_model = CreateReportEngineCommand(g.user, item).run()
            return self.response(201, id=new_model.id, result=item)
        except ReportEngineInvalidError as ex:
            return self.response_422(message=ex.normalized_messages())
        except ReportEngineCreateFailedError as ex:
            logger.error(
                "Error creating model %s: %s",
                self.__class__.__name__,
                str(ex),
                exc_info=True,
            )

    @expose("/<int:pk>", methods=["PUT"])
    @protect()
    def put(self, pk: int) -> Response:
        """Changes a ReportEngine
        ---
        put:
          description: >-
            Changes a ReportEngine.
          parameters:
          - in: path
            schema:
              type: integer
            name: pk
          requestBody:
            description: ReportEngine schema
            required: true
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/{{self.__class__.__name__}}.put'
          responses:
            200:
              description: ReportEngine changed
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
            changed_model = UpdateReportEngineCommand(g.user, pk, item).run()
            return self.response(200, id=changed_model.id, result=item)
        except ReportEngineNotFoundError:
            return self.response_404()
        except ReportEngineInvalidError as ex:
            return self.response_422(message=ex.normalized_messages())
        except ReportEngineUpdateFailedError as ex:
            logger.error(
                "Error updating model %s: %s",
                self.__class__.__name__,
                str(ex),
                exc_info=True,
            )
            return self.response_422(messages=str(ex))

    @expose("/<int:pk>", methods=["DELETE"])
    @protect()
    def delete(self, pk: int) -> Response:
        """Deletes a ReportEngine
        ---
        delete:
          description: >-
            Deletes a ReportEngine.
          parameters:
          - in: path
            schema:
              type: integer
            name: pk
          responses:
            200:
              description: ReportEngine deleted
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
            DeleteReportEngineCommand(g.user, pk).run()
            return self.response(200, message="OK")
        except ReportEngineNotFoundError:
            return self.response_404()
        except ReportEngineDeleteFailedError as ex:
            logger.error(
                "Error deleting model %s: %s",
                self.__class__.__name__,
                str(ex),
                exc_info=True,
            )
            return self.response_422(message=str(ex))

    @expose("/<int:pk>/validate/", methods=["POST"])
    @protect()
    def validate_report(self, pk: int) -> Response:
        if not request.is_json:
            return self.response_400(message="Request is not JSON")

        try:
            item = ValidateReportSchema().load(request.json)
        except ValidationError as error:
            return self.response_400(message=error.messages)

        try:
            status = ValidateReportDefinitionCommand(g.user, pk, item).run()
            if status:
                body = {
                    "is_valid": True if status == 'valid' else False,
                    "report_name": item.get("report_name")
                }
                return self.response(200, json=body)
            else:
                self.response_400(message="Reporte invalido")
        except Exception as e:
            return self.response_400(message=e.messages)
