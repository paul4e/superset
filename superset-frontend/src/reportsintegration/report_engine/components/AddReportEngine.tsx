import React, {
  useState,
  useEffect /* , {  useState,  useMemo } */,
} from 'react';
import withToasts from 'src/messageToasts/enhancers/withToasts';
// import { Select } from 'src/components';
// import { css, JsonObject, SupersetClient, t } from '@superset-ui/core';
// import { FormLabel } from 'src/components/Form';
// import { Input } from 'src/common/components/index';
// import Button from 'src/components/Button';
import { ReportEngine } from 'src/reportsintegration/report_engine/containers/AddReportEnginePage';

interface AddReportDefinitionProps {
  addDangerToast: (msg: string) => void;
  addSuccessToast: (msg: string) => void;
  user: {
    userId: string | number;
  };
  reportEngines: ReportEngine[];
}

function AddReportEngine(props: AddReportDefinitionProps) {

  return (
    <>
      <p key="page-title">AddReportEngineComponent</p>
    </>
  );
}

export default withToasts(AddReportEngine);
