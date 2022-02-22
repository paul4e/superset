import logging
from typing import Any, Dict, List, Optional
from superset.commands.base import BaseCommand
from superset.commands.utils import populate_owners

from flask_appbuilder.models.sqla import Model
from flask_appbuilder.security.sqla.models import User
from marshmallow import ValidationError

from superset.dao.exceptions import DAOUpdateFailedError

from superset.reports_integration.models import ReportDefinition
from superset.reports_integration.api.report_definitions.dao import ReportDefinitionDAO
from superset.reports_integration.api.report_definitions.commands.exceptions import (
    ReportDefinitionNotFoundError,
    ReportDefinitionInvalidError,
    ReportDefinitionForbiddenError,
    ReportDefinitionUpdateFailedError,

)
from superset.exceptions import SupersetSecurityException
from superset.views.base import check_ownership
logger = logging.getLogger(__name__)


class UpdateReportDefinitionCommand(BaseCommand):
    def __init__(self, user: User, model_id: int, data: Dict[str, Any]):
        self._actor = user
        self._properties = data.copy()
        self._model_id = model_id
        self._model: Optional[ReportDefinition] = None

    def run(self) -> Model:
        self.validate()
        try:
            report_definition = ReportDefinitionDAO.update(self._model, self._properties)
        except DAOUpdateFailedError as ex:
            logger.exception(ex.exception)
            raise ReportDefinitionUpdateFailedError()
        return report_definition

    def validate(self) -> None:
        exceptions: List[ValidationError] = list()
        owner_ids: Optional[List[int]] = self._properties.get("owners")

        self._model = ReportDefinitionDAO.find_by_id(self._model_id)
        if not self._model:
            raise ReportDefinitionNotFoundError()

        # Check ownership
        try:
            check_ownership(self._model)
        except SupersetSecurityException:
            raise ReportDefinitionForbiddenError()

        # Validate/Populate owner
        try:
            owners = populate_owners(self._actor, owner_ids)
            self._properties["owners"] = owners
        except ValidationError as ex:
            exceptions.append(ex)

        if exceptions:
            exception = ReportDefinitionInvalidError()
            exception.add_list(exceptions)
            raise exception
