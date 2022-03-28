import requests
import base64
import pandas as pd
from typing import Any, Optional
from requests import Response
from pathlib import Path
from dataclasses import dataclass
from superset.reports_integration.report_engines.base_engine import (
    BaseReportEngine
)
from superset.reports_integration.models.report_definitions import ReportDefinition
from superset.reports_integration.models.report_engines import ReportEngineTypes

from superset import app

BIRTENGINE_HOST = "http://localhost:8081/"
reports_path = "/home/aymaru/Documents/smartnow/proyectos/spring-boot/birtengine-test/reports"

# HOST_BIRT = "http://localhost:8081"
birtengine_endpoint = app.config["BIRTENGINE_ENDPOINT"]

HOST_BIRT = birtengine_endpoint if birtengine_endpoint else "http://localhost:8081/"
ENDPOINT_VALIDATE_BIRT = "report/validate"
ENDPOINT_RENDER_REPORT_BIRT = "report/export"


def get_birt_report_engine() -> "BIRTReportEngine":
    birt_engine = BIRTReportEngine(host=HOST_BIRT, validate_report_endpoint=ENDPOINT_VALIDATE_BIRT, render_report_endpoint=ENDPOINT_RENDER_REPORT_BIRT)
    return birt_engine


class BIRTReportEngine(BaseReportEngine):
    type = ReportEngineTypes.BIRT

    def validate_report(self, report_name: str, xml_report: str) -> Response:
        body = {"name": report_name, "xml_report": xml_report}
        url = self._host + self._validate_report_endpoint
        response = requests.post(url, json=body)
        return response

    def render_report(self, report_name: str, xml_report: str, render_type: str) -> Response:
        params = {"output": render_type}
        body = {"name": report_name, "xml_report": xml_report}
        url = self._host + self._render_report_endpoint
        response = requests.post(url=url, params=params, json=body)
        print(response)
        print(response.url)
        # print(response.json())
        # print(response.text)
        print(type(response.content))
        print(response.headers)
        return response


def save_file(file_name: str, file_format: str, response: Response):
    tmpfile: Path = Path(f'{file_name}.{file_format}')
    tmpfile.write_bytes(response.content)

    print(f"archivo {file_name} descargado en: {tmpfile.cwd()}")
    print(Path)


def test_generate_export(name, format):
    # data = ''
    with open(reports_path + f'/{name}.rptdesign', 'rb') as f:
        data = f.read()

    params = {"output": format}
    print(f"data type: {type(data)}")
    encodedData = base64.b64encode(data)
    body = {"name": name, "xml_report": encodedData}
    response = requests.post(url=BIRTENGINE_HOST + "report/export", params=params,
                             json=body)
    print(response)
    print(response.url)
    # print(response.json())
    # print(response.text)
    print(type(response.content))
    print(response.headers)
    return response


def test_extract_params_info(name):

    with open(reports_path + f'/{name}.rptdesign', 'r') as f:
        data = f.read()

    body = {"name": name, "xml_report": data}
    response = requests.get(url=BIRTENGINE_HOST + "report/parameters", json=body)
    return response


def test_get_csv_data(name):
    with open(reports_path + f'/{name}.rptdesign', 'r') as f:
        data = f.read()

    body = {"name": name, "xml_report": data}
    response = requests.get(url=BIRTENGINE_HOST + "report/data", json=body)
    return response


def test(name):
    params = {"output": "pdf"}

    response = requests.get(url=BIRTENGINE_HOST + f"report/{name}", params=params)
    print(response)
    print(response.url)
    # print(response.json())
    print(response.text)


if __name__ == "__main__":
    print("Me ejecuto")
    file_name = "TopNPercent"
    file_format = "html"
    r = test_generate_export(file_name, file_format)
    # save_file(file_name, file_format, r)

    # r = test_extract_params_info(file_name)
    # print(r)
    # print(r.text)
    # file_name = "csv_data_report"
    # r = test_get_csv_data(file_name)
    # print(r)
    # print(r.text)
