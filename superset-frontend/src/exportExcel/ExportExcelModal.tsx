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
import React, {FunctionComponent, useState, useEffect, /*useRef*/} from 'react';
// import Alert from 'src/components/Alert';
import Button from 'src/components/Button';
import {styled, t /*SupersetClient*/} from '@superset-ui/core';
// import {Col, Row} from 'react-bootstrap';

import Modal from 'src/components/Modal';
// import {isFeatureEnabled, FeatureFlag} from 'src/featureFlags';

// import { getClientErrorObject } from 'src/utils/getClientErrorObject';
import withToasts from 'src/messageToasts/enhancers/withToasts';
// import PropTypes from 'prop-types';
// import {chartPropShape} from 'src/dashboard/util/propShapes';
import AsyncEsmComponent from 'src/components/AsyncEsmComponent';
import { generateColumnsInfo, exportChartExcel } from "./exportExcelUtils";
import { ColumnConfig } from "./types";
// import {getClientErrorObject} from "../utils/getClientErrorObject";
// import Alert from "../components/Alert";


const ExportExcelEditor = AsyncEsmComponent(() =>
  import('./ExportExcelEditor'),
);

const StyledExportExcelModal = styled(Modal)`
  .modal-content {
    height: 900px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .modal-header {
    flex: 0 1 auto;
  }

  .modal-body {
    flex: 1 1 auto;
    overflow: auto;
  }

  .modal-footer {
    flex: 0 1 auto;
  }

  .ant-modal-body {
    overflow: visible;
  }
`;

// const propTypes = {
//   addSuccessToast: PropTypes.func,
//   onChange: PropTypes.func,
//   onDatasourceSave: PropTypes.func,
//   onHide: PropTypes.func,
//   datasource: PropTypes.object,
//   show: PropTypes.bool,
//   actions: PropTypes.object.isRequired,
//   addHistory: PropTypes.func,
//   can_overwrite: PropTypes.bool.isRequired,
//   can_download: PropTypes.bool.isRequired,
//   isStarred: PropTypes.bool.isRequired,
//   slice: PropTypes.object,
//   sliceName: PropTypes.string,
//   table_name: PropTypes.string,
//   form_data: PropTypes.object,
//   ownState: PropTypes.object,
//   timeout: PropTypes.number,
//   chart: chartPropShape,
//   queriesResponse: PropTypes.array,
// };

interface ExportExcelModalProps {
  addSuccessToast: (msg: string) => void;
  // datasource: any;
  onChange: () => {};
  // onDatasourceSave: (datasource: object, errors?: Array<any>) => {};
  onHide: () => {};
  onExportExcel: (exportFormData: any, exportConfig: any) => {};
  show: boolean;
  queriesResponse: object[];
  formData: object;
}

/*
* metadata excel info {
* columns_info: ..
* header_info: ..
* colnames: ..
* previewData:
*
*
*
*
* */
function generatePreviewData(queryResponse: any) {
  console.log('generate preview data');
  console.log(queryResponse)

  // const colnames = if queriesResponse.colnames ? queriesResponse.colnames :
  const previewHeaders: string[] = [queryResponse.colnames.map((col: string) => {
    return {value: col};
  })];
  const data = queryResponse.data;
  data.length = 10;
  const previewData: any[] = [];

  data.forEach((row: any) => {
    let rowList = [];
    for (const item in row) {
      rowList.push({value: row[item]});
    }
    previewData.push(rowList);
  });
  // const dataFinal = previewHeaders.concat(previewData);
  const dataFinal = [...previewHeaders, ...previewData];

  console.log(dataFinal)
  return dataFinal;
}

const ExportExcelModal: FunctionComponent<ExportExcelModalProps> = ({
  addSuccessToast,
  onHide,
  show,
  queriesResponse,
  onExportExcel,
  formData,
}) => {
  // const [errors, setErrors] = useState<any[]>([]);
  const [currentColumnsInfo, setCurrentColumnsConfig] = useState<ColumnConfig[]>([]);
  const [currentPreviewData, setCurrentPreviewData] = useState<any[]>([]);
  // const dialog = useRef<any>(null);
  // const [modal, contextHolder] = Modal.useModal();

  useEffect(() => {
    console.log('useeffect0')
    if (queriesResponse && queriesResponse.length > 0) {
      const queryResponse = queriesResponse[0];

      if (queryResponse) {
        const columnsInfo: ColumnConfig[] = generateColumnsInfo(queryResponse);
        setCurrentColumnsConfig(columnsInfo);
        console.log("QueriesResponse changed setting columns info");
      }
    }

  }, [queriesResponse]);

  useEffect(() => {
    console.log('useeffect1')
    if (queriesResponse && queriesResponse.length > 0) {
      const queryResponse = queriesResponse[0];

      if (queryResponse) {
        const previewData: any[] = generatePreviewData(queryResponse);
        setCurrentPreviewData(previewData);
        console.log("columns info changed setting preview data");
      }
    }
  }, [currentColumnsInfo]);

  // const onConfirmSave = () => {
  //   console.log('clicked save')
  // }
  //
  // const renderSaveDialog = () => (
  //   <div>
  //     <Alert
  //       css={theme => ({
  //         marginTop: theme.gridUnit * 4,
  //         marginBottom: theme.gridUnit * 4,
  //       })}
  //       type="warning"
  //       showIcon
  //       message={t(`The dataset configuration exposed here
  //               affects all the charts using this dataset.
  //               Be mindful that changing settings
  //               here may affect other charts
  //               in undesirable ways.`)}
  //     />
  //     {t('Are you sure you want to save and apply changes?')}
  //   </div>
  // );
  //
  // const onClickSave = () => {
  //   dialog.current = modal.confirm({
  //     title: t('Confirm save'),
  //     content: renderSaveDialog(),
  //     onOk: onConfirmSave,
  //     icon: null,
  //   });
  // };

  const onClickExportExcel = () => {
   // const exportConfig = {columnsInfo: currentColumnsInfo};
    onHide();
    return exportChartExcel({
      formData,
      resultFormat: 'xlsx',
      resultType: 'full'
    })
    // return onExportExcel(formData, exportConfig);
  }

  // const onConfirmExportExcel = () => {
  //
  // }

  return (
      <StyledExportExcelModal
        show={show}
        onHide={onHide}
        title={
          <span>
            {t('Export slice to excel ')}
            {/* <strong>{currentDatasource.table_name}</strong> */}
          </span>
        }
        footer={
          <>
            <Button
              data-test="datasource-modal-cancel"
              buttonSize="small"
              className="m-r-5"
              onClick={onHide}
            >
              {t('Cancel')}
            </Button>
            <Button
              buttonSize="small"
              buttonStyle="primary"
              data-test="datasource-modal-save"
              onClick={onClickExportExcel}
              // disabled={isSaving || errors.length > 0}
            >
              {t('Export Excel')}
            </Button>
          </>
        }
        responsive
      >
        <ExportExcelEditor
          queriesResponse={queriesResponse}
          previewData={currentPreviewData}
          columns_info={currentColumnsInfo}
          />
        {/*{contextHolder}*/}
      </StyledExportExcelModal>
    );
}
// export class ExportExcelModal extends React.PureComponent {
//   constructor(props) {
//     super(props);
//     console.log('props')
//     console.log(props)
//     this.state = {
//       previewData: [],//generatePreviewData(props.queriesResponse),
//       isPrevieDataLoaded: false,
//       columnsInfo: [],
//       isColumnsInfoLoaded: false,
//     };
//
//     // this.createPreviewData = this.createPreviewData.bind(this);
//     this.setPreviewData = this.setPreviewData.bind(this);
//   };
//
//   componentDidMount() {
//     // this.setPreviewData();
//     // this.setColumnsInfo();
//   }
//
//   componentDidUpdate() {
//     this.setPreviewData();
//     this.setColumnsInfo();
//   }
//
//   setPreviewData() {
//     if (this.props.queriesResponse && !this.state.isPrevieDataLoaded) {
//       const previewData = generatePreviewData(this.props.queriesResponse[0]);
//       this.setState({previewData: previewData, isPrevieDataLoaded: true})
//     }
//   }
//
//   setColumnsInfo() {
//     if (this.props.queriesResponse && !this.state.isColumnsInfoLoaded) {
//       const columns_info = generateColumnsInfo(this.props.queriesResponse[0]);
//       console.log('set columns info');
//       console.log(columns_info);
//       this.setState({columnsInfo: columns_info, isColumnsInfoLoaded: true});
//     }
//   }
//
//   render() {
//     // const form_data = this.props.form_data;
//     // const form_data_str = JSON.stringify(form_data);
//     //
//
//     const queriesResponse = this.props.queriesResponse;
//     const show = this.props.show;
//     const onHide = this.props.onHide;
//     console.log('**********Export excel modal start**********');
//     console.log('queries response');
//     console.log(queriesResponse);
//     // console.log('form_data');
//     // console.log(form_data);
//     console.log(this.state.previewData);
//     // this.setPreviewData();
//     console.log(this.state.columnsInfo);
//     console.log('**********Export excel modal end**********');
//
//     return (
//       <StyledExportExcelModal
//         show={show}
//         onHide={onHide}
//         title={
//           <span>
//             {t('Export slice to excel ')}
//             {/* <strong>{currentDatasource.table_name}</strong> */}
//           </span>
//         }
//         footer={
//           <>
//             <Button
//               data-test="datasource-modal-cancel"
//               buttonSize="small"
//               className="m-r-5"
//               onClick={onHide}
//             >
//               {t('Cancel')}
//             </Button>
//             <Button
//               buttonSize="small"
//               buttonStyle="primary"
//               data-test="datasource-modal-save"
//               // onClick={onClickSave}
//               // disabled={isSaving || errors.length > 0}
//             >
//               {t('Export Excel')}
//             </Button>
//           </>
//         }
//         responsive
//       >
//         <ExportExcelEditor
//           queriesResponse={queriesResponse}
//           previewData={this.state.previewData}
//           columns_info={this.state.columnsInfo}
//           />
//       </StyledExportExcelModal>
//     );
//   }
// }
//
// ExportExcelModal.propTypes = propTypes;

export default withToasts(ExportExcelModal);
