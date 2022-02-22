
import logging
import base64

from superset.reports_integration.models.report_engines import ReportEngine
from typing import Any, Dict, List, Optional
from marshmallow import ValidationError
from superset.commands.base import BaseCommand
from flask_appbuilder.models.sqla import Model
from flask_appbuilder.security.sqla.models import User

from superset.reports_integration.api.report_engines.commands.exceptions import (
    ReportEngineRequiredFieldValidationError,
    ReportEngineInvalidError,
    ReportEngineCreateFailedError,
    ReportEngineNotFoundError
)
from superset.reports_integration.api.report_engines.dao import ReportEngineDAO
from superset.dao.exceptions import DAOCreateFailedError
from superset.reports_integration.report_engines.utils import get_report_engine

logger = logging.getLogger(__name__)


class ValidateReportDefinitionCommand(BaseCommand):
    def __init__(self, user: User, model_id: int, data: Dict[str, Any]):
        self._actor = user
        self._properties = data.copy()
        self._model_id = model_id
        self._model: Optional[ReportEngine] = None

    def run(self) -> Model:
        self.validate()

        try:
            print(self._model.reports_engine_type)
            birt_engine = get_report_engine(self._model.reports_engine_type)
            raw_report = self._properties.get("report_definition")
            # xml_report = base64.b64decode(raw_report).decode('utf-8') #

            response = birt_engine.validate_report(report_name=self._properties.get("report_name"), xml_report=raw_report)
            print(response)
            print(response.text)
            if response.text:
                return response.text
        except DAOCreateFailedError as ex:
            logger.exception(ex.exception)
            raise ReportEngineCreateFailedError()
        except Exception as e:
            logger.error(e)
        return False

    def validate(self) -> None:
        exceptions: List[ValidationError] = list()
        print(self._model_id)
        self._model = ReportEngineDAO.find_by_id(self._model_id)
        if not self._model:
            raise ReportEngineNotFoundError()

        if exceptions:
            exception = ReportEngineInvalidError()
            exception.add_list(exceptions)
            # TODO: add event logger -> see databases/commands/create 94
            raise exception
