import {
  t,
  // SupersetTheme,
  // FeatureFlag,
  // isFeatureEnabled,
  SupersetClient,
  styled,
} from '@superset-ui/core';
import React, {
  // FunctionComponent,
  useEffect,
  useState,
  // useReducer,
  // Reducer,
} from 'react';
import { useHistory } from 'react-router-dom';
// import Tabs from 'src/components/Tabs';
// import { Select } from 'src/common/components';
// import Alert from 'src/components/Alert';
import Modal from 'src/components/Modal';
// import Button from 'src/components/Button';
// import IconButton from 'src/components/IconButton';
// import InfoTooltip from 'src/components/InfoTooltip';
import withToasts from 'src/components/MessageToasts/withToasts'
// import AddReportEnginePage from 'src/reportsintegration/report_engine/containers/AddReportEnginePage';
import { Radio } from 'src/components/Radio';
import Loading from 'src/components/Loading';
import {
  // antDModalNoPaddingStyles,
  // antDModalStyles,
  // buttonLinkStyles,
  // formHelperStyles,
  // formStyles,
  // infoTooltip,
  // SelectDatabaseStyles,
  StyledFooterButton,
} from '../../../../views/CRUD/data/database/DatabaseModal/styles';
import { noOp } from '../../../../utils/common';

const DEFAULT_RENDER_REPORT_FORMAT = 'HTML';
interface ReportDefinitionModalProps {
  addDangerToast: (msg: string) => void;
  addSuccessToast: (msg: string) => void;
  onHide: () => void;
  show: boolean;
  reportDefinitionId: number;
}

interface ReportDefinitionResponse {
  id: number;
  report_name: string;
  report_title: string;
}

const StyledRadio = styled(Radio)`
  display: block;
  line-height: ${({ theme }) => theme.gridUnit * 7}px;
`;

const StyledRadioGroup = styled(Radio.Group)`
  margin-left: ${({ theme }) => theme.gridUnit * 5.5}px;
`;

const loadReportDefinition = (reportDefinitionId: number) =>
  SupersetClient.get({
    endpoint: `/api/v1/report_definitions/${reportDefinitionId}`,
    headers: { 'Content-Type': 'application/json' },
  })
    .then(res => {
      console.log(res);
      // return { id: res.id as number,  };
      return res.json.result;
    })
    .catch(err => {
      console.log(err);
      return err;
    });

const ReportDefinitionModal = (props: ReportDefinitionModalProps) => {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [
    reportDefinition,
    setReportDefinition,
  ] = useState<ReportDefinitionResponse>();
  const [isHTML, setIsHTML] = useState<boolean>(true);
  const [renderReportFormat, setRenderReportFormat] = useState<string>(
    DEFAULT_RENDER_REPORT_FORMAT,
  );

  const reportRenderFormat = ['HTML', 'PDF'];

  const history = useHistory();

  useEffect(() => {
    if (props.reportDefinitionId) {
      (async () => {
        const reportDef = await loadReportDefinition(props.reportDefinitionId);
        if (reportDef) {
          setReportDefinition(reportDef);
        }
      })();
    }
  }, [props.reportDefinitionId]);

  const onClose = () => {
    props.onHide();
  };

  const onSave = async () => {
    noOp();
    setLoading(false);
    onRouteChange();
  };

  const onRenderFormatChange = (event: any) => {
    const { target } = event;
    const render_report_format = target.value;
    setRenderReportFormat(render_report_format);
    setIsHTML(render_report_format === 'HTML');
  };

  const onRouteChange = () => {
    const render_report_format = isHTML ? 'HTML' : 'PDF';
    const newPath = `/report_definitions/render_report/${props.reportDefinitionId}/${render_report_format}`;
    // if (isHTML) history.push(newPath);
    // else {
    //   SupersetClient.get({ endpoint: newPath }).then(r => console.log(r));
    // }
    history.push(newPath);
  };

  const renderModalFooter = () => (
    <>
      <StyledFooterButton key="back" onClick={onClose}>
        Back
      </StyledFooterButton>
      <StyledFooterButton
        key="submit"
        buttonStyle="primary"
        onClick={onSave}
        data-test="modal-confirm-button"
      >
        Render Report
      </StyledFooterButton>
    </>
  );

  return (
    <div>
      <Modal
        name="openreportdefinition"
        onHandledPrimaryAction={onSave}
        onHide={onClose}
        primaryButtonName={t('Open Report Definition')}
        width="50vw"
        centered
        show={props.show}
        title={<h4>{t('Open External Report')}</h4>}
        footer={renderModalFooter()}
      >
        {reportDefinition ? (
          <>
            <div>
              <h3> {reportDefinition.report_name}</h3>
            </div>
            <div className="inline-container">
              <StyledRadioGroup
                onChange={onRenderFormatChange}
                value={renderReportFormat}
              >
                {reportRenderFormat.map(format => (
                  <StyledRadio value={format}>
                    {t(`Render report as ${format}`)}
                  </StyledRadio>
                ))}
              </StyledRadioGroup>
            </div>
          </>
        ) : null}

        {isLoading && <Loading />}
      </Modal>
    </div>
  );
};

export default withToasts(ReportDefinitionModal);
