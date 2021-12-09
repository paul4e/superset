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
from datetime import datetime
from typing import List, Optional

from superset.connectors.sqla.models import SqlaTable, SqlMetric, TableColumn
from superset.datasets.dao import DatasetDAO
from superset.extensions import db

logger = logging.getLogger(__name__)
# from enum import Enum

DATETIME_STR_FORMATS = [
    "%Y-%m-%d %H:%M:%S",
    "%Y-%m-%d",
]
METRICS_TYPES = ["AVG", "SUM", "MAX", "MIN", "COUNT", "COUNT_DISTINCT"]
FILTER_OPERATORS = [
    "==",
    "!=",
    ">",
    "<",
    ">=",
    "<=",
    "LIKE",
    "ILIKE",
    "IS NULL",
    "IS NOT NULL",
    "IN",
    "NOT IN",
]


def parse_list_parameter(list_parameter: str) -> List[str]:
    parameters = list_parameter.split(",")
    result_parameters = [param.strip() for param in parameters]

    return result_parameters


def parse_time_range_parameter(time_range_parameter: str) -> List[datetime]:
    time_range = time_range_parameter.split("<>")
    result_time_range = [param.strip() for param in time_range]

    return result_time_range


def convert_datetime(time_range: List[str]) -> List[datetime]:
    result_time_range = []

    for datetime_str in time_range:
        datetime_obj = None

        if datetime_str == "":
            result_time_range.append(None)
            continue

        for date_format in DATETIME_STR_FORMATS:
            try:
                datetime_obj = datetime.strptime(datetime_str, date_format)
                break
            except Exception as e:
                continue

        if datetime_obj:
            result_time_range.append(datetime_obj)
        else:
            raise ValueError("Formato de rango de fechas Invalido")

    if len(result_time_range) == 1:
        result_time_range.append(None)

    return result_time_range


def parse_multiple_list_parameter(mlist_parameter: str) -> List[List[str]]:
    parameters = mlist_parameter.split("$")
    result_parameters = [parse_list_parameter(param.strip()) for param in parameters]

    return result_parameters


def generate_metrics(metrics: List[List[str]], datasource_id):
    if metrics is None:
        # Return error metrica vacia
        return None

    result_metrics = []

    for metric in metrics:
        # validar tamano 2 o 3, agg, columna, alias [optional]
        if len(metric) == 2:
            alias = f"{metric[0]}({metric[1]})"
        elif len(metric) == 3:
            alias = metric[2]
        else:
            # return error metrica invalida
            return None

        agg = metric[0]
        column_name = metric[1]

        # verificar agg valida
        if agg not in METRICS_TYPES:
            # return error metrica invalida
            return None

        # buscar columna en datasource
        column = find_dataset_column_by_name(datasource_id, column_name)

        result_metric = {
            "expressionType": "SIMPLE",
            "column": table_column_to_dict(column),
            "aggregate": agg,
            "sqlExpression": None,
            "isNew": False,
            "hasCustomLabel": True if len(metric) == 3 else False,
            "label": alias,
        }
        result_metrics.append(result_metric)

    return result_metrics


# TODO: Agregar esta parte de extraccion de datos de la DB a un DAO
def find_dataset_column_by_name(
    dataset_id: int, column_name: str
) -> Optional[TableColumn]:
    dataset = DatasetDAO.find_by_id(dataset_id)

    if not dataset:
        return None

    return (
        db.session.query(TableColumn)
        .filter(
            TableColumn.table_id == dataset_id, TableColumn.column_name == column_name
        )
        .one_or_none()
    )


def table_column_to_dict(table_column):
    return {
        "id": table_column.id,
        "column_name": table_column.column_name,
        "verbose_name": table_column.verbose_name,
        "description": table_column.description,
        "expression": table_column.expression,
        "filterable": table_column.filterable,
        "groupby": table_column.groupby,
        "is_dttm": table_column.is_dttm,
        "type": table_column.type,
        "type_generic": table_column.type_generic,
        "python_date_format": table_column.python_date_format,
    }


def generate_filters(filters: List[List[str]], datasource_id):
    if filters is None:
        # Return error metrica vacia
        return None

    result_filters = []

    for fil in filters:
        val = None
        # validar tamano 2 o 3, columna, operador, valor
        if len(fil) == 2:
            col = fil[0]
            op = fil[1]
        elif len(fil) == 3:
            col = fil[0]
            op = fil[1]
            val = fil[2]
        else:
            # return error filtro invalido
            return None

        column = find_dataset_column_by_name(datasource_id, col)

        if not column:
            # Devulver error columna invalida
            return None

        result_filter = {
            "col": col,
            "op": op,
        }

        if val:
            result_filter.update(val=val)

        result_filters.append(result_filter)

    return result_filters
