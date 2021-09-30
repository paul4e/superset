# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
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
from typing import Any, Dict, List, Optional

from flask_appbuilder.models.sqla import Model
from flask_appbuilder.security.sqla.models import User
from marshmallow import ValidationError

from superset.commands.base import BaseCommand
from superset.dao.exceptions import DAOUpdateFailedError

from superset.models.active_reports import ActiveReport
from superset.active_reports.dao import ActiveReportsDAO
from superset.active_reports.commands.exceptions import (
    ActiveReportNotFoundError,
    ActiveReportUpdateFailedError,
)

logger = logging.getLogger(__name__)


class UpdateActiveReportCommand(BaseCommand):
    def __init__(self, user: User, model_id: int, data: Dict[str, Any]):
        self._actor = user
        self._model_id = model_id
        self._properties = data.copy()
        self._model: Optional[ActiveReport] = None

    def run(self) -> Model:
        self.validate()
        try:
            chart = ActiveReportsDAO.update(self._model, self._properties)
        except DAOUpdateFailedError as ex:
            logger.exception(ex.exception)
            raise ActiveReportUpdateFailedError()
        return chart

    def validate(self) -> None:
        exceptions: List[ValidationError] = list()
        owner_ids: Optional[List[int]] = self._properties.get("owners")

        # Validate/populate model exists
        self._model = ActiveReportsDAO.find_by_id(self._model_id)
        if not self._model:
            raise ActiveReportNotFoundError()
        # Check ownership
        # try:
        #     check_ownership(self._model)
        # except SupersetSecurityException:
        #     raise ChartForbiddenError()

       # # Validate/Populate owner
       #  try:
       #      owners = populate_owners(self._actor, owner_ids)
       #      self._properties["owners"] = owners
       #  except ValidationError as ex:
       #      exceptions.append(ex)
       #  if exceptions:
       #      exception = ChartInvalidError()
       #      exception.add_list(exceptions)
       #      raise exception
