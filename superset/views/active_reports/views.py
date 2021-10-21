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

import simplejson as json
import logging
from flask_appbuilder import expose, has_access
from flask import g

from flask_babel import lazy_gettext as _
from superset.utils import core as utils

from flask_appbuilder.models.sqla.interface import SQLAInterface
from superset.typing import FlaskResponse
from superset.views.active_reports.mixin import ActiveReportsMixin
from superset.constants import RouteMethod, MODEL_VIEW_RW_METHOD_PERMISSION_MAP
from superset.views.base import (
    SupersetModelView,
    check_ownership,
    common_bootstrap_payload,
)
from superset.views.utils import (
    bootstrap_user_data,
)
from superset.models.active_reports import ActiveReport
from superset import is_feature_enabled, security_manager
from superset.models.slice import Slice
from superset import db
from sqlalchemy import and_, or_

logger = logging.getLogger(__name__)


class ActiveReports(SupersetModelView, ActiveReportsMixin):
    route_base = '/active_reports'
    datamodel = SQLAInterface(ActiveReport)
    include_route_methods = RouteMethod.CRUD_SET | {
        "viewer",
        "list_react",
        "report",
    }
    class_permission_name = "Active_report"
    method_permission_name = MODEL_VIEW_RW_METHOD_PERMISSION_MAP

    def pre_update(self, item: "SliceModelView") -> None:
        # utils.validate_json(item.params)
        check_ownership(item)

    def pre_delete(self, item: "SliceModelView") -> None:
        check_ownership(item)

    def render_app_template(self) -> FlaskResponse:
        payload = {
            "user": bootstrap_user_data(g.user, include_perms=True),
            "common": common_bootstrap_payload(),
        }

        return self.render_template(
            "superset/basic.html",
            title=_("Active Reports").__str__(),
            entry="activeReports",
            bootstrap_data=json.dumps(
                payload, default=utils.pessimistic_json_iso_dttm_ser
            )
        )

    @expose('/viewer/')
    def viewer(self):
        return self.render_app_template()

    @expose("/list_react/")
    def list_react(self) -> FlaskResponse:
        return self.render_app_template()

    @expose("/add", methods=["GET", "POST"])
    def add(self) -> FlaskResponse:
        datasources = [d.id for d in security_manager.get_user_datasources()]

        datasets = db.session.query(Slice).filter(
            and_(
                Slice.viz_type == 'table',
                or_(
                    Slice.datasource_id.in_(datasources)
                ))) \
            .all()

        datasets = [
            {"value": str(d.id) + "__" + d.slice_name, "label": repr(d)}
            for d in datasets
        ]

        templates = db.session.query(ActiveReport).filter(
            ActiveReport.is_template == True
        ).all()

        templates = [
            {"id": template.id, "name": template.report_name, "report": template.report_data}
            for template in templates
        ]

        payload = {
            "datasets": sorted(
                datasets,
                key=lambda d: d['label'].lower() if isinstance(d['label'], str) else "",
            ),
            "templates": templates,
            "common": common_bootstrap_payload(),
            "user": bootstrap_user_data(g.user, include_perms=True),
        }
        return self.render_template(
            "superset/add_report.html",
            title=_("Active Reports").__str__(),
            entry="addReport",
            bootstrap_data=json.dumps(
                payload, default=utils.pessimistic_json_iso_dttm_ser
            )
        )

    @expose("/report/<int:report_id>")
    def report(self, report_id: int) -> FlaskResponse:
        return self.render_app_template()


# class ActiveReports(BaseSupersetView):
#
#     default_view = 'viewer'
#
#     @expose('/viewer/')
#     def viewer(self):
#         payload = {
#             "user": bootstrap_user_data(g.user, include_perms=True),
#             "common": common_bootstrap_payload(),
#         }
#
#         return self.render_template(
#             "superset/basic.html",
#             title=_("Active Reports Viewer").__str__(),
#             entry="activeReports",
#             bootstrap_data=json.dumps(
#                 payload, default=utils.pessimistic_json_iso_dttm_ser
#             )
#         )
