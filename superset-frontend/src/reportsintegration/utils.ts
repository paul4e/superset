import { SupersetClient, t } from '@superset-ui/core';
import ReportDefinition from './types/ReportDefinition';
import ReportEngine from './types/ReportEngine';
import { FetchDataConfig } from '../components/ListView';

export function handleDeleteReportDefinition(
  { id, report_name }: ReportDefinition,
  addSuccessToast: (arg0: string) => void,
  addDangerToast: (arg0: string) => void,
  refreshData: (arg0?: FetchDataConfig | null) => void,
) {
  return SupersetClient.delete({
    endpoint: `/api/v1/report_definitions/${id}`,
    headers: { 'Content-Type': 'application/json' },
  }).then(
    () => {
      refreshData();
      addSuccessToast(t('Deleted: %s', report_name));
    },
    () => {
      addDangerToast(t('There was an issue deleting: %s', report_name));
    },
  );
}

export function handleDeleteReportEngine(
  { id, verbose_name }: ReportEngine,
  addSuccessToast: (arg0: string) => void,
  addDangerToast: (arg0: string) => void,
  refreshData: (arg0?: FetchDataConfig | null) => void,
) {
  return SupersetClient.delete({
    endpoint: `/api/v1/report_engines/${id}`,
    headers: { 'Content-Type': 'application/json' },
  }).then(
    () => {
      refreshData();
      addSuccessToast(t('Deleted: %s', verbose_name));
    },
    () => {
      addDangerToast(t('There was an issue deleting: %s', verbose_name));
    },
  );
}
