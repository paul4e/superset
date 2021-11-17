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
from superset.active_reports.models import ActiveReportExport
from superset import is_feature_enabled, security_manager
from superset.models.slice import Slice
from superset import db
from sqlalchemy import and_, or_

logger = logging.getLogger(__name__)

#  No se si sera necesario generar una vista separada
#  ???


class ActiveReportsExports(SupersetModelView, ActiveReportsMixin):
    route_base = '/active_reports'
    datamodel = SQLAInterface(ActiveReportExport)
    include_route_methods = RouteMethod.CRUD_SET | {
    }
    class_permission_name = "Active_report"  # Usar mismo permiso que active reports o generar un permiso adicional para exportar.
    method_permission_name = MODEL_VIEW_RW_METHOD_PERMISSION_MAP
