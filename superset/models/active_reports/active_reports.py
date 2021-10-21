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

from flask_appbuilder import Model
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
)
from sqlalchemy.schema import UniqueConstraint
from superset.models.helpers import AuditMixinNullable
from sqlalchemy.orm import relationship
from superset.models.slice import Slice
from superset import security_manager
from superset.extensions import db

metadata = Model.metadata  # pylint: disable=no-member
active_report_user = Table(
    "active_report_user",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("user_id", Integer, ForeignKey("ab_user.id")),
    Column("active_report_id", Integer, ForeignKey("active_reports.id")),
)

active_report_slices = Table(
    "active_report_slices",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("active_report_id", Integer, ForeignKey("active_reports.id")),
    Column("slice_id", Integer, ForeignKey("slices.id")),
    UniqueConstraint("active_report_id", "slice_id"),
)


class ActiveReport(Model, AuditMixinNullable):

    """
    Report Schedules, supports alerts and reports
    """

    __tablename__ = "active_reports"
    __table_args__ = (UniqueConstraint("id", "report_name"),)

    id = Column(Integer, primary_key=True)
    report_name = Column(String(250), nullable=False)
    report_data = Column(Text)
    published = Column(Boolean, default=False)
    is_template = Column(Boolean, default=False)
    owners = relationship(security_manager.user_model, secondary=active_report_user)
    slices = relationship(Slice, secondary=active_report_slices, backref="active_reports")

    def __repr__(self) -> str:
        return str(self.report_name)

    @property
    def changed_by_name(self) -> str:
        if not self.changed_by:
            return ""
        return str(self.changed_by)

    @property
    def changed_by_url(self) -> str:
        if not self.changed_by:
            return ""
        return f"/superset/profile/{self.changed_by.username}"

    @property
    def url(self) -> str:
        return f"/active_reports/report/{self.id}" #f"/superset/dashboard/{self.slug or self.id}/"

