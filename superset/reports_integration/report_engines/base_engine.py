from requests import Response
from typing import Any, List, Optional, Type
from superset.reports_integration.models.report_engines import ReportEngineTypes


class BaseReportEngine:

    type: Optional[ReportEngineTypes] = None

    def validate_report(self, report_name: str, xml_report: str) -> Response:
        raise NotImplementedError()

    # def extract_parameters_info(self, report_definition: ReportDefinition) -> None:
    #     raise NotImplementedError()
    #
    # def extract_result_sets_info(self, report_definition: ReportDefinition) -> None:
    #     raise NotImplementedError()
    #
    # def export_all_result_sets_to_csv(self, report_definition: ReportDefinition) -> None:
    #     raise NotImplementedError()
    #
    # def export_result_set_to_csv(self, report_definition: ReportDefinition, result_set: str) -> None:
    #     raise NotImplementedError()
    #
    def render_report(self, report_name: str, xml_report: str, render_type: str) -> Response:
        raise NotImplementedError()
    #
    # def export_report(self, report_definition: ReportDefinition) -> None:
    #     raise NotImplementedError()
    #
    def __init__(
        self, host: str, validate_report_endpoint: str, render_report_endpoint: str
    ) -> None:
        self._host = host
        self._validate_report_endpoint = validate_report_endpoint
        self._render_report_endpoint = render_report_endpoint

