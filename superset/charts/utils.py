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
from typing import List
from datetime import datetime

DATETIME_STR_FORMATS = ["%Y-%m-%d", "%Y-%m-%d %H:%M:%S"]


def parse_list_parameter(list_parameter: str) -> List[str]:

    parameters = list_parameter.split(',')
    result_parameters = [param.strip() for param in parameters]

    return result_parameters


def parse_time_range_parameter(time_range_parameter: str) -> List[datetime]:

    time_range = time_range_parameter.split('<>')
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
