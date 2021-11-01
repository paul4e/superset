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
import {Designer, Viewer} from '@grapecity/activereports-react';
import {
  getActiveReportEndpoint,
  postActiveReportEndpoint, /*postActiveReportEndpoint,*/
  putActiveReportEndpoint
} from "../utils";
import {useReportList} from "../hooks/apiResources/reports";
import {t} from "@superset-ui/core";

import {Input} from "../../common/components";
import {Form, FormItem} from "../../components/Form";

interface DesignerComponent {
  report: any;
  datasets: any[] | null;
}

export function Upload(props: any) {
  // @ts-ignore
  const [files, setFiles] = useState();

  const handleChange = (e: any) => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = e => {
      // @ts-ignore
      setFiles(e.target.result);
      // @ts-ignore
      const result = JSON.parse(e.target.result)
      props.onChange(result)
    };
  };
  return (
    <>
      <input type="file" onChange={handleChange}/>
    </>
  );
}

function DesignerComponent(props: DesignerComponent) {
  const DesignerRef = React.createRef();
  const ViewerRef = React.useRef();
  const currentResolveFn = React.useRef();
  const [currentReport, setCurrentReport] = useState<Report>(props.report);
  const [reportName, setReportName] = useState<string>();
  const [designerVisible, setDesignerVisible] = React.useState(true);
  // @ts-ignore
  const [currentDatasets, setCurrentDatasets] = useState(props.datasets);
  // const [availableDatasets, setAvailableDatasets] = useState([]);
  const counter = React.useRef(0);
  const listReports = useReportList()
  // @ts-ignore
  const [reportStorage, setReportStorage] = React.useState(new Array());

  useEffect(()=>{
    if(listReports.status === "complete"){
      setReportStorage(listReports.result);
    }
  },[listReports])
  //--------------- Get datasets
  useEffect(() => {
    setCurrentDatasets(props.datasets)
  }, [props.datasets])
  //---------------Set current Report
  useEffect(() => {
    setCurrentReport(props.report)
  }, [props.report])
  //---------------Change of view
  useEffect(() => {
    if(!designerVisible){
      // @ts-ignore
     var aboutButton = {
        key: "$about",
        iconCssClass: "mdi mdi-help-circle",
        text: "go to Designer",
        enabled: true,
        action:  () => setDesignerVisible(true),
      };
      // @ts-ignore
      ViewerRef.current.toolbar.addItem(aboutButton)
      // @ts-ignore
      ViewerRef.current.toolbar.updateLayout({
        default: ['$about','$split','$navigation', '$split', '$refresh', '$split', '$history', '$split', '$mousemode', '$zoom', '$fullscreen', '$split', '$print', '$singlepagemode', '$continuousmode', '$galleymode'],
        fullscreen: ["$fullscreen", "$split", "$print", "$split", "$about"],
        mobile: ["$navigation", "$split", "$about"],
      });// @ts-ignore
    }
  }, [designerVisible])

  useEffect(() => {
    if (currentReport && currentDatasets) {
      const report_data = currentReport.report_data;
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


  const getSlices = (info: any) => {
    const slices: string[] = [];
    info.map((value:any) => {
      slices.push(value.Query.CommandText.split("/")[1]);
    });
    return slices
  }

  const onSaveReport = function (info: any) {
    if(info.definition.DataSets.length > 0){
      const report = {
        "report_data": JSON.stringify(info.definition),
        "report_name": info.displayName,
      };
      setCurrentReport((current) => {
        return {...current, ...report};
      });
      putActiveReportEndpoint(`/${currentReport.id}`, report)
    }
    else{
      alert("The report doesn't contain datasets");
    }
    return Promise.resolve({displayName: info.id});
  };

  const onSaveAsReport = function (info: any) {
    window.$("#saveAs").modal("show");
    return Promise.resolve({id: info.id, displayName: info.id});
  };

  function onSelectReport(report: any) {
    window.$("#dlgOpen").modal("hide");
    getActiveReportEndpoint(`/${report.id}`).then(r => {
      setCurrentReport((current) => {
        // @ts-ignore
        return {...current, ..."json" in r ? r.json : null };
      });
      // @ts-ignore
      if ("json" in r) {
        window.location.assign(`/active_reports/report/${r.json.id}`)
      }
    })
    //window.location.href = `/active_reports/report/${report.id}`
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

  function onReportPreview(reportView: any){
    setDesignerVisible(false);
    // @ts-ignore
    ViewerRef.current.open(reportView.definition);
    return Promise.resolve();
  }

  const handleChangeUpload = (info: { id: string; Name: string; }) => {
    const id = reportStorage.length;
    info.id = "reporte_" + id;
    //setCurrentReport({report_name: info.Name, report_data: JSON.stringify(info)});
  }

  const handleSaveAs = () => {
    console.log("info save as")
    console.log(currentReport)
    // @ts-ignore
    let slices: string[] = getSlices(currentReport?.report_data?.DataSets);
    const report = {
      report_data: JSON.stringify(currentReport.report_data),
      report_name: reportName,
      slices: slices,
    }
    console.log(report)
    postActiveReportEndpoint('/', report).then(r => {
      // @ts-ignore
      if ("json" in r) {
        const {id} = r.json;
        window.location.href = `/active_reports/report/${id}`
      }
    } ).catch();
  }


  return (
    <>
      <div
        id="designer-host"
        style={{display: designerVisible ? "block" : "none"}}
      >  {/* @ts-ignore */}
        <Designer ref={DesignerRef}
                  onCreate={onCreateReport}
                  onSave={onSaveReport}
                  onSaveAs={onSaveAsReport}
                  onOpen={onOpenReport}
                  onRender={onReportPreview}
        />
      </div>
      {!designerVisible && (
        <div id="viewer-host">
          {/* @ts-ignore*/}
          <Viewer ref={ViewerRef}
          />
        </div>
      )}
      <div className="modal" id="saveAs" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Save as
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
              <Form layout="vertical">
                <h3>{t('New Report')}</h3>
                <FormItem label={t('Name')} required>
                  <Input
                    name="name"
                    type="text"
                    value={reportName}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setReportName(event.target.value ?? '')
                    }
                  />
                </FormItem>
              {/*  Checkbox is template*/}
              </Form>
            </div>
            <div className="modal-footer">

              <button
                type="button"
                className="btn btn-primary"
                data-dismiss="modal"
                onClick={handleSaveAs}
              >
                Save
              </button><button
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
                {reportStorage.map((report) => (
                  <button
                    type="button"
                    className="list-group-item list-group-item-action"
                    onClick={() => onSelectReport(report)}
                  >
                    {report.report_name}
                  </button>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <Upload onChange={handleChangeUpload}/>
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
  );
}


export default DesignerComponent;
