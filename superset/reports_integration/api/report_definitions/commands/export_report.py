import logging
from typing import Any, Dict, List, Optional
from superset.commands.base import BaseCommand
from superset.dao.exceptions import DAODeleteFailedError
from flask_appbuilder.models.sqla import Model
from flask_appbuilder.security.sqla.models import User

from superset.reports_integration.models import ReportDefinition
from superset.reports_integration.api.report_definitions.dao import ReportDefinitionDAO
from superset.reports_integration.api.report_definitions.commands.exceptions import (
    ReportDefinitionNotFoundError,
    ReportDefitinionDeleteFailedError
)
from superset.reports_integration.report_engines.utils import get_report_engine

logger = logging.getLogger(__name__)


class ExportReportDefinitionCommand(BaseCommand):
    def __init__(self, user: User, model_id: int, format_type: str):
        self._actor = user
        self._model_id = model_id
        self._model: Optional[ReportDefinition] = None
        self._format_type = format_type

    def run(self) -> Model:
        self.validate()

        try:
            engine_type = ReportDefinitionDAO.get_report_engine_type(self._model_id)
            print("engine_type")
            print(engine_type)
            birt_engine = get_report_engine(engine_type)
            rpt_definition = self._model.report_definition.decode('ascii')
            print("rpt_definition")
            print(type(rpt_definition))
            print(rpt_definition)
            response = birt_engine.render_report(self._model.report_name, rpt_definition, self._format_type)
            return response
        except DAODeleteFailedError as ex:
            logger.exception(ex.exception)
            raise ReportDefitinionDeleteFailedError()
        return False

    def validate(self) -> None:
        self._model = ReportDefinitionDAO.find_by_id(self._model_id)

        if not self._model:
            raise ReportDefinitionNotFoundError()
