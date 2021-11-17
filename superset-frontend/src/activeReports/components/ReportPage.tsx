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
import React, { useEffect } from 'react';
import {
  useReport,
  useReportDatasets,
} from 'src/activeReports/hooks/apiResources/reports';
import { useParams } from 'react-router-dom';

import DesignerContainer from './DesignerContainer';

function ActiveReportPage() {
  const { report_id } = useParams<{ report_id: string }>();
  const { result: report, error: reportApiError } = useReport(report_id);
  // Cambiar a traer todos los datasets disponibles.
  const { result: datasets, error: datasetsApiError } = useReportDatasets(
    report_id,
  );

  const error = reportApiError || datasetsApiError;
  //
  // const ARJS_LICENSE = process.env.ARJSSERVER_LICENCE || '';
  //
  // useEffect(() => {
  //   Core.setLicenseKey(ARJS_LICENSE);
  // }, [])

  useEffect(() => {
    if (report) {
      console.log('report\n');
      console.log(report);
    }
  }, [report]);

  useEffect(() => {
    if (report) {
      console.log('datasets\n');
      console.log(datasets);
    }
  }, [datasets]);

  if (error) throw error; // caught in error boundary

  // @ts-ignore
  return <DesignerContainer report={report} datasets={datasets} />;
}

export default ActiveReportPage;
