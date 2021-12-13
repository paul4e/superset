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

import { SupersetClient, t } from '@superset-ui/core';
import { FetchDataConfig } from '../components/ListView';
import { PAGE_SIZE } from '../views/CRUD/utils';
import Report from './types/Report';

export function postActiveReportEndpoint(
  endpoint: string,
  report: any,
  addSuccessToast: (arg0: string) => void,
  addDangerToast: (arg0: string) => void,
) {
  return SupersetClient.post({
    endpoint: `/api/v1/active_reports${endpoint}`,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report),
  })
    .then(response => {
      if (
        response.response.status !== 200 &&
        response.response.status !== 201
      ) {
        addDangerToast(
          t('An error has ocurred when save: %s', report.report_name),
        );
      } else {
        addSuccessToast(t('Saved: %s', report.report_name));
      }
      return response;
    })
    .catch(error => addDangerToast(t('Error when save report: %s', error)));
}

export function deleteActiveReport(
  { id, report_name: report_name }: Report,
  addSuccessToast: (arg0: string) => void,
  addDangerToast: (arg0: string) => void,
  refreshData: (arg0?: FetchDataConfig | null) => void,
  chartFilter?: string,
  userId?: number,
) {
  const filters = {
    pageIndex: 0,
    pageSize: PAGE_SIZE,
    sortBy: [
      {
        id: 'changed_on_delta_humanized',
        desc: true,
      },
    ],
    filters: [
      {
        id: 'created_by',
        operator: 'rel_o_m',
        value: `${userId}`,
      },
    ],
  };

  return SupersetClient.delete({
    endpoint: `/api/v1/active_reports/${id}`,
    headers: { 'Content-Type': 'application/json' },
  }).then(
    () => {
      if (chartFilter === 'Mine') refreshData(filters);
      else refreshData();
      addSuccessToast(t('Deleted: %s', report_name));
    },
    () => {
      addDangerToast(t('There was an issue deleting: %s', report_name));
    },
  );
}

export function putActiveReport(
  endpoint: string,
  report: any,
  addSuccessToast: (arg0: string) => void,
  addDangerToast: (arg0: string) => void,
) {
  return SupersetClient.put({
    endpoint: `/api/v1/active_reports${endpoint}`,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report),
  }).then(response => {
    if (response.response.status !== 200 && response.response.status !== 201) {
      addDangerToast(
        t('An error has ocurred when save: %s', report.report_name),
      );
    } else {
      addSuccessToast(t('Saved: %s', report.report_name));
    }
    return response;
  });
}

export function getActiveReportEndpoint(
  endpoint: string,
  addDangerToast: (arg0: string) => void,
) {
  return SupersetClient.get({
    endpoint: `/api/v1/active_reports${endpoint}`,
    headers: { 'Content-Type': 'application/json' },
  })
    .then(response => {
      return response;
    })
    .catch(error =>
      addDangerToast(t('An error has ocurred when get reports: %s', error)),
    );
}

export function getRelated(column_name: string) {
  return SupersetClient.get({
    endpoint: `/api/v1/active_reports/related/${column_name}`,
    headers: { 'Content-Type': 'application/json' },
  })
    .then(response => {
      return response;
    })
    .catch(error => alert('An error has occurred, ' + error));
}

export const getSlices = (info: any) => {
  const slices: string[] = [];
  info.map((value: any) => {
    slices.push(value.Query.CommandText.split('/')[1]);
  });
  return slices;
};
