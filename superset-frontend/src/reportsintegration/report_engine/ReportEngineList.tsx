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
import { styled, SupersetClient, t } from '@superset-ui/core';
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
// import rison from 'rison';
import { FeatureFlag, isFeatureEnabled } from 'src/featureFlags';
import { createErrorHandler, createFetchRelated } from 'src/views/CRUD/utils';
import { useListViewResource } from 'src/views/CRUD/hooks';
import ConfirmStatusChange from 'src/components/ConfirmStatusChange';
// import handleResourceExport from 'src/utils/export';
// import Loading from 'src/components/Loading';
import SubMenu, { SubMenuProps } from 'src/components/Menu/SubMenu';
import ListView, {
  FilterOperator,
  Filters,
  ListViewProps,
} from 'src/components/ListView';
import { getFromLocalStorage } from 'src/utils/localStorageHelpers';
import withToasts from 'src/messageToasts/enhancers/withToasts';
import FacePile from 'src/components/FacePile';
import Icons from 'src/components/Icons';
// import FaveStar from 'src/components/FaveStar';
// import PropertiesModal from 'src/dashboard/components/PropertiesModal';
import { Tooltip } from 'src/components/Tooltip';
import ReportEngineModal from './components/ReportEngineModal';
import ReportEngine from '../types/ReportEngine';
import { handleDeleteReportEngine } from '../utils';
import { useReportEngineEditModal } from './hooks';
import PropertiesModal from './components/PropertiesModal';
// import ImportModelsModal from 'src/components/ImportModal/index';

// import Dashboard from 'src/dashboard/containers/Dashboard';

// import { DashboardStatus } from './types';

const PAGE_SIZE = 25;
// const PASSWORDS_NEEDED_MESSAGE = t(
//   'The passwords for the databases below are needed in order to ' +
//   'import them together with the dashboards. Please note that the ' +
//   '"Secure Extra" and "Certificate" sections of ' +
//   'the database configuration are not present in export files, and ' +
//   'should be added manually after the import if they are needed.',
// );
// const CONFIRM_OVERWRITE_MESSAGE = t(
//   'You are importing one or more dashboards that already exist. ' +
//   'Overwriting might cause you to lose some of your work. Are you ' +
//   'sure you want to overwrite?',
// );

interface ReportEngineListProps {
  addDangerToast: (msg: string) => void;
  addSuccessToast: (msg: string) => void;
  user: {
    userId: string | number;
  };
}

const Actions = styled.div`
  color: ${({ theme }) => theme.colors.grayscale.base};
`;

export function postReportEngines(body: any) {
  return SupersetClient.post({
    endpoint: encodeURI(`/api/v1/report_engines/`),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
    .then(response => response.json)
    .catch(error => alert(`An error has occurred, ${error}`));
}

function ReportEngineList(props: ReportEngineListProps) {
  const { addDangerToast, addSuccessToast } = props;

  const {
    state: {
      loading,
      resourceCount: reportEngineCount,
      resourceCollection: reportEngines,
      bulkSelectEnabled,
    },
    setResourceCollection: setReportEngines,
    hasPerm,
    fetchData,
    toggleBulkSelect,
    refreshData,
  } = useListViewResource<ReportEngine>(
    'report_engines',
    t('Report Engines'),
    addDangerToast,
  );

  const [reportEngineModalOpen, setreportEngineModalOpen] = useState<boolean>(
    false,
  );

  const {
    reportEngineCurrentlyEditing,
    handleReportEngineUpdated,
    openReportEngineEditModal,
    closeReportEngineEditModal,
  } = useReportEngineEditModal(setReportEngines, reportEngines);
  // const reportDefinitionIds = useMemo(
  //   () => reportDefinitions.map(report => report.id),
  //   [reportDefinitions],
  // );
  // // const [saveFavoriteStatus, favoriteStatus] = useFavoriteStatus(
  // //   'dashboard',
  // //   reportDefinitionIds,
  // //   addDangerToast,
  // // );

  // const [
  //   reportDefinitionToEdit,
  //   setReportDefinitionToEdit,
  // ] = useState<ReportDefinition | null>(null);

  // const [importingDashboard, showImportModal] = useState<boolean>(false);
  // const [passwordFields, setPasswordFields] = useState<string[]>([]);
  // const [preparingExport, setPreparingExport] = useState<boolean>(false);

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

  const handleReportEngineEditModal = ({
    modalOpen = false,
  }: { modalOpen?: boolean } = {}) => {
    // Set database and modal
    setreportEngineModalOpen(modalOpen);
  };

  const { userId } = props.user;
  const userKey = getFromLocalStorage(userId.toString(), null);

  const canCreate = hasPerm('can_write');
  const canEdit = hasPerm('can_write');
  const canDelete = hasPerm('can_write');
  const canExport = hasPerm('can_read');

  const initialSort = [{ id: 'changed_on_delta_humanized', desc: true }];

  // function openDashboardEditModal(dashboard: Dashboard) {
  //   setDashboardToEdit(dashboard);
  // }

  // function handleDashboardEdit(edits: Dashboard) {
  //   return SupersetClient.get({
  //     endpoint: `/api/v1/dashboard/${edits.id}`,
  //   }).then(
  //     ({ json = {} }) => {
  //       setReportDefinitions(
  //         dashboards.map(dashboard => {
  //           if (dashboard.id === json?.result?.id) {
  //             const {
  //               changed_by_name,
  //               changed_by_url,
  //               changed_by,
  //               dashboard_title = '',
  //               slug = '',
  //               json_metadata = '',
  //               changed_on_delta_humanized,
  //               url = '',
  //             } = json.result;
  //             return {
  //               ...dashboard,
  //               changed_by_name,
  //               changed_by_url,
  //               changed_by,
  //               dashboard_title,
  //               slug,
  //               json_metadata,
  //               changed_on_delta_humanized,
  //               url,
  //             };
  //           }
  //           return dashboard;
  //         }),
  //       );
  //     },
  //     createErrorHandler(errMsg =>
  //       addDangerToast(
  //         t('An error occurred while fetching dashboards: %s', errMsg),
  //       ),
  //     ),
  //   );
  // }

  // const handleBulkDashboardExport = (dashboardsToExport: Dashboard[]) => {
  //   const ids = dashboardsToExport.map(({ id }) => id);
  //   handleResourceExport('dashboard', ids, () => {
  //     setPreparingExport(false);
  //   });
  //   setPreparingExport(true);
  // };

  // function handleBulkDashboardDelete(dashboardsToDelete: Dashboard[]) {
  //   return SupersetClient.delete({
  //     endpoint: `/api/v1/dashboard/?q=${rison.encode(
  //       dashboardsToDelete.map(({ id }) => id),
  //     )}`,
  //   }).then(
  //     ({ json = {} }) => {
  //       refreshData();
  //       addSuccessToast(json.message);
  //     },
  //     createErrorHandler(errMsg =>
  //       addDangerToast(
  //         t('There was an issue deleting the selected dashboards: ', errMsg),
  //       ),
  //     ),
  //   );
  // }

  const columns = useMemo(
    () => [
      // ...(props.user.userId
      //   ? [
      //       {
      //         Cell: ({
      //           row: {
      //             original: { id },
      //           },
      //         }: any) => (
      //           <FaveStar
      //             itemId={id}
      //             saveFaveStar={saveFavoriteStatus}
      //             isStarred={favoriteStatus[id]}
      //           />
      //         ),
      //         Header: '',
      //         id: 'id',
      //         disableSortBy: true,
      //         size: 'xs',
      //       },
      //     ]
      //   : []),
      {
        Cell: ({
          row: {
            original: { url, verbose_name },
          },
        }: any) => <Link to={url}>{verbose_name}</Link>,
        Header: t('Title'),
        accessor: 'verbose_name',
      },
      {
        Cell: ({
          row: {
            original: { reports_engine_type },
          },
        }: any) => <span className="no-wrap">{reports_engine_type}</span>,
        Header: t('Engine Type'),
        accessor: 'reports_engine_type',
        size: 'xl',
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
      // {
      //   Cell: ({
      //     row: {
      //       original: { status },
      //     },
      //   }: any) =>
      //     status === DashboardStatus.PUBLISHED ? t('Published') : t('Draft'),
      //   Header: t('Status'),
      //   accessor: 'published',
      //   size: 'xl',
      // },
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
            handleDeleteReportEngine(
              original,
              addSuccessToast,
              addDangerToast,
              refreshData,
            );
          const handleEdit = () => openReportEngineEditModal(original);

          return (
            <Actions className="actions">
              {canDelete && (
                <ConfirmStatusChange
                  title={t('Please confirm')}
                  description={
                    <>
                      {t('Are you sure you want to delete')}{' '}
                      <b>{original.verbose_name}</b>?
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
        hidden: !canEdit && !canDelete,
        disableSortBy: true,
      },
    ],
    [
      canEdit,
      canDelete,
      // ...(props.user.userId ? [favoriteStatus] : []),
    ],
  );

  // const favoritesFilter: Filter = {
  //   Header: t('Favorite'),
  //   id: 'id',
  //   urlDisplay: 'favorite',
  //   input: 'select',
  //   operator: FilterOperator.dashboardIsFav,
  //   unfilteredLabel: t('Any'),
  //   selects: [
  //     { label: t('Yes'), value: true },
  //     { label: t('No'), value: false },
  //   ],
  // };

  const filters: Filters = [
    {
      Header: t('Owner'),
      id: 'owners',
      input: 'select',
      operator: FilterOperator.relationManyMany,
      unfilteredLabel: t('All'),
      fetchSelects: createFetchRelated(
        'report_engines',
        'owners',
        createErrorHandler(errMsg =>
          addDangerToast(
            t(
              'An error occurred while fetching report engines owner values: %s',
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
        'report_engines',
        'created_by',
        createErrorHandler(errMsg =>
          addDangerToast(
            t(
              'An error occurred while fetching report engines created by values: %s',
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
    // ...(props.user.userId ? [favoritesFilter] : []),
    {
      Header: t('Search'),
      id: 'verbose_name',
      input: 'search',
      operator: FilterOperator.engine_name,
    },
  ];

  // const sortTypes = [
  //   {
  //     desc: false,
  //     id: 'dashboard_title',
  //     label: t('Alphabetical'),
  //     value: 'alphabetical',
  //   },
  //   {
  //     desc: true,
  //     id: 'changed_on_delta_humanized',
  //     label: t('Recently modified'),
  //     value: 'recently_modified',
  //   },
  //   {
  //     desc: false,
  //     id: 'changed_on_delta_humanized',
  //     label: t('Least recently modified'),
  //     value: 'least_recently_modified',
  //   },
  // ];

  // function renderCard(dashboard: Dashboard) {
  //   return (
  //     <DashboardCard
  //       dashboard={dashboard}
  //       hasPerm={hasPerm}
  //       bulkSelectEnabled={bulkSelectEnabled}
  //       refreshData={refreshData}
  //       showThumbnails={
  //         userKey
  //           ? userKey.thumbnails
  //           : isFeatureEnabled(FeatureFlag.THUMBNAILS)
  //       }
  //       loading={loading}
  //       addDangerToast={addDangerToast}
  //       addSuccessToast={addSuccessToast}
  //       openDashboardEditModal={openDashboardEditModal}
  //       saveFavoriteStatus={saveFavoriteStatus}
  //       favoriteStatus={favoriteStatus[dashboard.id]}
  //       handleBulkDashboardExport={handleBulkDashboardExport}
  //     />
  //   );
  // }

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
          <i className="fa fa-plus" /> {t('Report Engine')}
        </>
      ),
      buttonStyle: 'primary',
      onClick: () => {
        handleReportEngineEditModal({ modalOpen: true });
      },
    });
  }
  // if (isFeatureEnabled(FeatureFlag.VERSIONED_EXPORT)) {
  //   subMenuButtons.push({
  //     name: (
  //       <Tooltip
  //         id="import-tooltip"
  //         title={t('Import dashboards')}
  //         placement="bottomRight"
  //       >
  //         <Icons.Import data-test="import-button" />
  //       </Tooltip>
  //     ),
  //     buttonStyle: 'link',
  //     onClick: openDashboardImportModal,
  //   });
  // }
  return (
    <>
      <SubMenu name={t('Report Engines')} buttons={subMenuButtons} />
      {reportEngineCurrentlyEditing && (
        <PropertiesModal
          onHide={closeReportEngineEditModal}
          onSave={handleReportEngineUpdated}
          show
          reportEngine={reportEngineCurrentlyEditing}
        />
      )}
      <ConfirmStatusChange
        title={t('Please confirm')}
        description={t(
          'Are you sure you want to delete the selected reports Engines?',
        )}
        onConfirm={() => {}} // {handleBulkDashboardDelete}
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
              onSelect: () => {}, // handleBulkDashboardExport,
            });
          }
          return (
            <>
              {/*
              { dashboardToEdit && (
                <PropertiesModal
                  dashboardId={dashboardToEdit.id}
                  show
                  onHide={() => setDashboardToEdit(null)}
                  onSubmit={handleDashboardEdit}
                />
              )} */}
              <ListView<ReportEngine>
                bulkActions={bulkActions}
                bulkSelectEnabled={bulkSelectEnabled}
                // cardSortSelectOptions={sortTypes}
                className="report-engine-list-view"
                columns={columns}
                count={reportEngineCount}
                data={reportEngines}
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
                // renderCard={renderCard}
                defaultViewMode="table"
              />
            </>
          );
        }}
      </ConfirmStatusChange>

      <ReportEngineModal
        user={props.user}
        reportEngineId={undefined}
        show={reportEngineModalOpen}
        onHide={handleReportEngineEditModal}
        onReportEngineAdd={postReportEngines}
        refreshData={refreshData}
      />

      {/* <ImportModelsModal
        resourceName="dashboard"
        resourceLabel={t("dashboard")}
        passwordsNeededMessage={PASSWORDS_NEEDED_MESSAGE}
        confirmOverwriteMessage={CONFIRM_OVERWRITE_MESSAGE}
        addDangerToast={addDangerToast}
        addSuccessToast={addSuccessToast}
        onModelImport={handleDashboardImport}
        show={importingDashboard}
        onHide={closeDashboardImportModal}
        passwordFields={passwordFields}
        setPasswordFields={setPasswordFields}
      />
      {preparingExport && <Loading />} */}
    </>
  );
}

export default withToasts(ReportEngineList);
