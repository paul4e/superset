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

export type AlignOptions = 'left' | 'center' | 'right' | 'fill' | 'justify' | 'center_across' | 'distributed';

export type VAlignOptions = 'top' | 'vcenter' | 'bottom' | 'vjustify' | 'vdistributed';

export type DATA_TYPES = 'NUMERIC' | 'STRING' | 'DATETIME';

//Interfaz de los parametros de configuración de pandas excel writer
export type ExcelFormatOptions = {

  //Formato de fuente

  font_name?: string;
  font_size?: number;
  font_color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  font_strikeout?: boolean;
  font_script?: number; // ??

  //Formato de Numero
  num_format?: string;

  //Procetccion de Celdas
  locked?: boolean;
  hidden?: boolean;

  //Alineación de texto
  align?: AlignOptions;
  valign?: VAlignOptions;
  rotation?: number; // ??
  text_wrap?: boolean;
  reading_order?: boolean; // ?
  //text_justlast: ??
  //center_across: ??
  //indent: ??
  //shrink: ??

  //Pattern
  pattern?: number;
  bg_color?: string;
  fg_color?: string;

  //Formato de bordes
  border?: number;
  bottom?: number;
  top?: number;
  left?: number;
  right?: number;
  border_color?: string;
  bottom_color?: string;
  top_color?: string;
  left_color?: string;
  right_color?: string;

  //cel format
  width?: number;
}

export const defaultExcelFormatOptions = {

}

// export interface ExportExcelConfig {
//   columns_config: ColumnsConfig[];
//   headers_format: ExcelFormatOptions[];
//   default_columns_format: ExcelFormatOptions;
//   default_headers_format: ExcelFormatOptions;
// }

export type ColumnInfo = {
  column_name: string;
  type: DATA_TYPES;
  show: boolean;
  alias?: string;
}

export type ColumnConfig = ColumnInfo &
  { column_format: ExcelFormatOptions, header_format: ExcelFormatOptions };
