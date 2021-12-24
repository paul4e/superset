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

import pandas as pd
import uuid
import tempfile
import os
import logging

from typing import Any, Dict, List

from flask import Request, g, send_file, make_response

from marshmallow import ValidationError
from flask_babel import gettext as _, ngettext

from superset import cache
from superset.charts.commands.exceptions import (
    ChartDataCacheLoadError,
    ChartDataQueryFailedError,
)
from superset.charts.schemas import ChartDataQueryContextSchema
from superset.commands.base import BaseCommand
from superset.common.query_context import QueryContext
from superset.exceptions import QueryObjectValidationError
from superset.exceptions import CacheLoadError
from superset.extensions import async_query_manager
from superset.tasks.async_queries import load_chart_data_into_cache

from superset.charts.commands.data import ChartDataCommand
from pandas import ExcelWriter

from xlsxwriter.workbook import Workbook
from xlsxwriter.worksheet import Worksheet

from io import BytesIO, StringIO

logger = logging.getLogger(__name__)

DEFAULT_EXCEL_WRITER_ENGINE = 'xlsxwriter'


class ChartExportExcelCommand(BaseCommand):
    def __init__(self) -> None:
        self._form_data: Dict[str, Any]
        self._columns_format: List[Dict[str, Any]]
        self._headers_format: List[Dict[str, Any]]
        self._query_context_form_data: Dict[str, Any]
        self._query_context: QueryContext
        self._excel_writer: ExcelWriter
        self._chart_data_command: ChartDataCommand
        self._workbook: Workbook
        self._worksheets: List[Worksheet]
        self._filename: str
        self._results: Dict[str, Any]
        self._data: pd.DataFrame

    def run(self, **kwargs: Any) -> str:
        # caching is handled in query_context.get_df_payload
        # (also evals `force` property)
        logger.debug("RUN")
        # self.__set_chart_data_command()
        logger.debug("RUN2")
        self.__get_chart_data()

        logger.debug("write columns")
        self.__write_columns()

        logger.debug("write headers")
        self.__write_headers()

        logger.debug("write audit")
        self.__write_audit_data()

        self._excel_writer.save()

        return self._filepath

    def validate(self) -> None:
        logger.debug("validate")

        try:
            self._chart_data_command.validate()
        except QueryObjectValidationError as error:
            raise error
        except ValidationError as error:
            raise error

    def set_export_context(self, form_data: Dict[str, Any]) -> None:
        logger.debug("set export context")
        self._form_data = form_data
        self._query_context_form_data = form_data["query_context"]
        logger.debug("set filepath")
        self.__set_filepath()
        logger.debug("set excel writer")
        self.__set_excel_writer()
        logger.debug("set workbook")
        self.__set_workbook()

        try:
            self.__set_chart_data_command()
        except KeyError:
            raise ValidationError("Request is incorrect")
        except ValidationError as error:
            raise error

    def __export_excel_file(self):
        self._excel_writer.save()

        return send_file(self._filepath, as_attachment=True)

    def __get_chart_data(self, force_cached: bool = False) -> None:
        try:
            results = self._chart_data_command.run(force_cached=force_cached)
            self._results = results
        except ChartDataCacheLoadError as exc:
            return self.response_422(message=exc.message)
        except ChartDataQueryFailedError as exc:
            return self.response_400(message=exc.message)

        data = results["queries"][0]["data"]

        if data == '\n':
            resp = make_response("No hay datos para exportar", 200)
            resp.headers["Content-Type"] = "application/json; charset=utf-8"
            return resp

        # expects a csv string format data
        df = pd.read_csv(StringIO(data), sep=';')
        self._data = df

    def __set_chart_data_command(self):
        try:
            logger.debug("set chart data command")
            command = ChartDataCommand()
            logger.debug("set query context")
            command.set_query_context(self._query_context_form_data)
            logger.debug("validate")
            command.validate()
            self._chart_data_command = command
        except QueryObjectValidationError as error:
            raise error
        except ValidationError as error:
            logger.debug("validate error {}".format(error.messages))
            raise error

        return self._chart_data_command

    def __set_excel_writer(self):
        self._excel_writer = pd.ExcelWriter(self._filepath,
                                            engine=DEFAULT_EXCEL_WRITER_ENGINE)

    def __set_filepath(self):
        if 'filename' in self._form_data:
            self._filepath = os.path.join(
                tempfile.gettempdir(),
                "{}.xlsx".format(self._form_data['filename']))
        else:
            self._filepath = os.path.join(
                tempfile.gettempdir(),
                "{}.xlsx".format(uuid.uuid1()))

    def __set_workbook(self) -> None:
        self._workbook = self._excel_writer.book

        # data_worksheet = self._workbook.add_worksheet('Datos')

    def __set_formats(self) -> None:
        self._columns_format = []

        workbook = self._workbook
        columns_info = self._form_data["columns_info"]
        for col in columns_info:
            if not col.show:
                pass

            column_format = workbook.add_format(col.column_format)
            self._columns_format.append(column_format)
            header_format = workbook.add_format(col.header_format)
            self._headers_format.append(header_format)

    # def __set_headers_format(self) -> None:
    #     self._headers_format = []
    #
    #     workbook = self._workbook
    #     columns_info = self._form_data["columns_info"]
    #     for col in columns_info:
    #         if not col.show:
    #             pass
    #
    #         current_format = workbook.add_format(col.header_format)
    #         self._headers_format.append(current_format)
    #     return

    def __get_worksheet(self, worksheet: str) -> Worksheet:
        for ws in self._worksheets:
            if ws.name == worksheet:
                return ws

        return None

    def __write_headers(self):
        worksheet = self.__get_worksheet('Datos')

        # get columns header alias
        for col_num, value in enumerate(self._data.columns.values):
            # header_format = self._headers_format[col_num]
            worksheet.write(0, col_num, value)  # , header_format)

    def __add_headers_format(self):
        return

    def __write_columns(self) -> None:
        writer = self._excel_writer


        sheet_name = "Datos"

        self._data.to_excel(writer,
                            sheet_name=sheet_name,
                            index=False,
                            startrow=1,
                            header=False)

        worksheet = writer.sheets[sheet_name]
        self._worksheets = [worksheet]

    def __add_columns_format(self):
        return

    def __write_audit_data(self) -> None:
        worksheet = self._workbook.add_worksheet('Auditoría')
        self._worksheets = [worksheet]


        user_data = g.user.__dict__
        user_name = f"{user_data['first_name']} {user_data['last_name']}"

        worksheet.write(0, 0, "Nombre del sistema")
        worksheet.write(0, 1, "Superset")

        worksheet.write(1, 0, "Reporte generado por:")
        worksheet.write(1, 1, user_name)


            # user_data = g.user.__dict__
            # user_name = f"{user_data['first_name']} {user_data['last_name']}"
            #
            # qc = result["query_context"].queries[0].to_dict()
            #
            # export_metadata = {
            #     "Nombre del sistema": "Superset",
            #     "Reporte generado por": user_name,
            #     "Fecha de creación": datetime.today().strftime("%d/%m/%Y %H:%M:%S"),
            #     "": ""
            # }
            # if 'from_dttm' in qc.keys() and 'to_dttm' in qc.keys():
            #     if not qc['from_dttm'] and not qc['to_dttm']:
            #         export_metadata["No se han aplicado filtros de fecha"] = ""
            #     else:
            #         export_metadata["Filtros de fecha aplicados sobre los datos"] = ""
            #         export_metadata["Fecha de inicio"] = qc['from_dttm'] if 'from_dttm' in qc.keys() else 'Sin fecha de inicio'
            #         export_metadata["Fecha de finalización"] = qc['to_dttm'] if 'from_dttm' in qc.keys() else 'Sin fecha de finalización'
            # else:
            #     export_metadata["No se han aplicado filtros de fecha"] = ""
            #
            # export_metadata[" "] = ""
            #
            # filtros_dict = {}
            #
            # if 'filter' not in qc.keys():
            #     export_metadata["No se han aplicado filtros sobre los datos"] = ""
            # else:
            #     export_metadata["Filtros aplicados sobre los datos"] = ""
            #     tmp_cols = []
            #     tmp_ops = []
            #     tmp_vals = []
            #     for f in qc['filter']:
            #         if 'op' in f.keys():
            #             if f['op'] in filter_operators.keys():
            #                 operador = filter_operators[f['op']]
            #             else:
            #                 operador = f['op']
            #             # operador = filter_operators[f['op']] if (f['op'] in filter_operators.keys()) else f['op']
            #         else:
            #             operador = 'No se encontro el operador'
            #         tmp_cols.append(f['col'])
            #         tmp_ops.append(operador)
            #         tmp_vals.append(f['val'] if 'val' in f.keys() else None)
            #
            #     filtros_dict = {
            #         'Columnas': tmp_cols,
            #         'Comparación': tmp_ops,
            #         'Valores filtrados': tmp_vals
            #     }
            #
            # metadata_df = pd.DataFrame(list(export_metadata.items()))

