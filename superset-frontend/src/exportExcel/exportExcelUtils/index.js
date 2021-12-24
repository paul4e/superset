/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import {
  buildV1ChartDataPayload,
  shouldUseLegacyApi,
  postForm
} from '../../explore/exploreUtils'
import {ColumnsConfig} from "../types";
// import { SupersetClient } from "@superset-ui/core";

export const DATA_TYPES = ['NUMERIC', 'STRING', 'DATETIME'];

export const EXCEL_NUMBER_FORMAT = ['default', 'number_format1','percentage_format1'];

export const EXCEL_DATE_FORMAT = ['default','date_format1','date_format2']

import { defaultHeaderFormat, defaultColumnFormat } from '../constants'

// const default_column_info = {
//   column_name: null,
//   type: null,
//   show: true,
//   format: 'default',
//   alias: null,
//   width: null,
//   font: null,
//   background_color: null,
//   font_color: null,
//   isBold: false,
// };
//
// const default_header_info = {
//   column_name: "",
//   width: "",
//   font: "",
//   background_color: "",
//   font_color: "",
//   isBold: false,
// }

export function generateColumnsInfo(queryResponse) {
  const firstRow = queryResponse.data[0];
  const colNames = queryResponse.colnames ? queryResponse.colnames : getColNames(firstRow);
  const colTypes = queryResponse.coltypes ? queryResponse.coltypes : getColTypes(firstRow);
  /*{
    column_name: string;
  type: DATA_TYPES;
  show: boolean;
  alias?: string;

    column_format
    header_format

  }*/
  const columns_info = colNames.map((col, index) => {
    return {
      column_name: col,
      type: DATA_TYPES[colTypes[index]],
      show: true,
      column_format: { ...defaultColumnFormat },
      header_format: { ...defaultHeaderFormat },

    };
  });
  console.log('Generate columns properties');
  console.log(columns_info);

  return columns_info;
}

function getColNames(row) {
  const colNames = [];

  for (const col in row) {
    colNames.push(col);
  };

  return colNames;
}

function getColTypes(row) {
  const colTypes = [];

  row.map((val) => {
    if (!isNaN(val)) {
      colTypes.push(0);
    } else {
      const tmp_date = new Date(val);
      if (tmp_date.toDateString() !== "Invalid Date") {
        colTypes.push(2);
      } else colTypes.push(1);
    }
  })

  return colTypes;
}


// export function postForm(url, payload) {
//     return SupersetClient.post({
//     endpoint: url,
//     postPayload: { form_data: payload },
//   })//.then(response => {
//   //   const baseUrl = window.location.origin + window.location.pathname;
//   //   const url = `${baseUrl}?id=${response.json.id}`;
//   //   console.log('url');
//   //   console.log(url)
//   //   return url;
//   // });
// }


export function exportChartExcel({
    formData,
    resultFormat = 'json',
    resultType = 'full',
    force = false,
    ownState = {},
})
{

  let url = '/api/v1/chart/exportexcel';
  let query_context;
  if (shouldUseLegacyApi(formData)) {
    query_context = formData;
  } else {
    query_context = buildV1ChartDataPayload({
      formData,
      force,
      resultFormat,
      resultType,
      ownState,
    });
  };

  const payload = {query_context: query_context, filename:"prueba", columns_info: {a: 1, b:2}}
  return postForm(url, payload)//.then(response => {
  //   console.log(response);
  // });
}
