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

from flask_babel import lazy_gettext as _

from sqlalchemy import and_, or_
from sqlalchemy.orm.query import Query

from superset import db, security_manager
from superset.models.active_reports import ActiveReport
from superset.models.slice import Slice
from superset.views.base import BaseFilter, is_user_admin


class ActiveReportAccessFilter(BaseFilter):
    """
    List reports with the following criteria:
        1. Those which the user owns
        2. Those which have been published (if they have access to at least one slice)

        :TODO 2. Those which the user has favorited -- Agregar funcionalidad de favoritos al modelo de active reports


    If the user is an admin then show all reports.
    This means they do not get curation but can still sort by "published"
    if they wish to see those dashboards which are published first.
    """

    def apply(self, query: Query, value: Any) -> Query:
        if is_user_admin():
            return query

        datasource_perms = security_manager.user_view_menu_names("datasource_access")
        schema_perms = security_manager.user_view_menu_names("schema_access")

        datasource_perm_query = (
            db.session.query(ActiveReport.id)
            .join(ActiveReport.slices)
            .filter(
                and_(
                    ActiveReport.published.is_(True),
                    or_(
                        Slice.perm.in_(datasource_perms),
                        Slice.schema_perm.in_(schema_perms),
                        security_manager.can_access_all_datasources(),
                    ),
                )
            )
        )

        owner_ids_query = (
            db.session.query(ActiveReport.id)
            .join(ActiveReport.owners)
            .filter(
                security_manager.user_model.id
                == security_manager.user_model.get_user_id()
            )
        )

        query = query.filter(
            or_(
                ActiveReport.id.in_(owner_ids_query),
                ActiveReport.id.in_(datasource_perm_query),
            )
        )

        return query


class ActiveReportAllTextFilter(BaseFilter):  # pylint: disable=too-few-public-methods
    name = _("All Text")
    arg_name = "report_all_text"

    def apply(self, query: Query, value: Any) -> Query:
        if not value:
            return query
        ilike_value = f"%{value}%"
        return query.filter(
            or_(
                ActiveReport.report_name.ilike(ilike_value),
            )
        )
