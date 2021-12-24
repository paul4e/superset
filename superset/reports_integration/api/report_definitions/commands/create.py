import logging
from typing import Any, Dict, List, Optional
from marshmallow.validate import ValidationError
from superset.commands.base import BaseCommand
from flask_appbuilder.models.sqla import Model
from flask_appbuilder.security.sqla.models import User

from superset.reports_integration.api.report_definitions.commands.exceptions import (
    ReportDefinitionRequiredFieldValidationError,
    ReportDefinitionInvalidError,
    ReportDefinitionCreateFailedError
)

from superset.reports_integration.api.report_definitions.dao import ReportDefinitionDAO
from superset.dao.exceptions import DAOCreateFailedError
from superset.commands.utils import populate_owners

logger = logging.getLogger(__name__)


class CreateReportDefinitionCommand(BaseCommand):
    def __init__(self, user: User, data: Dict[str, Any]):
        self._actor = user
        self._properties = data.copy()

    def run(self) -> Model:
        self.validate()
        try:
            report_definition = ReportDefinitionDAO.create(self._properties)
        except DAOCreateFailedError as ex:
            logger.exception(ex.exception)
            raise ReportDefinitionCreateFailedError()
        return report_definition

    def validate(self) -> None:
        exceptions: List[ValidationError] = list()
        report_name: Optional[str] = self._properties.get("report_name")
        report_title: Optional[str] = self._properties.get("report_title")
        report_definition: Optional[str] = self._properties.get("report_definition")
        owner_ids: Optional[List[int]] = self._properties.get("owners")
        engines_ids: Optional[List[int]] = self._properties.get("engines")

        if not report_name:
            exceptions.append(
                ReportDefinitionRequiredFieldValidationError("report_name"))
        if not report_title:
            exceptions.append(
                ReportDefinitionRequiredFieldValidationError("report_title"))

        if not report_definition:
            exceptions.append(ReportDefinitionRequiredFieldValidationError("report_definition"))
        else:
            print("report_definition")
            print(type(report_definition))
            print(report_definition)
            # print(report_definition)
            rd64_bytes = report_definition.encode('ascii')
            print("rd64_bytes")
            print(type(rd64_bytes))
            print(rd64_bytes)
            self._properties["report_definition"] = rd64_bytes

        try:
            owners = populate_owners(self._actor, owner_ids)
            self._properties["owners"] = owners
        except ValidationError as ex:
            exceptions.append(ex)

        try:
            engines = ReportDefinitionDAO.update_report_engines_for_report(engines_ids)
            self._properties["engines"] = engines
        except Exception as ex:
            exceptions.append(ex)

        if exceptions:
            exception = ReportDefinitionInvalidError()
            exception.add_list(exceptions)
            # TODO: add event logger -> see databases/commands/create 94
            raise exception


