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
from typing import Any, Dict

from flask_babel import gettext as _
from marshmallow import EXCLUDE, fields, post_load, Schema, validate
from marshmallow.validate import Length, Range
from marshmallow_enum import EnumField

from superset import app
from superset.common.query_context import QueryContext
from superset.db_engine_specs.base import builtin_time_grains
from superset.utils import schema as utils
from superset.utils.core import (
    AnnotationType,
    ChartDataResultFormat,
    ChartDataResultType,
    FilterOperator,
    PostProcessingBoxplotWhiskerType,
    PostProcessingContributionOrientation,
    TimeRangeEndpoint,
)

report_name_description = (
    "Nombre del Reporte"
)

report_data_description = (
    "Informacion del reporte"
)

slices_description = (
    "Lista de Slices del reporte (Datasets)"
)


class ActiveReportPostSchema(Schema):
    """
    Schema to add a new chart.
    """

    report_name = fields.String(
        description=report_name_description, required=True, validate=Length(1, 250)
    )
    report_data = fields.String(
        description=report_data_description,
        allow_none=True,
        validate=utils.validate_json,
    )
    slices = fields.List(fields.Integer(description=slices_description))


class ActiveReportPutSchema(Schema):
    """
    Schema to update or patch a chart
    """

    report_name = fields.String(
        description=report_name_description, required=True, validate=Length(1, 250)
    )
    report_data = fields.String(
        description=report_data_description,
        allow_none=True,
        validate=utils.validate_json,
    )
    slices = fields.List(fields.Integer(description=slices_description))

