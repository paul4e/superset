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
from typing import List, Optional, TYPE_CHECKING

from sqlalchemy.exc import SQLAlchemyError

from superset import security_manager
from superset.active_reports.commands.exceptions import ActiveReportNotFoundError
from superset.active_reports.filters import ActiveReportAccessFilter
from superset.charts.commands.exceptions import ChartNotFoundError
from superset.dao.base import BaseDAO
from superset.extensions import db
from superset.models.active_reports import ActiveReport
from superset.models.slice import Slice

if TYPE_CHECKING:
    from superset.connectors.base.models import BaseDatasource

logger = logging.getLogger(__name__)


class ActiveReportsDAO(BaseDAO):
    model_cls = ActiveReport
    base_filter = ActiveReportAccessFilter

    # include_route_methods
    @staticmethod
    def update_charts_owners(model: ActiveReport, commit: bool = True) -> ActiveReport:
        owners = list(model.owners)
        for slc in model.slices:
            slc.owners = list(set(owners) | set(slc.owners))
        if commit:
            db.session.commit()
        return model

    @staticmethod
    def get_by_id(report_id: str) -> ActiveReport:
        report = (
            db.session.query(ActiveReport)
            .filter(ActiveReport.id == report_id)
            .one_or_none()
        )
        if not report:
            raise ActiveReportNotFoundError()
        # security_manager.raise_for_dashboard_access(dashboard)
        return report

    @staticmethod
    def get_charts_for_report(report_id: str) -> List[Slice]:
        try:
            slices = ActiveReportsDAO.get_by_id(report_id).slices
        except Exception as e:
            return e
        return slices

    @staticmethod
    def update_charts_for_report(slices_id: List[int]) -> List[Slice]:
        slices = db.session.query(Slice).filter(Slice.id.in_(slices_id)).all()
        if not slices:
            raise ChartNotFoundError()
        return slices
