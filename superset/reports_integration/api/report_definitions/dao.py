import logging
from typing import Any, Dict, Optional, List

from superset.dao.base import BaseDAO
from superset.extensions import db
from superset.reports_integration.models import ReportDefinition, ReportEngine
from superset.reports_integration.api.report_definitions.filters import ReportDefinitionFilter
from superset.reports_integration.api.report_engines.commands.exceptions import ReportEngineNotFoundError
logger = logging.getLogger(__name__)


class ReportDefinitionDAO(BaseDAO):
    model_cls = ReportDefinition
    base_filter = ReportDefinitionFilter

    @staticmethod
    def get_report_engine_type(report_def_id: int):
        rdf = db.session.query(ReportDefinition).filter(ReportDefinition.id == report_def_id).one()
        # reports_engine = db.session.query(ReportEngine.reports_engine_type).filter(rdf.id in ReportEngine.report_definitions).one()
        engine_type = rdf.engines[0].reports_engine_type
        return engine_type

    @staticmethod
    def update_report_engines_for_report(report_engine_ids: List[int]) -> List[ReportEngine]:
        print("report_engine_ids")
        print(report_engine_ids)
        report_engines = db.session.query(ReportEngine).filter(ReportEngine.id.in_(report_engine_ids)).all()
        if not report_engines:
            raise ReportEngineNotFoundError()
        return report_engines


