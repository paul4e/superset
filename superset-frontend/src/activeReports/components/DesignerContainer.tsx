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
import {
  templates,
} from "@grapecity/activereports/reportdesigner";
import {Report} from 'src/activeReports/types/Report';
import {Designer} from '@grapecity/activereports-react';

interface DesignerComponent {
  report: any;
  datasets: any[] | null;
}

function DesignerComponent(props: DesignerComponent) {
  const DesignerRef = React.createRef();
  const currentResolveFn = React.useRef();
  const [currentReport, setCurrentReport] = useState<Report>(props.report);
  // @ts-ignore
  const [currentDatasets, setCurrentDatasets] = useState(props.datasets);
  // const [availableDatasets, setAvailableDatasets] = useState([]);
  const counter = React.useRef(0);

  const [reportStorage, setReportStorage] = React.useState(new Map());

  console.log("currentReport")
  console.log(currentReport)
  console.log("currentDatasets")
  console.log(currentDatasets)

  useEffect(() => {
    setCurrentDatasets(props.datasets)
  }, [props.datasets])

  useEffect(() => {
    setCurrentReport(props.report)
  }, [props.report])

  useEffect(() => {

    console.log("USE EFFECT before if")
    if (currentReport && currentDatasets) {
      const report_data = currentReport.report_data;
      console.log("USE EFFECT")
      const reportDefinition = {
        definition: report_data,
        // @ts-ignore
        displayName: currentReport.report_name,//report_data.displayName,
        id: currentReport.report_name,
      }
      // @ts-ignore
      DesignerRef.current.setReport(reportDefinition);
    }

  }, [currentReport, currentDatasets])

  const onSaveReport = function (info: any) {
    const report = {"report_name": info.id};
    console.log('info')
    console.log(info)
    console.log("info")
    setCurrentReport((current) => {
      return {...current, ...report};
    });
    setReportStorage(new Map(reportStorage.set(info.id, info.definition)));
    return Promise.resolve({displayName: info.id});
  };

  const onSaveAsReport = function (info: any) {
    setReportStorage(new Map(reportStorage.set(info.id, info.definition)));
    //post.(reportStorate(id))
    return Promise.resolve({id: info.id, displayName: info.id});
  };

  function onSelectReport(reportId: any) {
    if (currentResolveFn.current) {
      window.$("#dlgOpen").modal("hide");
      // @ts-ignore
      currentResolveFn.current({
        definition: reportStorage.get(reportId),
        id: reportId,
        displayName: reportId,
      });
      // @ts-ignore
      currentResolveFn.current = null;
    }
  }
  function onCreateReport(){
    const reportId = `New Report ${++counter.current}`;
    return Promise.resolve({

      definition: templates.CPL,
      id: reportId,
      displayName: reportId,
    });
  }
  function onOpenReport(){
    return new Promise(function (resolve) {
      // @ts-ignore
      currentResolveFn.current = resolve;
      window.$("#dlgOpen").modal("show");
    });
  }

  return (
    <>
      <div id="designer-host">
        {/* @ts-ignore */}
        <Designer ref={DesignerRef} onCreate={onCreateReport} onSave={onSaveReport} onSaveAs={onSaveAsReport} onOpen={onOpenReport}/>
      </div>
      <div className="modal" id="dlgOpen" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Open Report
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <h2>Select Report:</h2>
              <div className="list-group">
                {[...reportStorage.keys()].map((reportId) => (
                  <button
                    type="button"
                    className="list-group-item list-group-item-action"
                    onClick={() => onSelectReport(reportId)}
                  >
                    {reportId}
                  </button>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      </>
  )
}


export default DesignerComponent;
