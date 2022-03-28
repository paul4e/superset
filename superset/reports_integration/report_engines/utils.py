from superset.reports_integration.models.report_engines import ReportEngineTypes
from superset.reports_integration.report_engines.base_engine import BaseReportEngine
from superset.reports_integration.report_engines.birt_engine import \
    get_birt_report_engine


def get_report_engine(report_engine_type: ReportEngineTypes) -> "BaseReportEngine":
    print('Generando birt engine')
    print(report_engine_type)
    print(ReportEngineTypes.BIRT)
    if report_engine_type == ReportEngineTypes.BIRT:
        print('Generando birt engine 2')
        report_engine = get_birt_report_engine()
        return report_engine
