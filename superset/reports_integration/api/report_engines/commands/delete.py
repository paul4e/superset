import logging
from typing import Any, Dict, List, Optional
from superset.commands.base import BaseCommand
from superset.dao.exceptions import DAODeleteFailedError
from flask_appbuilder.models.sqla import Model
from flask_appbuilder.security.sqla.models import User

from superset.reports_integration.models import ReportEngine
from superset.reports_integration.api.report_engines.dao import ReportEngineDAO
from superset.reports_integration.api.report_engines.commands.exceptions import (
    ReportEngineNotFoundError,
    ReportEngineDeleteFailedError
)

logger = logging.getLogger(__name__)


class DeleteReportEngineCommand(BaseCommand):
    def __init__(self, user: User, model_id: int):
        self._actor = user
        self._model_id = model_id
        self._model: Optional[ReportEngine] = None

    def run(self) -> Model:
        self.validate()
        try:
            report_engine = ReportEngineDAO.delete(self._model)
        except DAODeleteFailedError as ex:
            logger.exception(ex.exception)
            raise ReportEngineDeleteFailedError()
        return report_engine

    def validate(self) -> None:
        self._model = ReportEngineDAO.find_by_id(self._model_id)

        if not self._model:
            raise ReportEngineNotFoundError()

        # # Check there are no associated ReportSchedules
        # reports = ReportScheduleDAO.find_by_database_id(self._model_id)
        #
        # if reports:
        #     report_names = [report.name for report in reports]
        #     raise DatabaseDeleteFailedReportsExistError(
        #         _("There are associated alerts or reports: %s" % ",".join(
        #             report_names))
        #     )

