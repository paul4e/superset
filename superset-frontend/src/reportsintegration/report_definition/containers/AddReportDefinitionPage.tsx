import React /* , {  useState,  useMemo } */, {
  useEffect,
  useState,
} from 'react';
import withToasts from 'src/messageToasts/enhancers/withToasts';
import { styled, SupersetClient } from '@superset-ui/core';
import AddReportDefinition from '../components/AddReportDefinition';
import { MAX_ADVISABLE_VIZ_GALLERY_WIDTH } from '../../../explore/components/controls/VizTypeControl/VizTypeGallery';

interface AddReportDefinitionPageProps {
  addDangerToast: (msg: string) => void;
  addSuccessToast: (msg: string) => void;
  user: {
    userId: string | number;
  };
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

export interface ReportEngine {
  id: number;
  verbose_name: string;
  engine_type: string;
}

function AddReportDefinitionPage(props: AddReportDefinitionPageProps) {
  const [reportEngines, setReportEngines] = useState<ReportEngine[]>();

  useEffect(() => {
    getReportEngines().then(reportEngines => {
      setReportEngines(
        reportEngines.map((re: any) => {
          const { id, verbose_name, reports_engine_type } = re;
          return {
            id,
            verbose_name,
            engine_type: reports_engine_type,
          };
        }),
      );
    });
  }, []);

  const getReportEngines = () => {
    const url = '/api/v1/report_engines/';
    return SupersetClient.get({
      endpoint: url,
    })
      .then(res => res.json.result)
      .catch();
  };

  return (
    <>
      <StyledContainer>
        <h1 key="page-title">AddReportDefinitionPage</h1>

        <AddReportDefinition reportEngines={reportEngines} />
      </StyledContainer>
    </>
  );
}

export default withToasts(AddReportDefinitionPage);
