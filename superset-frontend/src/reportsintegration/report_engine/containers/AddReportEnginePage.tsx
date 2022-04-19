import React /* , {  useState,  useMemo, useEffect } */ from 'react';
import withToasts from 'src/components/MessageToasts/withToasts';
import { styled } from '@superset-ui/core';
// import { styled, SupersetClient } from '@superset-ui/core';
import AddReportEngine from '../components/AddReportEngine';
import { MAX_ADVISABLE_VIZ_GALLERY_WIDTH } from '../../../explore/components/controls/VizTypeControl/VizTypeGallery';
import { reportEngineTypeOption } from '../types';

interface AddReportEnginePageProps {
  addDangerToast: (msg: string) => void;
  addSuccessToast: (msg: string) => void;
  ReportEngine: (engine: ReportEngine) => void;
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

const ESTIMATED_NAV_HEIGHT = '56px';

const StyledContainer = styled.div`
  ${({ theme }) => `
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    width: 100%;
    max-width: ${MAX_ADVISABLE_VIZ_GALLERY_WIDTH}px;
    max-height: calc(100vh - ${ESTIMATED_NAV_HEIGHT});
    border-radius: ${theme.gridUnit}px;
    background-color: ${theme.colors.grayscale.light5};
    margin-left: auto;
    margin-right: auto;
    padding-left: ${theme.gridUnit * 4}px;
    padding-right: ${theme.gridUnit * 4}px;
    padding-bottom: ${theme.gridUnit * 4}px;
    
    & .add-report-engine {
      margin: 10px
      padding-top: 15px
    }
    
    h3 {
      padding-bottom: ${theme.gridUnit * 3}px;
    }

    & .dataset {
      display: flex;
      flex-direction: row;
      align-items: center;

      & > div {
        min-width: 200px;
        width: 300px;
      }

      & > span {
        color: ${theme.colors.grayscale.light1};
        margin-left: ${theme.gridUnit * 4}px;
        margin-top: ${theme.gridUnit * 6}px;
      }
    }
  `}
`;

interface ReportEngine {
  id: number;
  verbose_name: string;
  engine_type: string;
  description: string;
}

function AddReportEnginePage(props: AddReportEnginePageProps) {
  return (
    <>
      <StyledContainer>
        <h1 key="page-title">New Report Engine Folder</h1>

        <AddReportEngine
          reportEngineType={props.reportEngineType}
          reportEngineTypes={props.reportEngineTypes}
          reportEngineName={props.reportEngineName}
          changeReportEngineType={props.changeReportEngineType}
          onRENameChange={props.onRENameChange}
          description={props.description}
          changeDescription={props.changeDescription}
        />
      </StyledContainer>
    </>
  );
}

export default withToasts(AddReportEnginePage);
