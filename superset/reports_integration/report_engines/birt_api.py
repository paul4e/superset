import json

from flask import request, send_file, jsonify
from flask_appbuilder.api import BaseApi, expose
import requests
from requests import Response
from io import BytesIO
from superset import app
from superset.reports_integration.api.report_definitions.dao import ReportDefinitionDAO
from superset.reports_integration.api.report_definitions.commands.exceptions import (
    ReportDefinitionNotFoundError,
)

birtengine_endpoint = app.config["BIRTENGINE_ENDPOINT"]

HOST_BIRT = birtengine_endpoint if birtengine_endpoint else "http://localhost:8081/"


class BIRTApi(BaseApi):
    route_base = '/'
    # resource_name = 'reports'
    allow_browser_login = True

    include_route_methods = {
        "images",
        "add_csv",
        "extract_params",
        "extract_params2",
    }

    @expose('/reports/images/<string:image_filename>', methods=['GET'])
    def images(self, image_filename) -> Response:

        if request.method == 'GET':
            url = f'{HOST_BIRT}reports/images/{image_filename}'
            print(request.headers)
            response = requests.get(url, headers=request.headers)
            file_content = BytesIO(response.content)
            return send_file(file_content, as_attachment=False, mimetype="image/svg+xml")
        return self.response(201, message="Hello (POST)")

    @expose('/reports/add_csv', methods=['POST'])
    def add_csv(self) -> Response:
        if request.method == 'POST':
            url = f'{HOST_BIRT}report/add_csv'
            body = {
                'csv_data': request.json['csv_data'],
                'file_name': request.json['file_name'],
            }
            headers = {'Content-Type': "application/json; charset=utf-8"}
            response = requests.post(url, headers=headers, json=body)
            try:
                print(response.headers)
                print(response.json())
                print(response.status_code)
                print(response.text)
            except Exception as e:
                print(e)
        return self.response(200, message="test")

    @expose('/reports/params2/<int:report_id>', methods=["GET"])
    def extract_params2(self, report_id) -> Response:
        url = f'{HOST_BIRT}report/parameters2'
        headers = {'Content-Type': "application/json; charset=utf-8"}
        report = ReportDefinitionDAO.find_by_id(report_id)
        if not report:
            raise ReportDefinitionNotFoundError()
        rpt_definition = report.report_definition.decode('ascii')
        body = {"name": report.report_name, "xml_report": rpt_definition}

        response = requests.get(url, headers=headers, json=body)

        return self.response(200, message="ok")

    @expose('/reports/params/<string:report_name>', methods=["GET"])
    def extract_params(self, report_name) -> Response:
        url = f'{HOST_BIRT}report/parameters/{report_name}'
        headers = {'Content-Type': "application/json; charset=utf-8"}
        # report = ReportDefinitionDAO.find_by_id(report_id)
        # if not report:
        #     raise ReportDefinitionNotFoundError()
        # rpt_definition = report.report_definition.decode('ascii')
        # body = {"name": report.report_name, "xml_report": rpt_definition}

        # response = requests.get(url, headers=headers, json=body)
        response = requests.get(url, headers=headers)

        try:
            print(response.json())
        except Exception as e:
            print(e)
        parameters = response.json()
        print(type(parameters))
        if parameters:
            return jsonify(parameters)

        return self.response(200, message="ok")


