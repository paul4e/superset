from superset.reports_integration.models import ReportDefinition
from superset.views.base import SupersetModelView
from superset.constants import MODEL_VIEW_RW_METHOD_PERMISSION_MAP, RouteMethod
from superset.typing import FlaskResponse
from superset import is_feature_enabled  # , app, db
from flask_appbuilder.security.decorators import has_access
from flask_appbuilder import expose
from flask_appbuilder.models.sqla.interface import SQLAInterface
from superset.reports_integration.views.mixins import ReportDefinitionMixin


class ReportDefinitionView(SupersetModelView, ReportDefinitionMixin):
    route_base = '/report_definitions'

    datamodel = SQLAInterface(ReportDefinition)

    class_permission_name = "ReportDefinitions"
    method_permission_name = MODEL_VIEW_RW_METHOD_PERMISSION_MAP

    include_route_methods = RouteMethod.CRUD_SET | {
        "render_report",
    }

    def pre_add(self, item: "ReportDefinitionView") -> None:
        item.report_definition = bytes(item.report_definition, 'utf-8')

    @expose("/list/")
    @has_access
    def list(self) -> FlaskResponse:
        if not is_feature_enabled("ENABLE_REACT_CRUD_VIEWS"):
            return super().list()

        return super().render_app_template()

    @expose("/add/")
    @has_access
    def add(self) -> FlaskResponse:
        if not is_feature_enabled("ENABLE_REACT_CRUD_VIEWS"):
            return super().list()

        return super().render_app_template()

    @expose("/render_report/<report_definition_id>/<render_format>")
    @has_access
    def render_report(self, report_definition_id: int, render_format: str):
        return super().render_app_template()
