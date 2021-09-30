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

from superset import security_manager

# metadata = Model.metadata  # pylint: disable=no-member
# active_report_user = Table(
#     "active_report_user",
#     Column("id", Integer, primary_key=True),
#     Column("user_id", Integer, ForeignKey("ab_user.id")),
#     Column("active_report_id", Integer, ForeignKey("active_reports.id")),
# )

metadata = Model.metadata


class ActiveReport(Model):

    """
    Report Schedules, supports alerts and reports
    """

    __tablename__ = "active_reports"
    __table_args__ = (UniqueConstraint("id", "report_name"),)

    id = Column(Integer, primary_key=True)
    report_name = Column(String(250), nullable=False)
    report_data = Column(Text)
    # owners = relationship(security_manager.user_model, secondary=active_report_user)

    def __repr__(self) -> str:
        return str(self.name)
