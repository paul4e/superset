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

from flask_babel import lazy_gettext as _

from superset.views.active_reports.filters import ActiveReportFilter


class ActiveReportsMixin:
    list_title = _("Active Reports")
    show_title = _("Show Report")
    add_title = _("Add Report")
    edit_title = _("Edit Report")

    can_add = False
    search_columns = (
        "report_name",
        "owners",
    )
    list_columns = [
        "report_name",
        "creator",
    ]
    order_columns = [
        "report_name",
        "modified",
        "changed_on",
    ]
    edit_columns = [
        "report_name",
    ]
    base_order = ("changed_on", "desc")
    base_filters = [["id", ActiveReportFilter, lambda: []]]
    label_columns = {
        "report_name": _("Name"),
        "creator": _("Creator"),
        "modified": _("Last Modified"),
        "owners": _("Owners"),
    }
