import React, {
  useState,
  useEffect /* , {  useState,  useMemo } */,
} from 'react';
import withToasts from 'src/messageToasts/enhancers/withToasts';
import { Select } from 'src/components';
import { css, JsonObject, SupersetClient, t } from '@superset-ui/core';
import { FormLabel } from 'src/components/Form';
import { Input } from 'src/common/components/index';
import Button from 'src/components/Button';
import { ReportEngine } from '../containers/AddReportDefinitionPage';

interface AddReportDefinitionProps {
  addDangerToast: (msg: string) => void;
  addSuccessToast: (msg: string) => void;
  user: {
    userId: string | number;
  };
  reportEngines: ReportEngine[];
}

interface reportEngineOption {
  label: string;
  value: string;
}

const cssStatic = css`
  flex: 0 0 auto;
`;

export function postReportEnginesEndpoint(
  endpoint: string,
  report_engine_id: number,
  body: any,
) {
  return SupersetClient.post({
    endpoint: encodeURI(
      `/api/v1/report_engines/${report_engine_id}/${endpoint}`,
    ),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
    .then(response => {
      if (response.response.status !== 200) {
        alert('An error has occurred');
      }
      return response.json;
    })
    .catch(error => alert(`An error has occurred, ${error}`));
}

export function postReportDefinitions(endpoint: string, body: any) {
  return SupersetClient.post({
    endpoint: encodeURI(`/api/v1/report_definitions/`),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
    .then(response => {
      if (response.response.status !== 200) {
        alert('An error has occurred');
      }
      return response.json;
    })
    .catch(error => alert(`An error has occurred, ${error}`));
}

function AddReportDefinition(props: AddReportDefinitionProps) {
  const [reportEngine, setReportEngine] = useState<reportEngineOption>();
  const [reportEngines, setReportEngines] = useState<reportEngineOption[]>([]);
  const [reportDefinitionName, setReportDefinitionName] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<FileUploadType | undefined>(
    undefined,
  );
  const [fileContent, setFileContent] = useState<string>('');
  const [
    isValidReportDefinition,
    setIsValidReportDefinition,
  ] = useState<boolean>(false);

  useEffect(() => {
    if (props.reportEngines) {
      setReportEngines(
        props.reportEngines.map((re: ReportEngine) => {
          const { verbose_name, id, engine_type } = re;
          return {
            value: `${verbose_name}$${id}$${engine_type}`,
            label: verbose_name,
          };
        }),
      );
    }
  }, [props.reportEngines]);

  useEffect(() => {
    if (selectedFile) {
      const loadFileContent = async () => {
        const tmp_fileContent = await readFile(selectedFile.selectedFile);
        setFileContent(tmp_fileContent as string);
        return tmp_fileContent;
      };
      loadFileContent()
        .then(res => console.log(res))
        .catch(err => console.log(err));
    }
    setIsValidReportDefinition(false);
  }, [selectedFile]);

  const changeReportEngine = (valor: string) => {
    setReportEngine({
      label: valor.split('$')[1],
      value: valor,
    });
  };

  const onRDNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReportDefinitionName(e.target.value);
  };

  const OnFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];
    const file_name: string = file.name;
    // Update the state
    setSelectedFile({ selectedFile: file, selectedFileName: file_name });
  };

  const gotoReportDefinitionList = () => {
    OnAddReportDefinition();
    window.location.href = '/report_definitions/list/';
  };

  const isBtnDisabled = () =>
    !(
      reportEngine &&
      reportDefinitionName &&
      selectedFile &&
      isValidReportDefinition
    );

  const isBtnValidateDisabled = () =>
    !(selectedFile && fileContent && !isValidReportDefinition);

  const OnValidateReport = () => {
    console.log(selectedFile);
    const body = {
      report_definition: fileContent,
      report_name: selectedFile?.selectedFileName,
    };
    postReportEnginesEndpoint('validate/', 1, body)
      .then((res: JsonObject) => {
        const isValid = !!res.json?.is_valid;
        setIsValidReportDefinition(isValid);
      })
      .catch(err => console.log(`err: ${err}`));
  };

  const OnAddReportDefinition = () => {
    console.log('adding Report Definition');
    console.log(reportEngine?.label);
    console.log(reportEngine?.value);
    const engines: number[] = [];
    props.reportEngines.forEach(re => {
      if (re.id.toString() === reportEngine?.label) {
        engines.push(re.id);
      }
    });
    const body = {
      report_name: reportDefinitionName,
      report_title: selectedFile?.selectedFileName,
      report_definition: fileContent,
      engines,
    };
    postReportDefinitions('/', body)
      .then((res: JsonObject) => {
        console.log(res);
      })
      .catch(err => console.log(`err: ${err}`));
  };

  const readFile = (file: any) =>
    new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        resolve((fileReader?.result as string).split(/base64,/)[1]);
      };
      fileReader.onerror = () => {
        reject(fileReader.error);
      };
      fileReader.readAsDataURL(file);
    });

  return (
    <>
      <div className="report-engine">
        <Select
          autoFocus
          ariaLabel={t('Report Engine')}
          name="select-report-engine"
          header={<FormLabel required>{t('Choose a Report Engine')}</FormLabel>}
          onChange={changeReportEngine}
          options={reportEngines}
          placeholder={t('Choose a Report Engine')}
          showSearch
          value={reportEngine?.value}
        />
      </div>
      <br />
      <div className="fupload-report-definition">
        <FormLabel required>{t('Enter the Report Definition name')}</FormLabel>
        <Input
          type="text"
          name="input-report-definition-name"
          onChange={onRDNameChange}
          placeholder="Report Definition Name"
          value={reportDefinitionName}
        />
        <br />
        <FileUpload selectedFile={selectedFile} OnFileChange={OnFileChange} />
        <Button
          buttonStyle="primary"
          disabled={isBtnValidateDisabled()}
          onClick={OnValidateReport}
        >
          {t('Validate Report')}
        </Button>
      </div>
      <div className="btn-add-report-definition">
        <Button
          css={[
            cssStatic,
            css`
              align-self: flex-end;
            `,
          ]}
          buttonStyle="primary"
          disabled={isBtnDisabled()}
          onClick={gotoReportDefinitionList}
        >
          {t('Create new report definition')}
        </Button>
      </div>
    </>
  );
}

type FileUploadType = {
  selectedFile?: File;
  selectedFileName?: string;
};

interface FileUploadProps {
  addDangerToast?: (msg: string) => void;
  addSuccessToast?: (msg: string) => void;
  user?: {
    userId: string | number;
  };
  selectedFile?: FileUploadType;
  OnFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function FileUpload(props: FileUploadProps) {
  // const onFileUpload = () => {
  //   // Create an object of formData
  //   const formData = new FormData();
  //
  //   const selectedFile = state.selectedFile ? state.selectedFile : '';
  //   const selectedFilename = state.selectedFile ? state.selectedFile.name : '';
  //   // Update the formData object
  //   formData.append('myFile', selectedFile, selectedFilename);
  //
  //   // Details of the uploaded file
  //   console.log(state.selectedFile);
  //
  //   // Request made to the backend api
  //   // Send formData object
  // };

  return (
    <div>
      <div className="file-upload-header">
        <FormLabel required>{t('Insert Report Engine Name')}</FormLabel>
      </div>
      <div className="file-upload-content">
        <input type="file" onChange={props.OnFileChange} />
      </div>
    </div>
  );
}

export default withToasts(AddReportDefinition);
