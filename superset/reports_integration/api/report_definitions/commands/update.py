import logging
from typing import Any, Dict, List, Optional
from superset.commands.base import BaseCommand

from flask_appbuilder.models.sqla import Model
from flask_appbuilder.security.sqla.models import User
from marshmallow import ValidationError

from superset.dao.exceptions import DAOUpdateFailedError

from superset.reports_integration.models import ReportDefinition
from superset.reports_integration.api.report_definitions.dao import ReportDefinitionDAO
from superset.reports_integration.api.report_definitions.commands.exceptions import (
    ReportDefinitionNotFoundError,
    ReportDefinitionInvalidError,
)

logger = logging.getLogger(__name__)


class UpdateReportDefinitionCommand(BaseCommand):
    def __init__(self, user: User, model_id: int, data: Dict[str, Any]):
        self._actor = user
        self._properties = data.copy()
        self._model_id = model_id
        self._model = Optional[ReportDefinition] = None

    def run(self) -> Model:
        self.validate()
        pass

    def validate(self) -> None:
        exceptions: List[ValidationError] = list()

        self._model = ReportDefinitionDAO.find_by_id(self._model_id)
        if not self._model:
            raise ReportDefinitionNotFoundError()

        if exceptions:
            exception = ReportDefinitionInvalidError()
            exception.add_list(exceptions)
            raise exception
