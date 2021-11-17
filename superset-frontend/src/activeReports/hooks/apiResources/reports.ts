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
  useApiV1Resource,
  useTransformedResource,
} from 'src/common/hooks/apiResources';
import { Dataset } from 'src/activeReports/types/Dataset';
import { Report } from 'src/activeReports/types/Report';
import { Core } from '@grapecity/activereports';

export const useReport = (id: string | number) =>
  useTransformedResource(
    useApiV1Resource<Report>(`/api/v1/active_reports/${id}`),
    report => ({
      ...report,
      report_data:
        report.report_data &&
        (JSON.parse(report.report_data) as Core.RDLReportDefinition),
    }),
  );

export const useReportList = () =>
    useApiV1Resource<Report[]>(`/api/v1/active_reports`);

// gets the dataset definitions for a report
export const useReportDatasets = (id: string | number) =>
  useApiV1Resource<Dataset[]>(`/api/v1/active_reports/${id}/datasets`);
