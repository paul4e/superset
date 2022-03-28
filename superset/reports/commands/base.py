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
from typing import Any, Dict, List

from marshmallow import ValidationError

from superset.active_reports.dao import ActiveReportsDAO  # ARJS
from superset.reports_integration.api.report_definitions.dao import ReportDefinitionDAO  # BIRT
from superset.charts.dao import ChartDAO
from superset.commands.base import BaseCommand
from superset.dashboards.dao import DashboardDAO
from superset.models.reports import ReportCreationMethodType
from superset.reports.commands.exceptions import (
    ActiveReportNotFoundValidationError,
    ChartNotFoundValidationError,
    ChartNotSavedValidationError,
    DashboardNotFoundValidationError,
    DashboardNotSavedValidationError,
    ReportScheduleChartOrDashboardValidationError,
    ReportDefinitionNotFoundValidationError
)

logger = logging.getLogger(__name__)


class BaseReportScheduleCommand(BaseCommand):

    _properties: Dict[str, Any]

    def run(self) -> Any:
        pass

    def validate(self) -> None:
        pass

    def validate_chart_dashboard(
        self, exceptions: List[ValidationError], update: bool = False
    ) -> None:
        """ Validate chart or dashboard relation """
        chart_id = self._properties.get("chart")
        dashboard_id = self._properties.get("dashboard")
        creation_method = self._properties.get("creation_method")
        # ARJS
        active_report_id = self._properties.get("active_report")
        #BIRT
        report_definition_id = self._properties.get("report_definition")

        if creation_method == ReportCreationMethodType.CHARTS and not chart_id:
            # User has not saved chart yet in Explore view
            exceptions.append(ChartNotSavedValidationError())
            return

        if creation_method == ReportCreationMethodType.DASHBOARDS and not dashboard_id:
            exceptions.append(DashboardNotSavedValidationError())
            return
        
        # TODO: crear reportCreationMethodType para ARJS y BIRT, ademas de crear las excepciones NotSavedValidationError

        # if creation_method == ReportCreationMethodType.ARJS and not active_report_id:
        #     # User has not saved chart yet in Explore view
        #     exceptions.append(ChartNotSavedValidationError())
        #     return

        # if creation_method == ReportCreationMethodType.BIRT and not report_definition_id:
        #     exceptions.append(DashboardNotSavedValidationError())
        #     return

        if active_report_id:
            active_report = ActiveReportsDAO.find_by_id(active_report_id)
            if not active_report:
                exceptions.append(ActiveReportNotFoundValidationError())
            self._properties["active_report"] = active_report
        elif chart_id:
            chart = ChartDAO.find_by_id(chart_id)
            if not chart:
                exceptions.append(ChartNotFoundValidationError())
            self._properties["chart"] = chart
        elif dashboard_id:
            dashboard = DashboardDAO.find_by_id(dashboard_id)
            if not dashboard:
                exceptions.append(DashboardNotFoundValidationError())
            self._properties["dashboard"] = dashboard
        elif report_definition_id:
            report_definition = ReportDefinitionDAO.find_by_id(report_definition_id)
            if not report_definition:
                exceptions.append(ReportDefinitionNotFoundValidationError())
            self._properties["report_definition"] = report_definition
        elif not update:
            exceptions.append(ReportScheduleChartOrDashboardValidationError())
