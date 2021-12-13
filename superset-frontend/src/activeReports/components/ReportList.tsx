/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { styled, SupersetClient, t } from '@superset-ui/core'; //@ts-ignore
import React, { useMemo, useState } from 'react';
import Owner from 'src/types/Owner';
import withToasts from '../../messageToasts/enhancers/withToasts';
import SubMenu, { SubMenuProps } from '../../components/Menu/SubMenu';
import ConfirmStatusChange from '../../components/ConfirmStatusChange';
import ListView, {
  Filter,
  FilterOperator,
  Filters,
  ListViewProps,
} from '../../components/ListView';
import { FeatureFlag, isFeatureEnabled } from '../../featureFlags';
import { useListViewResource } from '../hooks/hooks';
import { getFromLocalStorage } from '../../utils/localStorageHelpers';
import { Link } from 'react-router-dom';
import { DashboardStatus } from '../../views/CRUD/dashboard/types';
import FacePile from '../../components/FacePile';
import { createErrorHandler, createFetchRelated } from '../../views/CRUD/utils';
import { Tooltip } from '../../components/Tooltip';
import Icons from 'src/components/Icons';
import PropertiesReportModal from './Modal/PropertiesModal';
import { deleteActiveReport, getActiveReportEndpoint } from '../utils';
import { useFavoriteStatus } from '../../views/CRUD/hooks';
import FaveStar from '../../components/FaveStar';
const PAGE_SIZE = 25;

interface ReportListProps {
  addDangerToast: (msg: string) => void;
  addSuccessToast: (msg: string) => void;
  user: {
    userId: string | number;
  };
}

interface Report {
  changed_by_name: string;
  changed_by_url: string;
  changed_on_delta_humanized: string;
  changed_by: Owner;
  report_name: string;
  id: number;
  published: boolean;
  url: string;
  thumbnail_url: string;
  owners: Owner[];
  created_by: object;
}
//@ts-ignore
const Actions = styled.div`
  color: ${({ theme }) => theme.colors.grayscale.base};
`;
//@ts-ignore
function ReportList(props: ReportListProps) {
  //@ts-ignore
  const { addDangerToast, addSuccessToast } = props;
  const {
    state: {
      loading,
      resourceCount: dashboardCount,
      resourceCollection: reports,
      bulkSelectEnabled,
    }, //@ts-ignore
    setResourceCollection: setReports,
    hasPerm,
    fetchData,
    toggleBulkSelect, //@ts-ignore
    refreshData,
  } = useListViewResource<Report>(
    'active_reports',
    t('Active Reports'),
    addDangerToast,
  );

  const reportIds = useMemo(() => reports.map(r => r.id), [reports]);
  const [saveFavoriteStatus, favoriteStatus] = useFavoriteStatus(
    'active_reports',
    reportIds,
    addDangerToast,
  );

  // const [importingDashboard, showImportModal] = useState<boolean>(false);
  // const [passwordFields, setPasswordFields] = useState<string[]>([]);
  // const [preparingExport, setPreparingExport] = useState<boolean>(false);

  // Import modal.
  // const openDashboardImportModal = () => {
  //   showImportModal(true);
  // };
  //
  // const closeDashboardImportModal = () => {
  //   showImportModal(false);
  // };
  //
  // const handleDashboardImport = () => {
  //   showImportModal(false);
  //   refreshData();
  // };

  const { userId } = props.user;
  const userKey = getFromLocalStorage(userId.toString(), null);

  const canCreate = hasPerm('can_write');
  const canEdit = hasPerm('can_write');
  const canDelete = hasPerm('can_write');
  const canExport = hasPerm('can_read');

  const initialSort = [{ id: 'changed_on_delta_humanized', desc: true }];
  // @ts-ignore
  const [reportToEdit, setReportToEdit] = useState<Report | null>(null);

  const columns = useMemo(
    () => [
      ...(props.user.userId
        ? [
            {
              Cell: ({
                row: {
                  original: { id },
                },
              }: any) => (
                <FaveStar
                  itemId={id}
                  saveFaveStar={saveFavoriteStatus}
                  isStarred={favoriteStatus[id]}
                />
              ),
              Header: '',
              id: 'id',
              disableSortBy: true,
              size: 'xs',
            },
          ]
        : []),
      {
        Cell: ({
          row: {
            original: { url, report_name: reportName },
          },
        }: any) => <Link to={url}>{reportName}</Link>,
        Header: t('Title'),
        accessor: 'report_name',
      },

      {
        Cell: ({
          row: {
            original: {
              changed_by_name: changedByName,
              changed_by_url: changedByUrl,
            },
          },
        }: any) => <a href={changedByUrl}>{changedByName}</a>,
        Header: t('Modified by'),
        accessor: 'changed_by.first_name',
        size: 'xl',
      },
      {
        Cell: ({
          row: {
            original: { status },
          },
        }: any) =>
          status === DashboardStatus.PUBLISHED ? t('Published') : t('Draft'),
        Header: t('Status'),
        accessor: 'published',
        size: 'xl',
      },
      {
        Cell: ({
          row: {
            original: { changed_on_delta_humanized: changedOn },
          },
        }: any) => <span className="no-wrap">{changedOn}</span>,
        Header: t('Modified'),
        accessor: 'changed_on_delta_humanized',
        size: 'xl',
      },
      {
        Cell: ({
          row: {
            original: { created_by: createdBy },
          },
        }: any) =>
          createdBy ? `${createdBy.first_name} ${createdBy.last_name}` : '',
        Header: t('Created by'),
        accessor: 'created_by',
        disableSortBy: true,
        size: 'xl',
      },
      {
        Cell: ({
          row: {
            original: { owners = [] },
          },
        }: any) => <FacePile users={owners} />,
        Header: t('Owners'),
        accessor: 'owners',
        disableSortBy: true,
        size: 'xl',
      },
      {
        Cell: ({ row: { original } }: any) => {
          const handleDelete = () =>
            deleteActiveReport(
              original,
              addSuccessToast,
              addDangerToast,
              refreshData,
            );
          const handleEdit = () => openReportEditModal(original);

          return (
            <Actions className="actions">
              {canDelete && (
                <ConfirmStatusChange
                  title={t('Please confirm')}
                  description={
                    <>
                      {t('Are you sure you want to delete')}{' '}
                      <b>{original.report_name}</b>?
                    </>
                  }
                  onConfirm={handleDelete}
                >
                  {confirmDelete => (
                    <Tooltip
                      id="delete-action-tooltip"
                      title={t('Delete')}
                      placement="bottom"
                    >
                      <span
                        role="button"
                        tabIndex={0}
                        className="action-button"
                        onClick={confirmDelete}
                      >
                        <Icons.Trash data-test="dashboard-list-trash-icon" />
                      </span>
                    </Tooltip>
                  )}
                </ConfirmStatusChange>
              )}
              {/*{canExport && (*/}
              {/*  <Tooltip*/}
              {/*    id="export-action-tooltip"*/}
              {/*    title={t('Export')}*/}
              {/*    placement="bottom"*/}
              {/*  >*/}
              {/*    <span*/}
              {/*      role="button"*/}
              {/*      tabIndex={0}*/}
              {/*      className="action-button"*/}
              {/*      onClick={handleExport}*/}
              {/*    >*/}
              {/*      <Icons.Share/>*/}
              {/*    </span>*/}
              {/*  </Tooltip>*/}
              {/*)}*/}
              {canEdit && (
                <Tooltip
                  id="edit-action-tooltip"
                  title={t('Edit')}
                  placement="bottom"
                >
                  <span
                    role="button"
                    tabIndex={0}
                    className="action-button"
                    onClick={handleEdit}
                  >
                    <Icons.EditAlt data-test="edit-alt" />
                  </span>
                </Tooltip>
              )}
            </Actions>
          );
        },
        Header: t('Actions'),
        id: 'actions',
        hidden: !canEdit && !canDelete && !canExport,
        disableSortBy: true,
      },
    ],
    [
      canEdit,
      canDelete,
      canExport,
      ...(props.user.userId ? [favoriteStatus] : []),
    ],
  );
  function openReportEditModal(report: Report) {
    setReportToEdit(report);
  }

  const favoritesFilter: Filter = {
    Header: t('Favorite'),
    id: 'id',
    urlDisplay: 'favorite',
    input: 'select',
    operator: FilterOperator.activeReportIsFav,
    unfilteredLabel: t('Any'),
    selects: [
      { label: t('Yes'), value: true },
      { label: t('No'), value: false },
    ],
  };

  const filters: Filters = [
    {
      Header: t('Owner'),
      id: 'owners',
      input: 'select',
      operator: FilterOperator.relationManyMany,
      unfilteredLabel: t('All'),
      fetchSelects: createFetchRelated(
        'active_reports',
        'owners',
        createErrorHandler(errMsg =>
          addDangerToast(
            t(
              'An error occurred while fetching dashboard owner values: %s',
              errMsg,
            ),
          ),
        ),
        props.user.userId,
      ),
      paginate: true,
    },
    {
      Header: t('Created by'),
      id: 'created_by',
      input: 'select',
      operator: FilterOperator.relationOneMany,
      unfilteredLabel: t('All'),
      fetchSelects: createFetchRelated(
        'active_reports',
        'created_by',
        createErrorHandler(errMsg =>
          addDangerToast(
            t(
              'An error occurred while fetching dashboard created by values: %s',
              errMsg,
            ),
          ),
        ),
        props.user.userId,
      ),
      paginate: true,
    },
    // {
    //   Header: t('Status'),
    //   id: 'published',
    //   input: 'select',
    //   operator: FilterOperator.equals,
    //   unfilteredLabel: t('Any'),
    //   selects: [
    //     { label: t('Published'), value: true },
    //     { label: t('Draft'), value: false },
    //   ],
    // },
    ...(props.user.userId ? [favoritesFilter] : []),
    {
      Header: t('Search'),
      id: 'report_name',
      input: 'search',
      operator: FilterOperator.titleOrSlug,
    },
  ];

  const sortTypes = [
    {
      desc: false,
      id: 'report_name',
      label: t('Alphabetical'),
      value: 'alphabetical',
    },
    {
      desc: true,
      id: 'changed_on_delta_humanized',
      label: t('Recently modified'),
      value: 'recently_modified',
    },
    {
      desc: false,
      id: 'changed_on_delta_humanized',
      label: t('Least recently modified'),
      value: 'least_recently_modified',
    },
  ];

  function handleBulkReportDelete(reportsToDelete: Report[]) {
    reportsToDelete.map((value: any) => {
      const endpoint = '/' + value.id;
      SupersetClient.delete({
        endpoint: `/api/v1/active_reports/${endpoint}`,
      }).then(
        ({ json = {} }) => {
          refreshData();
          addSuccessToast(json.message);
        },
        createErrorHandler(errMsg =>
          addDangerToast(
            t('There was an issue deleting the selected charts: %s', errMsg),
          ),
        ),
      );
    });
  }

  function handleReportdEdit(report: Report) {
    getActiveReportEndpoint(`/`, addDangerToast).then(response => {
      let aux: {} = {};
      // @ts-ignore
      response.json.result.map(r => {
        if (r.id === report.id) {
          aux = r;
        }
      });
      setReports(
        reports.map(report => {
          // @ts-ignore
          if (report.id === aux.id) {
            const {
              // @ts-ignore
              changed_by_name,
              // @ts-ignore
              changed_by_url,
              // @ts-ignore
              changed_on_delta_humanized,
              // @ts-ignore
              changed_by,
              // @ts-ignore
              changed_on,
              // @ts-ignore
              report_name,
              // @ts-ignore
              id,
              // @ts-ignore
              url,
              // @ts-ignore
              thumbnail_url,
              // @ts-ignore
              owners,
              // @ts-ignore
              created_by,
            } = aux;
            return {
              ...report,
              changed_by_name,
              changed_by_url,
              changed_on_delta_humanized,
              changed_by,
              changed_on,
              report_name,
              id,
              url,
              thumbnail_url,
              owners,
              created_by,
            };
          }
          return report;
        }),
      );
    });
  }

  const subMenuButtons: SubMenuProps['buttons'] = [];
  if (canDelete || canExport) {
    subMenuButtons.push({
      name: t('Bulk select'),
      buttonStyle: 'secondary',
      'data-test': 'bulk-select',
      onClick: toggleBulkSelect,
    });
  }
  if (canCreate) {
    subMenuButtons.push({
      name: (
        <>
          <i className="fa fa-plus" /> {t('Report')}
        </>
      ),
      buttonStyle: 'primary',
      onClick: () => {
        window.location.assign('/active_reports/add'); //url create report
      },
    });
  }

  return (
    <>
      <SubMenu name={t('Active Reports')} buttons={subMenuButtons} />
      <ConfirmStatusChange
        title={t('Please confirm')}
        description={t('Are you sure you want to delete the selected reports?')}
        onConfirm={handleBulkReportDelete}
      >
        {confirmDelete => {
          const bulkActions: ListViewProps['bulkActions'] = [];
          if (canDelete) {
            bulkActions.push({
              key: 'delete',
              name: t('Delete'),
              type: 'danger',
              onSelect: confirmDelete,
            });
          }
          if (canExport) {
            bulkActions.push({
              key: 'export',
              name: t('Export'),
              type: 'primary',
              onSelect: () => console.log('handleBulkDashboardExport'), //handleBulkDashboardExport,
            });
          }

          // @ts-ignore
          return (
            <>
              {/*@ts-ignore*/}
              {reportToEdit && (
                <PropertiesReportModal
                  reportEdit={reportToEdit}
                  show
                  onHide={() => setReportToEdit(null)}
                  /*@ts-ignore*/
                  onSave={handleReportdEdit}
                />
              )}
              <ListView<Report>
                bulkActions={bulkActions}
                bulkSelectEnabled={bulkSelectEnabled}
                cardSortSelectOptions={sortTypes}
                className="reports-list-view"
                columns={columns}
                count={dashboardCount}
                data={reports}
                disableBulkSelect={toggleBulkSelect}
                fetchData={fetchData}
                filters={filters}
                initialSort={initialSort}
                loading={loading}
                pageSize={PAGE_SIZE}
                showThumbnails={
                  userKey
                    ? userKey.thumbnails
                    : isFeatureEnabled(FeatureFlag.THUMBNAILS)
                }
                renderCard={undefined} //renderCard
                defaultViewMode={
                  'table'
                  // isFeatureEnabled(FeatureFlag.LISTVIEWS_DEFAULT_CARD_VIEW)
                  //   ? 'card'
                  //   : 'table'
                }
              />
            </>
          );
        }}
      </ConfirmStatusChange>

      {/*  <ImportModelsModal*/}
      {/*    resourceName="dashboard"*/}
      {/*    resourceLabel={t('dashboard')}*/}
      {/*    passwordsNeededMessage={PASSWORDS_NEEDED_MESSAGE}*/}
      {/*    confirmOverwriteMessage={CONFIRM_OVERWRITE_MESSAGE}*/}
      {/*    addDangerToast={addDangerToast}*/}
      {/*    addSuccessToast={addSuccessToast}*/}
      {/*    onModelImport={handleDashboardImport}*/}
      {/*    show={importingDashboard}*/}
      {/*    onHide={closeDashboardImportModal}*/}
      {/*    passwordFields={passwordFields}*/}
      {/*    setPasswordFields={setPasswordFields}*/}
      {/*  />*/}
      {/*  {preparingExport && <Loading />}*/}
    </>
  );
}

export default withToasts(ReportList);
