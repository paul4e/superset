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

import logging

from typing import List, Optional, TYPE_CHECKING

from sqlalchemy.exc import SQLAlchemyError

from superset.dao.base import BaseDAO
from superset.extensions import db
from superset.models.active_reports import ActiveReport

if TYPE_CHECKING:
    from superset.connectors.base.models import BaseDatasource

logger = logging.getLogger(__name__)


class ActiveReportsDAO(BaseDAO):
    model_cls = ActiveReport
    base_filter = None

    # include_route_methods
