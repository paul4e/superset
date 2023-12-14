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
import json
import logging
from datetime import datetime
from io import BytesIO
from typing import Any, Dict
from zipfile import ZipFile

from flask import g, make_response, redirect, request, Response, send_file, url_for
from flask_appbuilder.api import BaseApi, expose, protect, rison, safe
from flask_appbuilder.models.sqla.interface import SQLAInterface

from superset.dashboards.commands.update import UpdateDashboardCommand
from superset.dashboards.dao import DashboardDAO

from marshmallow import fields, post_load, Schema
from marshmallow.validate import Length, ValidationError

from superset.models.dashboard import Dashboard

from superset.extensions import db

logger = logging.getLogger(__name__)

class BaseSmartnowDashboardSchema(Schema):
    # pylint: disable=no-self-use,unused-argument
    @post_load
    def post_load(self, data: Dict[str, Any], **kwargs: Any) -> Dict[str, Any]:
        print("Doing something post load")
        return data

class UpdateBannerPostSchema(BaseSmartnowDashboardSchema):
    dashboard_banner = fields.String(
        description="dashboard_title_description",
        allow_none=True,
        validate=Length(0, 250),
    )
    dashboards_ids = fields.List(fields.Integer(description="List ", allow_none=True))

class SmartnowDashboardApi(BaseApi):

    route_base = '/dashboards'

    @expose('/update_banner', methods=["POST"])
    # @protect(allow_browser_login=True)
    def update_banner(self):
        if request.is_json:
            item = UpdateBannerPostSchema().load(request.json)

            try:
                dash_ids = item["dashboards_ids"]
                dashboards = DashboardDAO.find_by_ids(dash_ids)
            except KeyError as e:
                dashboards = DashboardDAO.find_all()

            for dash in dashboards:
                metadata = json.loads(dash.json_metadata)
                metadata["information"] = item["dashboard_banner"]
                str_metadata = json.dumps(metadata)

                properties_dict = {
                    "json_metadata": str_metadata
                }

                DashboardDAO.update(dash, properties=properties_dict, commit=True)
        return self.response(200, message="ok")
