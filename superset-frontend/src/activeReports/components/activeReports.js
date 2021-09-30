import React, {useState} from 'react';
import {Designer, Viewer} from '@grapecity/activereports-react';
import {SupersetClient} from "@superset-ui/core";
import {saveSliceSuccess} from "../../explore/actions/saveModalActions";


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

// await SupersetClient.put({
//   endpoint: `/api/v1/chart/${slice.slice_id}`,
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({
//     query_context: JSON.stringify(queryContext),
//     query_context_generation: true,
//   })
function ActiveReportsComponent() {
  const [designer, setDesigner] = useState({id: '', displayName: ''});
  const [viewer, setViewer] = useState({Uri: ''});

  const [reports, setReports] = useState([]);

  const [view, setView] = useState(true);

  const [count, setCount] = useState(1);
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
    const url = '/api/v1/active_report/'
    postActiveReportEndpoint(url, report);

  }

  const btnListReports = () => {
    SupersetClient.get({
      endpoint: "/api/v1/active_report/"
    })
      .then(response => {
        console.log("get list ACTIVE REPORT\n\n")
        console.log(response)
      })
    console.log(reports);
  }

  const deleteReport = () => {

  }

  const getReportByID = () => {
    const id = 1;
    SupersetClient.get({
      endpoint: `/api/v1/active_report/${id}`
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
        {!view ? <Viewer report={viewer}/> : <Designer report={designer}/>}
      </div>
    </>
  );
}

export default ActiveReportsComponent;
