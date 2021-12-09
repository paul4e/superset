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

get_fav_star_ids_schema = {"type": "array", "items": {"type": "integer"}}

report_name_description = "Nombre del Reporte"

report_data_description = "Informacion del reporte"

slices_description = "Lista de Slices del reporte (Datasets)"

published_description = (
    "Indica si el reporte es visible " "en la lista de todos los reportes."
)

is_template_description = "Indica si el reporte es un template para generar reportes."

owners_description = (
    "Owner are users ids allowed to delete or change this dashboard. "
    "If left empty you will be one of the owners of the dashboard."
)

openapi_spec_methods_override = {
    "get": {"get": {"description": "Get a active report detail information."}},
    "get_list": {
        "get": {
            "description": "Get a list of active reports, use Rison or JSON query "
            "parameters for filtering, sorting, pagination and "
            " for selecting specific columns and metadata.",
        }
    },
    "info": {
        "get": {
            "description": "Several metadata information about active_report API endpoints.",
        }
    },
    "related": {
        "get": {
            "description": "Get a list of all possible owners for a active_report. "
            "Use `owners` has the `column_name` parameter"
        }
    },
}


class ActiveReportPostSchema(Schema):
    """
    Schema to add a new active report.
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
    published = fields.Boolean(description=published_description, allow_none=True)
    is_template = fields.Boolean(description=is_template_description, allow_none=True)
    owners = fields.List(fields.Integer(description=owners_description))


class ActiveReportPutSchema(Schema):
    """
    Schema to update or patch a active_report
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
    published = fields.Boolean(description=published_description, allow_none=True)
    is_template = fields.Boolean(description=is_template_description, allow_none=True)
    owners = fields.List(fields.Integer(description=owners_description))
