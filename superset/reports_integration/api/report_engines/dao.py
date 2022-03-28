import logging
from typing import Any, Dict, Optional

from superset.dao.base import BaseDAO
from superset.extensions import db
from superset.reports_integration.models import ReportEngine
from superset.reports_integration.api.report_engines.filters import ReportEngineFilter

logger = logging.getLogger(__name__)


class ReportEngineDAO(BaseDAO):
    model_cls = ReportEngine
    base_filter = ReportEngineFilter
