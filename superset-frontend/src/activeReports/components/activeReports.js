import React, {useEffect, useState} from 'react';
import {Designer, Viewer} from '@grapecity/activereports-react';
import {SupersetClient} from "@superset-ui/core";
import {saveSliceSuccess} from "../../explore/actions/saveModalActions";

import {useReport} from "src/activeReports/hooks/apiResources/reports";
import {useParams} from "react-router-dom";


export function Upload(props) {
  const [files, setFiles] = useState("");

  const handleChange = e => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = e => {
      console.log("e.target.result", e.target.result);
      setFiles(e.target.result);
      const result = JSON.parse(e.target.result)
      props.onChange(result)
    };
  };
  return (

    <>
      <h1>Upload Json file - Example</h1>

      <input type="file" onChange={handleChange}/>
    </>
  );
}

function postActiveReportEndpoint(url, report) {
  return SupersetClient.post({
    endpoint: url,
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(report)
  })
    .then(response => {
      console.log("POST REPORT RESPONSE\n\n")
      console.log(response)

    }).catch(error => console.log(error))

}

export function SetViewer(props){
  const viewerRef = React.useRef();
  console.log(props.name)
  React.useEffect(() => {
    async function loadReport() {
      await fetch(props.name)
        .then((data) => data.json())
        .then((report) => {
          report.Page.PageOrientation = "Landscape";
          viewerRef.current.Viewer.open(report);
        });
    }
    loadReport().then(r => console.log("success"));
  }, []);

  return (
    <div id="viewer-host">
      <Viewer ref={viewerRef} />
    </div>
  );
}

// await SupersetClient.put({
//   endpoint: `/api/v1/chart/${slice.slice_id}`,
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({
//     query_context: JSON.stringify(queryContext),
//     query_context_generation: true,
//   })
function ActiveReportsComponent() {
  const [designer, setDesigner] = useState({id: '', displayName: ''});
  const [viewer, setViewer] = useState({id: ''});

  const [reports, setReports] = useState([]);

  const [view, setView] = useState(true);

  const [currentReport, setCurrentReport] = useState(2);
  // const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const { result: report, error: reportApiError } = useReport(
    currentReport,
  );

  const viewerRef = React.useRef();
  const DesignerRef = React.createRef();

  useEffect(()=> {
    // { definition: Report; displayName?: undefined | string; id?: undefined | string }
    console.log(report);
    if(report) {
      console.log(report.report_data);
      const report_data = report.report_data;
      console.log(`Report data\n${report_data}\n`)


      report_data.Page.PageOrientation = "Landscape";

      const reportDefinition = {
        definition: report_data,
        displayName: report_data.Name,
        id: report.report_name,
      }

      DesignerRef.current.setReport(reportDefinition);
      // setViewer({id: report_data});
    }
  }, [report])
  // React.useEffect(() => {
  //   async function loadReport() {
  //     await fetch("/reports/Invoice")
  //       .then((data) => data.json())
  //       .then((report) => {
  //         report.Page.PageOrientation = "Landscape";
  //         viewerRef.current.Viewer.open(report);
  //       });
  //   }
  //   loadRepo

  const handleChange = value => {
    setView(value);
  };

  const btnClick = function () {
    handleChange(true);
    setDesigner({id: 'report.rdlx-json', displayName: 'My report'});
  };

  const btnClickViewer = function () {
    handleChange(false);
    setViewer({Uri: 'report.rdlx-json'});
  };

  const handleChangeUpload = (report) => {
    setReports(prevState => {
      return [...prevState, {...report}]
    })
  }
  const btnAddReport = () => {
    const id = reports.length
    console.log(reports)
    console.log(reports[id-1])
    const report = {report_name: "reporte_" + id, report_data: JSON.stringify(reports[id-1])}
    console.log("reporte \n\n")
    console.log(report)
    console.log("\nreporte string\n\n")
    console.log(JSON.stringify(report))
    const url = '/api/v1/active_reports/'
    postActiveReportEndpoint(url, report);

  }

  const btnListReports = () => {
    SupersetClient.get({
      endpoint: "/api/v1/active_reports/"
    })
      .then(response => {
        console.log("get list ACTIVE REPORT\n\n")
        console.log(response)
      })
    console.log(reports);
  }

  const deleteReport = () => {
    console.log(report)

  }

  const getReportByID = () => {
    const id = 2;
    SupersetClient.get({
      endpoint: `/api/v1/active_reports/${id}`
    })
      .then(response => {
        console.log("get REPORT BY ID ACTIVE REPORT\n\n")
        console.log(response)
      })
    console.log(reports);
  }
  return (
    <>
      <div id="designer-host">
        <button type="button" onClick={btnAddReport}>
          Crear Reporte
        </button>
        <button type="button" onClick={btnListReports}>
          Lista Reportes
        </button>
        <button type="button" onClick={deleteReport}>
          Eliminar Reporte
        </button>
        <button type="button" onClick={getReportByID}>
          Open Report por ID
        </button>

        <button type="button" onClick={btnClickViewer}>
          Full Screen
        </button>
        <button type="button" onClick={btnClick}>
          Open Report
        </button>
        <Upload onChange={handleChangeUpload} />
        {(!view && viewerRef) ? <Viewer ref={viewerRef}/> : <Designer ref={DesignerRef}/>}
      </div>
    </>
  );
}

export default ActiveReportsComponent;
