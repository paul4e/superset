import React, {
  useState,
  useEffect /* , {  useState,  useMemo } */,
} from 'react';
import withToasts from 'src/messageToasts/enhancers/withToasts';
import { Select } from 'src/components';
import { css, JsonObject, styled, SupersetClient, t } from '@superset-ui/core';
import { FormItem, FormLabel } from 'src/components/Form';
import { Row, Col, Input, TextArea } from 'src/common/components';
import Button from 'src/components/Button';
import { JsonEditor } from '../../../components/AsyncAceEditor';
import LoadMultipleFiles from '../../components/LoadMultipleFiles';
import FileUploadType from '../../types/FileUploadType';
// import { styled, t, css, useTheme } from '@superset-ui/core';
import { MAX_ADVISABLE_VIZ_GALLERY_WIDTH } from '../../../explore/components/controls/VizTypeControl/VizTypeGallery';

const StyledContainer = styled.div`
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    width: 100%;
    max-width: ${MAX_ADVISABLE_VIZ_GALLERY_WIDTH}px;
    //max-width: 100em;
    border-radius: ${({ theme }) => theme.gridUnit}px;
    background-color: ${({ theme }) => theme.colors.grayscale.light5};
    margin-left: auto;
    margin-right: auto;
    padding-left: ${({ theme }) => theme.gridUnit * 4}px;
    padding-right: ${({ theme }) => theme.gridUnit * 4}px;
    padding-bottom: ${({ theme }) => theme.gridUnit * 4}px;
    
    h3 {
      padding-bottom: ${({ theme }) => theme.gridUnit * 3}px;
    }
    
    .file-upload {
      display: flex;
      flex: 1 1 auto;
      align-items: flex-start;
      flex-direction: column;
      width: 90%;
      height: 100px;
      margin: 20px;
    }
  
    .report-engine {
      border: 1px solid ${({ theme }) => theme.colors.grayscale.light2};
      border-radius: ${({ theme }) => theme.gridUnit}px;
      margin: ${({ theme }) => theme.gridUnit * 3}px 0px;
      flex: 1 1 auto;
      margin-bottom: 0px;
      padding-bottom: 1rem;
    }
    
    .json-metadata {
      border: 1px solid ${({ theme }) => theme.colors.grayscale.light2};
      border-radius: ${({ theme }) => theme.gridUnit}px;
      margin: ${({ theme }) => theme.gridUnit * 3}px 0px;
      flex: 1 1 auto;
      margin-top: 0;
    }
  
    .file-uploads {
      border: 1px solid ${({ theme }) => theme.colors.grayscale.light2};
      border-radius: ${({ theme }) => theme.gridUnit}px;
      margin: ${({ theme }) => theme.gridUnit * 3}px 0px;
      flex: 1 1 auto;
      margin-bottom: 0px;
      padding-bottom: 1rem;
    }
    .fupload-report-definition {
      display: flex;
      justify-content: space-between;
      flex-direction: column;
      align-items: start;
    }

    .page-title {
      margin: 15px;
      border-bottom: 1px solid ${({ theme }) => theme.colors.grayscale.light2};
    }
    .page-title > h1 {
      margin-left: 15px;
      color: ${({ theme }) => theme.colors.grayscale.dark2};
    }
    .input-name {
      margin: 20px;
    }
    .select-engine {
      margin: 20px;
    }
    .input-description {
      margin: 20px
    }
    
    .json-editor {
      display: flex;
      flex-direction: column;
      align-item: flex-start;
      margin-left: 2rem;
    }
    
    .ant-form-item-label {
      display: flex;
      flex-direction: column;
      align-item: flex-start;
    }
    
    .btn-select-rptdesign {
      margin-top: 1rem;
      min-width: 12rem;
    }
    .validate-report {
      display: flex;
      flex-direction: row-reverse;
    }

    .validate-report .btn-validate-report {
      margin-right: 1.5rem;
    }
  
    .add-report-definition {
      display: flex;
      flex-direction: row-reverse;
      //margin-right: 2rem;
      
    }
    .add-report-definition .btn-add-report-definition {
      display: block;
      min-width: 12rem;
      align-content: center;
    }
  
  }`;

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

interface ReportEngine {
  id: number;
  verbose_name: string;
  engine_type: string;
}

const cssStatic = css`
  flex: 0 0 auto;
`;

const StyledJsonEditor = styled(JsonEditor)`
  border-radius: ${({ theme }) => theme.borderRadius}px;
  border: 1px solid ${({ theme }) => theme.colors.secondary.light2};
`;

type PostCSVFileType = {
  csv_data?: string;
  file_name?: string;
};

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
    .then(response => response.json)
    .catch(error => alert(`An error has occurred, ${error}`));
}

export function postReportDefinitions(endpoint: string, body: any) {
  return SupersetClient.post({
    endpoint: encodeURI(`/api/v1/report_definitions/`),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
    .then(response => response.json)
    .catch(error => alert(`An error has occurred, ${error}`));
}

function postCSVFile(body: PostCSVFileType) {
  return SupersetClient.post({
    endpoint: encodeURI(`/reports/add_csv`),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
    .then(response => response.json)
    .catch(error => {
      console.log(error);
      alert(`An error has ocurred,`);
    });
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
  const [selectedCSVs, setSelectedCSVs] = useState<FileUploadType[]>([]);

  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);
  const [description, setDescription] = useState('');

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
      label: valor.split('$')[0],
      value: valor,
    });
  };

  useEffect(() => {
    console.log(selectedCSVs);
  }, [selectedCSVs]);

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

  const OnCSVFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert the FileList into an array and iterate
    const selectedFiles: FileUploadType[] = Array.from(
      e.target.files as FileList,
    ).map(file => {
      const selectedFile: FileUploadType = {
        selectedFile: file,
        selectedFileName: file.name,
      };
      return selectedFile;
    });
    setSelectedCSVs(prev => [...prev, ...selectedFiles]);
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

  const toggleAdvanced = () => {
    setIsAdvancedOpen(status => !status);
  };

  const uploadCSVs = async () => {
    selectedCSVs.forEach(file => {
      const loadContent = async () => {
        const content = await readFile(file.selectedFile);
        const reqBody: PostCSVFileType = {
          csv_data: content as string,
          file_name: file.selectedFileName,
        };
        await postCSVFile(reqBody);
      };
      loadContent();
    });
  };

  const OnValidateReport = () => {
    console.log(selectedFile);
    const x = async () => {
      await uploadCSVs();
    };

    x();

    const body = {
      report_definition: fileContent,
      report_name: selectedFile?.selectedFileName,
    };
    const reportEngineID = reportEngine?.value.split('$')[1];
    if (reportEngineID) {
      postReportEnginesEndpoint('validate/', +reportEngineID as number, body)
        .then((res: JsonObject) => {
          const isValid = !!res.json?.is_valid;
          setIsValidReportDefinition(isValid);
        })
        .catch(err => console.log(`err: ${err}`));
    }
  };

  const OnAddReportDefinition = () => {
    console.log('adding Report Definition');
    console.log(reportEngine?.label);
    console.log(reportEngine?.value);
    const engines: number[] = [];
    props.reportEngines.forEach(re => {
      if (re.id.toString() === reportEngine?.value.split('$')[1]) {
        engines.push(re.id);
      }
    });
    const body = {
      report_name: reportDefinitionName,
      report_title: selectedFile?.selectedFileName,
      report_definition: fileContent,
      engines,
      description,
    };
    console.log(body);
    console.log(engines);
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

  const onDeleteCSV = (file: string) => {
    const csvs = selectedCSVs.filter(cfile => {
      const fName: string = (cfile.selectedFileName ||
        cfile.selectedFile?.name) as string;
      return fName !== file;
    });
    setSelectedCSVs(csvs);
  };

  return (
    <StyledContainer>
      <div className="page-title row">
        <h3 css={cssStatic}> {t('New External Report')}</h3>
      </div>
      <Row>
        <Col xs={12} md={12} className="report-engine">
          <div className="select-engine">
            <Select
              autoFocus
              ariaLabel={t('Report Engine')}
              name="select-report-engine"
              header={
                <FormLabel required>{t('Choose a Report Engine')}</FormLabel>
              }
              onChange={changeReportEngine}
              options={reportEngines}
              placeholder={t('Choose a Report Engine')}
              showSearch
              value={reportEngine?.value}
            />
          </div>
          <div className="input-name">
            <FormLabel required>
              {t('Enter the Report Definition name')}
            </FormLabel>
            <Input
              type="text"
              name="input-report-definition-name"
              onChange={onRDNameChange}
              placeholder="Report Definition Name"
              value={reportDefinitionName}
            />
          </div>
          <div className="input-description">
            <FormLabel>{t('Enter a description')}</FormLabel>
            <TextArea
              rows={3}
              name="description"
              value={description}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                setDescription(event.target.value ?? '')
              }
            />
          </div>
        </Col>
        <Col xs={12} md={12} className="file-uploads">
          <div className="fupload-report-definition">
            <FileUpload
              selectedFile={selectedFile}
              OnFileChange={OnFileChange}
            />
            <LoadMultipleFiles
              OnFileChange={OnCSVFilesChange}
              selectedFiles={selectedCSVs}
              accept=".csv"
              handleDelete={onDeleteCSV}
            />
          </div>
          <div className="validate-report">
            <Button
              className="btn-validate-report"
              buttonStyle="primary"
              disabled={isBtnValidateDisabled()}
              onClick={OnValidateReport}
            >
              {t('Validate Report')}
            </Button>
          </div>
        </Col>
      </Row>
      <Row>
        <Col xs={24} md={24} className="json-metadata">
          <h3 style={{ marginTop: '1em', marginLeft: '1em' }}>
            <Button buttonStyle="link" onClick={toggleAdvanced}>
              <i
                className={`fa fa-angle-${isAdvancedOpen ? 'down' : 'right'}`}
                style={{ minWidth: '1em' }}
              />
              {t('Detailed Information')}
            </Button>
          </h3>
          {isAdvancedOpen && (
            <FormItem className="json-editor" label={t('Metadata')}>
              <StyledJsonEditor
                showLoadingForImport
                name="json_metadata"
                defaultValue="{'info': Report Information }"
                value="values.json_metadata"
                onChange={() => {}}
                tabSize={2}
                width="95%"
                height="200px"
                wrapEnabled
              />
              <p className="help-block">
                {t(
                  'This JSON object is generated dynamically when clicking Validating a Report Definition.',
                )}
              </p>
            </FormItem>
          )}
        </Col>
      </Row>
      <div className="add-report-definition">
        <Button
          className="btn-add-report-definition"
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
          {t('Add External Report')}
        </Button>
      </div>
    </StyledContainer>
  );
}

// type FileUploadType = {
//   selectedFile?: File;
//   selectedFileName?: string;
// };

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
  const hiddenFileInput = React.useRef<HTMLInputElement>(null);

  const handleClick = (e: React.ChangeEvent<any>) => {
    if (hiddenFileInput.current) {
      hiddenFileInput.current.click();
    }
  };
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
    <div className="file-upload">
      <div className="file-upload-header">
        <FormLabel required>{t('Select Report Definition File')}</FormLabel>
        <Input
          type="text"
          name="input-report-definition-file"
          placeholder="No file selected"
          value={props.selectedFile?.selectedFileName}
          disabled
          style={{ width: '100%' }}
        />
      </div>
      <Button
        className="btn-select-rptdesign"
        buttonStyle="primary"
        onClick={handleClick}
      >
        Select Report
      </Button>
      <div className="file-upload-content">
        <input
          ref={hiddenFileInput}
          type="file"
          accept=".rptdesign"
          onChange={props.OnFileChange}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}

export default withToasts(AddReportDefinition);
