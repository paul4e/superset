import {
  t,
  SupersetTheme,
  // FeatureFlag,
  // isFeatureEnabled,
} from '@superset-ui/core';
import React, {
  // FunctionComponent,
  // useEffect,
  useState,
  // useReducer,
  // Reducer,
} from 'react';
// import Tabs from 'src/components/Tabs';
// import { Select } from 'src/common/components';
// import Alert from 'src/components/Alert';
import Modal from 'src/components/Modal';
// import Button from 'src/components/Button';
// import IconButton from 'src/components/IconButton';
// import InfoTooltip from 'src/components/InfoTooltip';
import withToasts from 'src/components/MessageToasts/withToasts';
import AddReportEnginePage from 'src/reportsintegration/report_engine/containers/AddReportEnginePage';

import Loading from 'src/components/Loading';
import {
  antDModalNoPaddingStyles,
  antDModalStyles,
  // buttonLinkStyles,
  formHelperStyles,
  formStyles,
  // infoTooltip,
  // SelectDatabaseStyles,
  StyledFooterButton,
} from '../../../../views/CRUD/data/database/DatabaseModal/styles';

import { reportEngineTypeOption } from '../../types';

interface ReportEngineModalProps {
  addDangerToast: (msg: string) => void;
  addSuccessToast: (msg: string) => void;
  user: {
    userId: string | number;
  };
  onReportEngineAdd: (body?: any) => void; // TODO: should we add a separate function for edit?
  onHide: (modalOpen: boolean) => void;
  refreshData: () => void;
  show: boolean;
  reportEngineId: number | undefined; // If included, will go into edit mode
}

const ReportEngineModal = (props: ReportEngineModalProps) => {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [
    reportEngineType,
    setReportEngineType,
  ] = useState<reportEngineTypeOption>();
  // @ts-ignore
  const [reportEngineTypes, setReportEngineTypes] = useState<
    reportEngineTypeOption[]
  >([{ label: 'BIRT', value: 'BIRT' }]);
  const [reportEngineName, setReportEngineName] = useState<string>('');
  const [description, setDescription] = useState('');

  const changeReportEngineType = (valor: string) => {
    setReportEngineType({
      label: valor,
      value: valor,
    });
  };

  const onRENameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReportEngineName(e.target.value);
  };

  const onDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const onClose = () => {
    props.onHide(false);
  };

  const addReportEngine = () => {
    const newReport = {
      verbose_name: reportEngineName,
      reports_engine_type: reportEngineType?.label,
      description,
      owners: [props.user.userId],
    };

    props.onReportEngineAdd(newReport);
  };

  const onSave = async () => {
    setLoading(false);
    await addReportEngine();
    onClose();
    props.refreshData();
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
        Add Report Engine
      </StyledFooterButton>
    </>
  );

  return (
    <div>
      <Modal
        css={(theme: SupersetTheme) => [
          antDModalNoPaddingStyles,
          antDModalStyles(theme),
          formHelperStyles(theme),
          formStyles(theme),
        ]}
        name="reportengine"
        onHandledPrimaryAction={onSave}
        onHide={onClose}
        primaryButtonName={t('Create Report Engine')}
        width="500px"
        centered
        show={props.show}
        title={<h4>{t('Create Report Engine')}</h4>}
        footer={renderModalFooter()}
        responsive
      >
        <AddReportEnginePage
          reportEngineType={reportEngineType}
          reportEngineTypes={reportEngineTypes}
          reportEngineName={reportEngineName}
          changeReportEngineType={changeReportEngineType}
          onRENameChange={onRENameChange}
          description={description}
          changeDescription={onDescriptionChange}
        />
        {isLoading && <Loading />}
      </Modal>
    </div>
  );
};

export default withToasts(ReportEngineModal);
