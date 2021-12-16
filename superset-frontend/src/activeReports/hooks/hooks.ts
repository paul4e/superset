import { useCallback, useEffect, useState } from 'react';
import { FetchDataConfig, FilterValue } from '../../components/ListView';
import Report from '../types/Report';
import { SupersetClient, t } from '@superset-ui/core';
import rison from 'rison';
import { createErrorHandler } from '../../views/CRUD/utils';

interface ListViewResourceState<D extends object = any> {
  loading: boolean;
  collection: D[];
  count: number;
  permissions: string[];
  lastFetchDataConfig: FetchDataConfig | null;
  bulkSelectEnabled: boolean;
  lastFetched?: string;
}

export function useListViewResource<D extends object = any>(
  resource: string,
  resourceLabel: string, // resourceLabel for translations
  handleErrorMsg: (errorMsg: string) => void,
  infoEnable = true,
  defaultCollectionValue: D[] = [],
  baseFilters?: FilterValue[], // must be memoized
  initialLoadingState = true,
) {
  const [state, setState] = useState<ListViewResourceState<D>>({
    count: 0,
    collection: defaultCollectionValue,
    loading: initialLoadingState,
    lastFetchDataConfig: null,
    permissions: [],
    bulkSelectEnabled: false,
  });
  function updateState(update: Partial<ListViewResourceState<D>>) {
    setState(currentState => ({ ...currentState, ...update }));
  }

  function toggleBulkSelect() {
    updateState({ bulkSelectEnabled: !state.bulkSelectEnabled });
  }

  useEffect(() => {
    if (!infoEnable) return;
    SupersetClient.get({
      endpoint: `/api/v1/${resource}/_info?q=${rison.encode({
        keys: ['permissions'],
      })}`,
    }).then(
      ({ json: infoJson = {} }) => {
        updateState({
          permissions: infoJson.permissions,
        });
      },
      createErrorHandler(errMsg =>
        handleErrorMsg(
          t(
            'An error occurred while fetching %s info: %s',
            resourceLabel,
            errMsg,
          ),
        ),
      ),
    );
  }, []);

  function hasPerm(perm: string) {
    if (!state.permissions.length) {
      return false;
    }
    return Boolean(state.permissions.find(p => p === perm));
  }

  const fetchData = useCallback(
    ({
      pageIndex,
      pageSize,
      sortBy,
      filters: filterValues,
    }: FetchDataConfig) => {
      // set loading state, cache the last config for refreshing data.
      updateState({
        lastFetchDataConfig: {
          filters: filterValues,
          pageIndex,
          pageSize,
          sortBy,
        },
        loading: true,
      });

      const filterExps = (baseFilters || [])
        .concat(filterValues)
        .map(({ id, operator: opr, value }) => ({
          col: id,
          opr,
          value,
        }));

      const queryParams = rison.encode({
        order_column: sortBy[0].id,
        order_direction: sortBy[0].desc ? 'desc' : 'asc',
        page: pageIndex,
        page_size: pageSize,
        ...(filterExps.length ? { filters: filterExps } : {}),
      });

      return SupersetClient.get({
        endpoint: `/api/v1/${resource}/?q=${queryParams}`,
      })
        .then(
          ({ json = {} }) => {
            updateState({
              collection: json.result,
              count: json.count,
              lastFetched: new Date().toISOString(),
            });
          },
          createErrorHandler(errMsg =>
            handleErrorMsg(
              t(
                'An error occurred while fetching %ss: %s',
                resourceLabel,
                errMsg,
              ),
            ),
          ),
        )
        .finally(() => {
          updateState({ loading: false });
        });
    },
    [baseFilters],
  );

  return {
    state: {
      loading: state.loading,
      resourceCount: state.count,
      resourceCollection: state.collection,
      bulkSelectEnabled: state.bulkSelectEnabled,
      lastFetched: state.lastFetched,
    },
    setResourceCollection: (update: D[]) =>
      updateState({
        collection: update,
      }),
    hasPerm,
    fetchData,
    toggleBulkSelect,
    refreshData: (provideConfig?: FetchDataConfig) => {
      if (state.lastFetchDataConfig) {
        return fetchData(state.lastFetchDataConfig);
      }
      if (provideConfig) {
        return fetchData(provideConfig);
      }
      return null;
    },
  };
}

// @ts-ignore
export const useReportEditModal = (
  setReports: (report: Array<Report>) => void,
  reports: Array<Report>,
) => {
  const [
    reportCurrentlyEditing,
    setReportCurrentlyEditing,
  ] = useState<Report | null>(null);

  function openChartEditModal(report: Report) {
    setReportCurrentlyEditing({
      id: report.id,
      url: report.url,
      report_name: report.report_name,
      report_data: report.report_data,
      thumbnail_url: report.thumbnail_url,
      changed_on_delta_humanized: report.changed_on_delta_humanized,
      published: report.published,
      changed_by_name: report.changed_by_name,
      changed_by: report.changed_by,
      changed_on: report.changed_on,
      owners: report.owners,
      is_template: report.is_template,
    });
  }

  function closeReportEditModal() {
    setReportCurrentlyEditing(null);
  }

  function handleReportUpdated(edits: Report) {
    // update the chart in our state with the edited info
    const newReports = reports.map((report: Report) =>
      report.id === edits.id ? { ...report, ...edits } : report,
    );
    setReports(newReports);
  }

  return {
    reportCurrentlyEditing,
    handleReportUpdated,
    openChartEditModal,
    closeReportEditModal,
  };
};

// export function useFavoriteStatus(
//   type: 'chart' | 'dashboard',
//   ids: Array<string | number>,
//   handleErrorMsg: (message: string) => void,
// ) {
//   const [favoriteStatus, setFavoriteStatus] = useState<FavoriteStatus>({});
//
//   const updateFavoriteStatus = (update: FavoriteStatus) =>
//     setFavoriteStatus(currentState => ({ ...currentState, ...update }));
//
//   useEffect(() => {
//     if (!ids.length) {
//       return;
//     }
//     favoriteApis[type](ids).then(
//       ({ result }) => {
//         const update = result.reduce((acc, element) => {
//           acc[element.id] = element.value;
//           return acc;
//         }, {});
//         updateFavoriteStatus(update);
//       },
//       createErrorHandler(errMsg =>
//         handleErrorMsg(
//           t('There was an error fetching the favorite status: %s', errMsg),
//         ),
//       ),
//     );
//   }, [ids, type, handleErrorMsg]);
//
//   const saveFaveStar = useCallback(
//     (id: number, isStarred: boolean) => {
//       const urlSuffix = isStarred ? 'unselect' : 'select';
//       SupersetClient.get({
//         endpoint: `/superset/favstar/${
//           type === 'chart' ? FavStarClassName.CHART : FavStarClassName.DASHBOARD
//         }/${id}/${urlSuffix}/`,
//       }).then(
//         ({ json }) => {
//           updateFavoriteStatus({
//             [id]: (json as { count: number })?.count > 0,
//           });
//         },
//         createErrorHandler(errMsg =>
//           handleErrorMsg(
//             t('There was an error saving the favorite status: %s', errMsg),
//           ),
//         ),
//       );
//     },
//     [type],
//   );
//
//   return [saveFaveStar, favoriteStatus] as const;
// }
