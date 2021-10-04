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

import {FeatureFlag, isFeatureEnabled} from 'src/featureFlags';
import React, {lazy} from 'react';

const ReportList = lazy(
  () =>
    import(
      /* webpackChunkName: "ReportList" */ 'src/activeReports/components/ReportList'
      ),
);

const Viewer = lazy(
  () =>
    import(
      /* webpackChunkName: "Viewer" */ 'src/activeReports/components/activeReports'
      )
)

type Routes = {
  path: string;
  Component: React.ComponentType;
  Fallback?: React.ComponentType;
  props?: React.ComponentProps<any>;
}[];


export const routes: Routes = [
  {
    path: '/active_reports/list_react/',
    Component: ReportList,
  },
  {
    path: '/active_reports/viewer/',
    Component: Viewer,
  },
]

const frontEndRoutes = routes
  .map(r => r.path)
  .reduce(
    (acc, curr) => ({
      ...acc,
      [curr]: true,
    }),
    {},
  );

export function isFrontendRoute(path?: string) {
  if (!isFeatureEnabled(FeatureFlag.ENABLE_REACT_CRUD_VIEWS)) return false;
  if (path) {
    const basePath = path.split(/[?#]/)[0]; // strip out query params and link bookmarks
    return !!frontEndRoutes[basePath];
  }
  return false;
}
