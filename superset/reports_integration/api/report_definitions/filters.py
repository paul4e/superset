from superset import security_manager
from superset.views.base import BaseFilter, is_user_admin
from superset.reports_integration.models import ReportDefinition
from flask_babel import lazy_gettext as _
from sqlalchemy import and_, or_
from sqlalchemy.orm.query import Query
from typing import Any, Optional


class ReportDefinitionFilter(BaseFilter):

    def apply(self, query, value):
        if is_user_admin():
            return query

        return query


class ReportDefinitionTitleOrNameFilter(BaseFilter):
    name = _("Title or Name")
    arg_name = "title_or_name"

    def apply(self, query: Query, value: Any) -> Query:
        if not value:
            return query

        ilike_value = f"%{value}%"

        return query.filter(
            or_(
                ReportDefinition.report_title.ilike(ilike_value),
                ReportDefinition.report_name.ilike(ilike_value),
            )
        )
