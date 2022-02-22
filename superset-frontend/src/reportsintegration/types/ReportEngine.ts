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
import Owner from 'src/types/Owner';

interface ReportEngine {
  changed_by_name: string;
  changed_by_url: string;
  changed_on_delta_humanized?: string;
  changed_by: string;
  verbose_name: string;
  reports_engine_type: string;
  id: number;
  owners?: Owner[];
  created_by: object;
  description: string;
}

export type ReportEngineData = {
  id?: number;
  report_engine_id: number;
  verbose_name: string;
  description: string;
};

export default ReportEngine;
