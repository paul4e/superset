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
import React, {useEffect, useState} from 'react';
import {Dataset} from "src/activeReports/types/Dataset";
import { Report } from 'src/activeReports/types/Report';
import {Designer } from '@grapecity/activereports-react';

interface DesignerComponent {
  report: any;
  datasets: any[] | null;
}

function DesignerComponent(props: DesignerComponent) {
  const DesignerRef = React.createRef();
  const [currentReport, setCurrentReport] = useState<Report>(props.report);
  const [currentDatasets, setCurrentDatasets] = useState(props.datasets);

  useEffect(() => {
    if (currentReport && currentDatasets) {
      const report_data = currentReport.report_data;

      const reportDefinition = {
        definition: report_data,
        // @ts-ignore
        displayName: 'prueba',//report_data.displayName,
        id: currentReport.report_name,
      }
      // @ts-ignore
      DesignerRef.current.setReport(reportDefinition);
    }

  },[currentReport,currentDatasets])

  const onChangeReport = () => {

    setCurrentReport( (prevState) => {
      return [...prevState, ...currentReport]
    })
  }
  const onSave = (info: any) => {
    console.log(`ON SAVE REPORT\n${info}`)
    return Promise.resolve("??")
  }

  return (
    // @ts-ignore
    <Designer ref={DesignerRef} dataSources={currentDatasets} onSave={onSave}/>
  )
}

export default DesignerComponent;
