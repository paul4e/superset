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
from typing import Any

from sqlalchemy import or_
from sqlalchemy.orm.query import Query

from superset import security_manager, is_feature_enabled
from superset.views.base import BaseFilter
from superset.extensions import db, security_manager
from superset.models.slice import Slice
from superset.models.dashboard import Dashboard


class SliceFilter(BaseFilter):  # pylint: disable=too-few-public-methods
    def apply(self, query: Query, value: Any) -> Query:

        if is_feature_enabled("DASHBOARD_ACCESS_PERM"):
            dashboard_perms = security_manager.user_view_menu_names("dashboard_access")

            if dashboard_perms:
                dashboard_slices = (
                    db.session.query(Slice.id)
                    .join(Dashboard.slices)
                    .filter(
                        Dashboard.perm.in_(dashboard_perms)
                    )
                )

                return query.filter(
                    self.model.id.in_(dashboard_slices)
                )

        if security_manager.can_access_all_datasources():
            return query
        perms = security_manager.user_view_menu_names("datasource_access")
        schema_perms = security_manager.user_view_menu_names("schema_access")
        return query.filter(
            or_(self.model.perm.in_(perms), self.model.schema_perm.in_(schema_perms))
        )
