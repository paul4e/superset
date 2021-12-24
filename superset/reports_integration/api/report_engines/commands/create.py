
import logging
from typing import Any, Dict, List, Optional
from marshmallow import ValidationError
from superset.commands.base import BaseCommand
from flask_appbuilder.models.sqla import Model
from flask_appbuilder.security.sqla.models import User

from superset.reports_integration.api.report_engines.commands.exceptions import (
    ReportEngineRequiredFieldValidationError,
    ReportEngineInvalidError,
    ReportEngineCreateFailedError
)
from superset.reports_integration.api.report_engines.dao import ReportEngineDAO
from superset.dao.exceptions import DAOCreateFailedError

logger = logging.getLogger(__name__)


class CreateReportEngineCommand(BaseCommand):
    def __init__(self, user: User, data: Dict[str, Any]):
        self._actor = user
        self._properties = data.copy()

    def run(self) -> Model:
        self.validate()

        try:
            report_engine = ReportEngineDAO.create(self._properties)
        except DAOCreateFailedError as ex:
            logger.exception(ex.exception)
            raise ReportEngineCreateFailedError()
        return report_engine

    def validate(self) -> None:
        exceptions: List[ValidationError] = list()
        reports_engine_type: Optional[str] = self._properties.get("reports_engine_type")

        if not reports_engine_type:
            exceptions.append(ReportEngineRequiredFieldValidationError("reports_engine_type"))

        if exceptions:
            exception = ReportEngineInvalidError()
            exception.add_list(exceptions)
            # TODO: add event logger -> see databases/commands/create 94
            raise exception
