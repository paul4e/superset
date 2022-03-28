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

logger = logging.getLogger(__name__)


class DeleteReportDefinitionCommand(BaseCommand):
    def __init__(self, user: User, model_id: int):
        self._actor = user
        self._model_id = model_id
        self._model: Optional[ReportDefinition] = None

    def run(self) -> Model:
        self.validate()

        try:
            report_definition = ReportDefinitionDAO.delete(self._model)
        except DAODeleteFailedError as ex:
            logger.exception(ex.exception)
            raise ReportDefitinionDeleteFailedError()
        return report_definition

    def validate(self) -> None:
        self._model = ReportDefinitionDAO.find_by_id(self._model_id)

        if not self._model:
            raise ReportDefinitionNotFoundError()
