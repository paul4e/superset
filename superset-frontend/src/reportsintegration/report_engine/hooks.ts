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

import { useState } from 'react';
import ReportEngine, {
  ReportEngineData,
} from 'src/reportsintegration/types/ReportEngine';

export const useReportEngineEditModal = (
  setReportEngines: (reportEngines: Array<ReportEngine>) => void,
  reportEngines: Array<ReportEngine>,
) => {
  const [
    reportEngineCurrentlyEditing,
    setReportEngineCurrentlyEditing,
  ] = useState<ReportEngineData | null>(null);

  function openReportEngineEditModal(reportEngine: ReportEngine) {
    setReportEngineCurrentlyEditing({
      report_engine_id: reportEngine.id,
      verbose_name: reportEngine.verbose_name,
      description: reportEngine.description,
      // cache_timeout: reportDefinition.cache_timeout,
    });
  }

  function closeReportEngineEditModal() {
    setReportEngineCurrentlyEditing(null);
  }

  function handleReportEngineUpdated(edits: ReportEngine) {
    // update the report engine in our state with the edited info
    const newReportEngines = reportEngines.map((report_engine: ReportEngine) =>
      report_engine.id === edits.id
        ? { ...report_engine, ...edits }
        : report_engine,
    );
    setReportEngines(newReportEngines);
  }

  return {
    reportEngineCurrentlyEditing,
    handleReportEngineUpdated,
    openReportEngineEditModal,
    closeReportEngineEditModal,
  };
};
