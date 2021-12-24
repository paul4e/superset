import {
  t,
  SupersetTheme,
  FeatureFlag,
  isFeatureEnabled,
} from '@superset-ui/core';
import React, {
  FunctionComponent,
  useEffect,
  useState,
  useReducer,
  Reducer,
} from 'react';
import Tabs from 'src/components/Tabs';
import { Select } from 'src/common/components';
import Alert from 'src/components/Alert';
import Modal from 'src/components/Modal';
import Button from 'src/components/Button';
import IconButton from 'src/components/IconButton';
import InfoTooltip from 'src/components/InfoTooltip';
import withToasts from 'src/messageToasts/enhancers/withToasts';

import Loading from 'src/components/Loading';
import {
  antDModalNoPaddingStyles,
  antDModalStyles,
  buttonLinkStyles,
  formHelperStyles,
  formStyles,
  infoTooltip,
  SelectDatabaseStyles,
  StyledFooterButton,
} from '../../../../views/CRUD/data/database/DatabaseModal/styles';
import { noOp } from '../../../../utils/common';

interface ReportEngineModalProps {
  addDangerToast: (msg: string) => void;
  addSuccessToast: (msg: string) => void;
  onDatabaseAdd?: (database?: any) => void; // TODO: should we add a separate function for edit?
  onHide: () => void;
  show: boolean;
  reportEngineId: number | undefined; // If included, will go into edit mode
}

const ReportEngineModal = (props: ReportEngineModalProps) => {
  const [isLoading, setLoading] = useState<boolean>(false);

  const onClose = () => {
    props.onHide();
  };

  const onSave = async () => {
    noOp();
    setLoading(false);
  };

  const renderModalFooter = () => (
    <>
      <StyledFooterButton key="back" onClick={() => {}}>
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
        name="database"
        onHandledPrimaryAction={onSave}
        onHide={onClose}
        primaryButtonName={t('Create Report Engine')}
        width="500px"
        centered
        show={props.show}
        title={<h4>{t('Create Report Engine')}</h4>}
        footer={renderModalFooter()}
      >
        {isLoading && <Loading />}
      </Modal>
    </div>
  );
};

export default withToasts(ReportEngineModal);
