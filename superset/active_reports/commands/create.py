# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

import logging
from datetime import datetime

from superset.commands.utils import populate_owners
from typing import Any, Dict, List, Optional

from flask_appbuilder.models.sqla import Model
from flask_appbuilder.security.sqla.models import User
from marshmallow import ValidationError

from superset.commands.base import BaseCommand
from superset.dao.exceptions import DAOCreateFailedError

from superset.active_reports.dao import ActiveReportsDAO
from superset.active_reports.commands.exceptions import ActiveReportCreateFailedError, ActiveReportInvalidError


logger = logging.getLogger(__name__)


class CreateActiveReportCommand(BaseCommand):
    def __init__(self, user: User, data: Dict[str, Any]):
        self._actor = user
        self._properties = data.copy()

    def run(self) -> Model:
        self.validate()
        try:
            report = ActiveReportsDAO.create(self._properties)
            report = ActiveReportsDAO.update_charts_owners(report, commit=True)
        except DAOCreateFailedError as ex:
            logger.exception(ex.exception)
            raise ActiveReportCreateFailedError()
        return report

    def validate(self) -> None:
        exceptions: List[ValidationError] = list()
        owner_ids: Optional[List[int]] = self._properties.get("owners")
        slices_id: Optional[List[int]] = self._properties.get('slices')

        try:
            owners = populate_owners(self._actor, owner_ids)
            self._properties["owners"] = owners
        except ValidationError as ex:
            exceptions.append(ex)
        if exceptions:
            exception = ActiveReportInvalidError()
            exception.add_list(exceptions)
            raise exception

        # Populate Charts
        try:
            slices = ActiveReportsDAO.update_charts_for_report(slices_id)
            self._properties["slices"] = slices
        except Exception as e:
            raise e


