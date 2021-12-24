from superset import security_manager
from superset.views.base import BaseFilter, is_user_admin

from superset.reports_integration.models import ReportEngine
from flask_babel import lazy_gettext as _
from sqlalchemy import and_, or_
from sqlalchemy.orm.query import Query
from typing import Any, Optional


class ReportEngineFilter(BaseFilter):

    def apply(self, query, value):
        if is_user_admin():
            return query

        return query


class ReportEngineNameFilter(BaseFilter):
    name = _("Report Engine Name")
    arg_name = "engine_name"

    def apply(self, query: Query, value: Any) -> Query:
        if not value:
            return query

        ilike_value = f"%{value}%"

        return query.filter(
            or_(
                ReportEngine.verbose_name.ilike(ilike_value),
            )
        )
