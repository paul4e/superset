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
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(report)
  })
    .then(response => {
      console.log("POST REPORT RESPONSE\n\n")
      console.log(response)
      return response;
    }).catch(error => console.log(error))
}

export function deleteActiveReportEndpoint(endpoint: string) {
  return SupersetClient.delete({
    endpoint: `/api/v1/active_reports${endpoint}`,
    headers: {'Content-Type': 'application/json'},
  })
    .then(response => {
      console.log("DELETE REPORT RESPONSE\n\n")
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
      return response;
    }).catch(error => console.log(error))
}

export function getActiveReportEndpoint(endpoint: string) {
  return SupersetClient.get({
    endpoint: `/api/v1/active_reports${endpoint}`,
    headers: {'Content-Type': 'application/json'},
  })
    .then(response => {
      console.log("GET REPORT RESPONSE\n\n")
      console.log(response)
      return response;
    }).catch(error => console.log(error))
}
