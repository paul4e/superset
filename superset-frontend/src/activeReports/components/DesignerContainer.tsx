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
import React, { useEffect, useState } from 'react';
import { templates } from '@grapecity/activereports/reportdesigner';
import { Report } from 'src/activeReports/types/Report';
import {
  Designer,
  RDLReportDefinition,
  Viewer,
} from '@grapecity/activereports-react';
import {
  getActiveReportEndpoint,
  getSlices,
  postActiveReportEndpoint,
  putActiveReport,
} from '../utils';
import { useReportList } from '../hooks/apiResources/reports';
import { t } from '@superset-ui/core';
import '@grapecity/activereports/styles/ar-js-ui.css';
import '@grapecity/activereports/styles/ar-js-viewer.css';
import '@grapecity/activereports/pdfexport';
import '@grapecity/activereports/htmlexport';
import '@grapecity/activereports/xlsxexport';
import { Input } from '../../common/components';
import { Form, FormItem } from '../../components/Form';
import { addSuccessToast, addDangerToast } from 'src/messageToasts/actions';
// import withToasts from 'src/messageToasts/enhancers/withToasts';

interface DesignerComponent {
  report: any;
  datasets: any[] | null;
}

interface SaveReportInfo {
  definition: RDLReportDefinition;
  displayName?: string | undefined;
  id: string;
}
export function Upload(props: any) {
  // @ts-ignore
  const [files, setFiles] = useState();
  const handleChange = (e: any) => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], 'UTF-8');
    fileReader.onload = e => {
      // @ts-ignore
      setFiles(e.target.result);
      // @ts-ignore
      const result = JSON.parse(e.target.result);
      props.onChange(result);
    };
  };
  return (
    <>
      <input type="file" onChange={handleChange} />
    </>
  );
}

function DesignerComponent(props: DesignerComponent) {
  const DesignerRef = React.createRef();
  const ViewerRef = React.useRef();
  const currentResolveFn = React.useRef();
  const [isInit, setIsInit] = useState(true);
  // @ts-ignore
  const [allExports, setAllExports] = React.useState([
    { label: 'PDF', value: 'pdf', available: true },
    { label: 'HTML', value: 'html', available: true },
    { label: 'XLSX', value: 'xlsx', available: true },
  ]);
  const [currentReport, setCurrentReport] = useState<Report>(props.report);
  const [reportName, setReportName] = useState<string>();
  // @ts-ignore
  const [checked, setCheckbox] = useState<boolean>(false);
  const [designerVisible, setDesignerVisible] = React.useState(false);
  // @ts-ignore
  const [currentDatasets, setCurrentDatasets] = useState(props.datasets);
  // const [availableDatasets, setAvailableDatasets] = useState([]);
  const counter = React.useRef(0);
  const listReports = useReportList();
  // @ts-ignore
  const [reportStorage, setReportStorage] = React.useState([]);

  useEffect(() => {
    if (listReports.status === 'complete') {
      // @ts-ignore
      setReportStorage(listReports.result);
    }
  }, [listReports]);
  // --------------- Get datasets
  useEffect(() => {
    setCurrentDatasets(props.datasets);
  }, [props.datasets]);
  // ---------------Set current Report
  useEffect(() => {
    setCurrentReport(props.report);
  }, [props.report]);
  // ---------------Change of view
  useEffect(() => {
    if (!designerVisible) {
      var aboutButton = {
        key: '$about',
        iconUrl: '',
        icon: '',
        text: 'Designer',
        enabled: true,
        action: () => setDesignerVisible(true),
      };
      // @ts-ignore
      ViewerRef.current.toolbar.addItem(aboutButton);
      // @ts-ignore
      ViewerRef.current.toolbar.updateLayout({
        default: [
          '$about',
          '$split',
          '$navigation',
          '$split',
          '$refresh',
          '$split',
          '$history',
          '$split',
          '$mousemode',
          '$zoom',
          '$fullscreen',
          '$split',
          '$print',
          '$singlepagemode',
          '$continuousmode',
          '$galleymode',
        ],
        fullscreen: ['$fullscreen', '$split', '$print', '$split', '$about'],
        mobile: ['$navigation', '$split', '$about'],
      });
    }
  }, [designerVisible]);

  useEffect(() => {
    if (currentReport && currentDatasets) {
      const report_data = currentReport.report_data as RDLReportDefinition;
      const reportDefinition = {
        definition: report_data,
        displayName: currentReport.report_name, //report_data.displayName,
        id: currentReport.report_name,
      } as SaveReportInfo;
      // @ts-ignore
      DesignerRef.current.setReport(reportDefinition);
      if (isInit) {
        // @ts-ignore
        ViewerRef.current.open(reportDefinition.definition);
        setIsInit(false);
      }
    }
  }, [currentReport, currentDatasets]);

  const onSaveReport = function (info: any) {
    const slices: string[] = getSlices(info?.definition?.DataSets);
    if (info.definition.DataSets.length > 0) {
      const report = {
        report_data: info.definition,
        report_name: info.displayName,
        slices: slices,
      };
      setCurrentReport(current => {
        return { ...current, ...report };
      });
      report.report_data = JSON.stringify(info.definition);
      putActiveReport(
        `/${currentReport.id}`,
        report,
        addSuccessToast,
        addDangerToast,
      );
    } else {
      addDangerToast("The report doesn't contain datasets");
    }
    return Promise.resolve({ displayName: info.displayName });
  };

  const onSaveAsReport = function (info: any) {
    window.$('#saveAs').modal('show');
    return Promise.resolve({ id: info.id, displayName: info.id });
  };

  function onSelectReport(report: any) {
    window.$('#dlgOpen').modal('hide');
    getActiveReportEndpoint(`/${report.id}`, addDangerToast).then(r => {
      setCurrentReport(current => {
        // @ts-ignore
        return { ...current, ...('json' in r ? r.json : null) };
      });
      if (r) {
        if ('json' in r) {
          window.location.assign(`/active_reports/report/${r.json.id}`);
        }
      }
    });
  }

  function onCreateReport() {
    const reportId = `New Report ${++counter.current}`;
    return Promise.resolve({
      definition: templates.CPL,
      id: reportId,
      displayName: reportId,
    });
  }
  function onOpenReport() {
    return new Promise(function (resolve) {
      // @ts-ignore
      currentResolveFn.current = resolve;
      window.$('#dlgOpen').modal('show');
    });
  }

  function onReportPreview(reportView: any) {
    setDesignerVisible(false);
    // @ts-ignore
    ViewerRef.current.open(reportView.definition);
    return Promise.resolve();
  }

  // const handleChangeUpload = (info: { id: string; Name: string; }) => {
  //   const id = reportStorage.length;
  //   info.id = "reporte_" + id;
  //   //setCurrentReport({report_name: info.Name, report_data: JSON.stringify(info)});
  // }

  // @ts-ignore
  const Checkbox = ({ label, checked, onChange }) => (
    <label>
      <input type="checkbox" checked={checked} onChange={onChange} />
      {label}
    </label>
  );

  const handleCheckbox = (e: any) => {
    setCheckbox(!checked);
  };

  const handleSaveAs = () => {
    // @ts-ignore
    const slices: string[] = getSlices(currentReport?.report_data?.DataSets);
    const report = {
      report_data: JSON.stringify(currentReport.report_data),
      report_name: reportName,
      slices: slices,
      is_template: checked,
    };
    postActiveReportEndpoint('/', report, addSuccessToast, addDangerToast)
      .then(r => {
        if (r) {
          if ('json' in r) {
            const { id } = r.json;
            window.location.href = `/active_reports/report/${id}`;
          }
        }
      })
      .catch();
  };

  const exportsSettings = {
    pdf: {
      title: `${reportName}`,
      author: 'SmartNow',
      subject: 'Web Reporting',
      keywords: 'reporting, exports',
      userPassword: '',
      ownerPassword: '',
      printing: 'none',
      copying: false,
      modifying: false,
      annotating: false,
      contentAccessibility: false,
      documentAssembly: false,
      pdfVersion: '1.7',
      autoPrint: true,
      filename: `${reportName}.pdf`,
    },
    xlsx: {
      creator: 'GrapeCity',
      size: 'Letter',
      orientation: 'Landscape',
      sheetName: 'Report',
      password: '',
      filename: `${reportName}.xlsx`,
    },
    html: {
      title: `${reportName}`,
      filename: `${reportName}.html`,
      autoPrint: true,
      multiPage: true,
      embedImages: 'external',
      outputType: 'html',
    },
  };

  return (
    <>
      <div
        id="designer-host"
        style={{ display: designerVisible ? 'block' : 'none' }}
      >
        {' '}
        {/* @ts-ignore */}
        <Designer
          ref={DesignerRef}
          onCreate={onCreateReport}
          onSave={onSaveReport}
          onSaveAs={onSaveAsReport}
          onOpen={onOpenReport}
          onRender={onReportPreview}
        />
      </div>
      {!designerVisible && (
        <div id="viewer-host">
          {/* @ts-ignore */}
          <Viewer
            // @ts-ignore
            ref={ViewerRef}
            exportsSettings={exportsSettings}
            availableExports={allExports
              .filter(exp => exp.available)
              .map(exp => exp.value)}
            sidebarVisible
          />
        </div>
      )}
      <div className="modal" id="saveAs" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h4>{t('New Report')}</h4>
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
                {/* @ts-ignore */}
                <Checkbox
                  label="  is template"
                  checked={checked}
                  onChange={handleCheckbox}
                />
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
              </button>
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
      <div className="modal" id="dlgOpen" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h4>Select Report:</h4>
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
              <div className="list-group">
                {reportStorage.map(report => (
                  <button
                    type="button"
                    className="list-group-item list-group-item-action"
                    onClick={() => onSelectReport(report)}
                  >
                    {/* @ts-ignore */}
                    {report.report_name}
                  </button>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              {/*<Upload onChange={handleChangeUpload}/>*/}
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
