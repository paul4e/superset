import React from 'react';
//   ,
// {
//   useState /* , { useEffect, useState,  useMemo } */,
// }

import withToasts from 'src/components/MessageToasts/withToasts';
import { Select } from 'src/components';
// import { css, JsonObject, SupersetClient, t } from '@superset-ui/core';
// import { FormLabel } from 'src/components/Form';
// import { Input } from 'src/common/components/index';
// import Button from 'src/components/Button';
// import { ReportEngine } from 'src/reportsintegration/report_engine/containers/AddReportEnginePage';
import { t } from '@superset-ui/core';
import { FormLabel } from '../../../components/Form';
import { Input, TextArea } from '../../../common/components';
import { reportEngineTypeOption } from '../types';

interface AddReportDefinitionProps {
  addDangerToast: (msg: string) => void;
  addSuccessToast: (msg: string) => void;
  user: {
    userId: string | number;
  };
  reportEngineType: reportEngineTypeOption;
  reportEngineTypes: reportEngineTypeOption[];
  reportEngineName: string;
  changeReportEngineType: (valor: string) => void;
  onRENameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  description: string;
  changeDescription: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

function AddReportEngine(props: AddReportDefinitionProps) {
  // const [
  //   reportEngineType,
  //   setReportEngineType,
  // ] = useState<reportEngineTypeOption>();
  // // @ts-ignore
  // const [reportEngineTypes, setReportEngineTypes] = useState<
  //   reportEngineTypeOption[]
  // >([{ label: 'BIRT', value: 'BIRT' }]);
  // const [reportEngineName, setReportEngineName] = useState<string>('');
  //
  // const changeReportEngineType = (valor: string) => {
  //   setReportEngineType({
  //     label: valor,
  //     value: valor,
  //   });
  // };
  //
  // const onRENameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setReportEngineName(e.target.value);
  // };

  return (
    <>
      <div className="add-report-engine">
        <FormLabel required>{t('Enter the Report Definition name')}</FormLabel>
        <Input
          type="text"
          name="input-report-engine-name"
          onChange={props.onRENameChange}
          placeholder="Report Definition Name"
          value={props.reportEngineName}
        />
        <Select
          autoFocus
          ariaLabel={t('Report Engine')}
          name="select-report-engine-type"
          header={<FormLabel required>{t('Choose a Report Engine')}</FormLabel>}
          onChange={props.changeReportEngineType}
          options={props.reportEngineTypes}
          placeholder={t('Choose a Report Engine')}
          showSearch
          value={props.reportEngineType?.value}
        />
      </div>
      <div className="input-description">
        <FormLabel>{t('Enter a description')}</FormLabel>
        <TextArea
          rows={3}
          name="description"
          value={props.description}
          onChange={props.changeDescription}
        />
      </div>
    </>
  );
}

export default withToasts(AddReportEngine);
