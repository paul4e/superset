import logging
from typing import Any, Dict, List, Optional
from superset.commands.base import BaseCommand

from flask_appbuilder.models.sqla import Model
from flask_appbuilder.security.sqla.models import User
from marshmallow import ValidationError

from superset.dao.exceptions import DAOUpdateFailedError

from superset.reports_integration.models import ReportEngine
from superset.reports_integration.api.report_engines.dao import ReportEngineDAO
from superset.reports_integration.api.report_engines.commands.exceptions import (
    ReportEngineNotFoundError,
    ReportEngineInvalidError
)

logger = logging.getLogger(__name__)


class UpdateReportEngineCommand(BaseCommand):
    def __init__(self, user: User, model_id: int, data: Dict[str, Any]):
        self._actor = user
        self._properties = data.copy()
        self._model_id = model_id
        self._model: Optional[ReportEngine] = None

    def run(self) -> Model:
        self.validate()
        try:
            ReportEngineDAO.update(self._model, self._properties)
        except DAOUpdateFailedError as ex:
            logger.exception(ex.exception)
            raise

    def validate(self) -> None:
        exceptions: List[ValidationError] = list()

        self._model = ReportEngineDAO.find_by_id(self._model_id)
        if not self._model:
            raise ReportEngineNotFoundError()

        if exceptions:
            exception = ReportEngineInvalidError()
            exception.add_list(exceptions)
            raise exception

