import React /* , {  useState,  useMemo } */, {
  useEffect,
  useState,
} from 'react';
import withToasts from 'src/components/MessageToasts/withToasts';
import { SupersetClient } from '@superset-ui/core';
import AddReportDefinition from '../components/AddReportDefinition';
// import { MAX_ADVISABLE_VIZ_GALLERY_WIDTH } from '../../../explore/components/controls/VizTypeControl/VizTypeGallery';

interface AddReportDefinitionPageProps {
  addDangerToast: (msg: string) => void;
  addSuccessToast: (msg: string) => void;
  user: {
    userId: string | number;
  };
}

// const StyledContainer = styled.div`
//   ${({ theme }) => `
//     flex: 1 1 auto;
//     display: flex;
//     flex-direction: column;
//     justify-content: flex-start;
//     width: 100%;
//     max-width: ${MAX_ADVISABLE_VIZ_GALLERY_WIDTH}px;
//     border-radius: ${theme.gridUnit}px;
//     background-color: ${theme.colors.grayscale.light5};
//     margin-left: auto;
//     margin-right: auto;
//     padding-left: ${theme.gridUnit * 4}px;
//     padding-right: ${theme.gridUnit * 4}px;
//     padding-bottom: ${theme.gridUnit * 4}px;
//
//     h3 {
//       padding-bottom: ${theme.gridUnit * 3}px;
//     }
//
//     .file-upload {
//       display: flex;
//       flex: 1 1 auto;
//       align-items: flex-start;
//       flex-direction: column;
//       width: 100%;
//       height: 100px;
//       margin: 20px;
//     }
//     .fupload-report-definition {
//       display: flex;
//       justify-content: space-between;
//       flex-direction: column;
//       align-items: start;
//     }
//     .page-title {
//       margin: 15px;
//       border-bottom: 1px solid ${theme.colors.grayscale.light2};
//     }
//     .page-title > h1 {
//       margin-left: 15px;
//       color: ${theme.colors.grayscale.dark2};
//     }
//     .input-name {
//       margin: 20px;
//     }
//     .select-engine {
//       margin: 20px;
//     }
//     .input-description {
//       margin: 20px
//     }
//
//     .json-editor {
//       display: flex;
//       flex-direction: column;
//       align-item: flex-start;
//       margin-left: 2rem;
//     }
//
//     .ant-form-item-label {
//       display: flex;
//       flex-direction: column;
//       align-item: flex-start;
//     }
//
//   `}
// `;

interface ReportEngine {
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
      <AddReportDefinition reportEngines={reportEngines} />
    </>
  );
}

export default withToasts(AddReportDefinitionPage);
