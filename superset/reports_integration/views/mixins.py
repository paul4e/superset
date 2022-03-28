from flask_babel import lazy_gettext as _
from superset.reports_integration.api.report_engines.filters import ReportEngineFilter
from superset.reports_integration.api.report_definitions.filters import ReportDefinitionFilter


class ReportEngineMixin:
    list_title = _("Report Engine")
    show_title = _("Show Report Engine")
    add_title = _("Add Report Engine")
    edit_title = _("Edit Report Engine")

    list_columns = [
        "verbose_name",
        "reports_engine_type",
        "creator",
        "modified",
    ]
    order_columns = [
        "verbose_name",
        "modified",
        "changed_on",
    ]
    add_columns = [
        "verbose_name",
        "reports_engine_type"
    ]
    edit_columns = add_columns
    base_order = ("changed_on", "desc")

    base_filters = [["id", ReportEngineFilter, lambda: []]]
    # label_columns = {
    # }

    # def _pre_add_update(self, database: Database) -> None:
    #     if app.config["PREVENT_UNSAFE_DB_CONNECTIONS"]:
    #         check_sqlalchemy_uri(make_url(database.sqlalchemy_uri))
    #     self.check_extra(database)
    #     self.check_encrypted_extra(database)
    #     if database.server_cert:
    #         utils.parse_ssl_cert(database.server_cert)
    #     database.set_sqlalchemy_uri(database.sqlalchemy_uri)
    #     security_manager.add_permission_view_menu("database_access", database.perm)
    #     # adding a new database we always want to force refresh schema list
    #     for schema in database.get_all_schema_names():
    #         security_manager.add_permission_view_menu(
    #             "schema_access", security_manager.get_schema_perm(database, schema)
    #         )
    #
    # def pre_add(self, database: Database) -> None:
    #     self._pre_add_update(database)
    #
    # def pre_update(self, database: Database) -> None:
    #     self._pre_add_update(database)


class ReportDefinitionMixin:
    list_title = _("Report Definition")
    show_title = _("Show Report Definition")
    add_title = _("Add Report Definition")
    edit_title = _("Edit Report Definition")

    list_columns = [
        "report_name",
        "report_title",
        "creator",
        "modified",
    ]
    order_columns = [
        "report_name",
        "report_title",
        "modified",
        "changed_on",
    ]
    show_columns = [
        "report_name",
        "report_title",
        "parameters",
        "creator",
        "modified",
    ]
    add_columns = [
        "report_name",
        "reports_engine_type",
    ]
    edit_columns = add_columns
    base_order = ("changed_on", "desc")

    base_filters = [["id", ReportDefinitionFilter, lambda: []]]
    # label_columns = {
    # }

    # def _pre_add_update(self, database: Database) -> None:
    #     if app.config["PREVENT_UNSAFE_DB_CONNECTIONS"]:
    #         check_sqlalchemy_uri(make_url(database.sqlalchemy_uri))
    #     self.check_extra(database)
    #     self.check_encrypted_extra(database)
    #     if database.server_cert:
    #         utils.parse_ssl_cert(database.server_cert)
    #     database.set_sqlalchemy_uri(database.sqlalchemy_uri)
    #     security_manager.add_permission_view_menu("database_access", database.perm)
    #     # adding a new database we always want to force refresh schema list
    #     for schema in database.get_all_schema_names():
    #         security_manager.add_permission_view_menu(
    #             "schema_access", security_manager.get_schema_perm(database, schema)
    #         )
    #
    # def pre_add(self, database: Database) -> None:
    #     self._pre_add_update(database)
    #
    # def pre_update(self, database: Database) -> None:
    #     self._pre_add_update(database)
