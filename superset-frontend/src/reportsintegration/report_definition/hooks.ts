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
import ReportDefinition, {
  ReportDefinitionData,
} from '../types/ReportDefinition';

export const useReportDefinitionEditModal = (
  setReportDefinitions: (reportDefinitions: Array<ReportDefinition>) => void,
  reportDefinitions: Array<ReportDefinition>,
) => {
  const [
    reportDefinitionCurrentlyEditing,
    setReportDefinitionCurrentlyEditing,
  ] = useState<ReportDefinitionData | null>(null);

  function openReportDefinitionEditModal(reportDefinition: ReportDefinition) {
    setReportDefinitionCurrentlyEditing({
      report_definition_id: reportDefinition.id,
      report_name: reportDefinition.report_name,
      description: reportDefinition.description,
      // cache_timeout: reportDefinition.cache_timeout,
    });
  }

  function closeReportDefinitionEditModal() {
    setReportDefinitionCurrentlyEditing(null);
  }

  function handleReportDefinitionUpdated(edits: ReportDefinition) {
    // update the report definition in our state with the edited info
    const newReportDefinitions = reportDefinitions.map(
      (report_definition: ReportDefinition) =>
        report_definition.id === edits.id
          ? { ...report_definition, ...edits }
          : report_definition,
    );
    setReportDefinitions(newReportDefinitions);
  }

  return {
    reportDefinitionCurrentlyEditing,
    handleReportDefinitionUpdated,
    openReportDefinitionEditModal,
    closeReportDefinitionEditModal,
  };
};
