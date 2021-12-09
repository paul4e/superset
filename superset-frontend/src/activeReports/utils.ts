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

import {SupersetClient} from "@superset-ui/core";


export function postActiveReportEndpoint(endpoint: string, report: any) {
  return SupersetClient.post({
    endpoint: `/api/v1/active_reports${endpoint}`,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report)
  })
    .then(response => {
      if(response.response.status !== 200){
        alert("An error has occurred");
      }
      return response;
    }).catch(error => alert("An error has occurred, " + error))
}

export function deleteActiveReportEndpoint(endpoint: string) {
  return SupersetClient.delete({
    endpoint: `/api/v1/active_reports${endpoint}`,
    headers: {'Content-Type': 'application/json'},
  })
    .then(response => {
      if(response.response.status !== 200){
        alert("An error has occurred");
      }
      else{
        alert("Report deleted successfully");
      }
      return response;
    }).catch(error => console.log(error))
}

export function putActiveReportEndpoint(endpoint: string, report: any) {
  return SupersetClient.put({
    endpoint: `/api/v1/active_reports${endpoint}`,
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(report)
  })
    .then(response => {
        if(response.response.status !== 200){
          alert("An error has occurred");
        }
        else{
          alert("Saved successfully");
        }
        return response;
    }).catch(error => alert("An error has occurred, " + error));
}

export function getActiveReportEndpoint(endpoint: string) {
  return SupersetClient.get({
    endpoint: `/api/v1/active_reports${endpoint}`,
    headers: {'Content-Type': 'application/json'},
  })
    .then(response => {
      if(response.response.status !== 200){
        alert("An error has occurred when get the reports list ");
      }
      return response;
    }).catch(error => alert("An error has occurred, " + error))
}

export const getSlices = (info: any) => {
  const slices: string[] = [];
  info.map((value:any) => {
    slices.push(value.Query.CommandText.split("/")[1]);
  });
  return slices
}
