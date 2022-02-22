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

import React, { useState, useEffect, useCallback } from 'react';
import Modal from 'src/components/Modal';
import { Row, Col, Input, TextArea } from 'src/common/components';
import Button from 'src/components/Button';
import { OptionsType } from 'react-select/src/types';
import { AsyncSelect } from 'src/components/Select';
import rison from 'rison';
import { t, SupersetClient } from '@superset-ui/core';
import { Form, FormItem } from 'src/components/Form';
import { getClientErrorObject } from 'src/utils/getClientErrorObject';
import ReportDefinition, {
  ReportDefinitionData,
} from 'src/reportsintegration/types/ReportDefinition';

type PropertiesModalProps = {
  reportDefition: ReportDefinitionData;
  show: boolean;
  onHide: () => void;
  onSave: (reportDefinition: ReportDefinition) => void;
};

type OwnerOption = {
  label: string;
  value: number;
};

export default function PropertiesModal({
  reportDefition,
  onHide,
  onSave,
  show,
}: PropertiesModalProps) {
  const [submitting, setSubmitting] = useState(false);

  // values of form inputs
  const [name, setName] = useState(reportDefition.report_name || '');
  const [description, setDescription] = useState(
    reportDefition.description || '',
  );
  const [owners, setOwners] = useState<OptionsType<OwnerOption> | null>(null);

  function showError({ error, statusText, message }: any) {
    let errorText = error || statusText || t('An error has occurred');
    if (message === 'Forbidden') {
      errorText = t(
        'You do not have permission to edit this report definition',
      );
    }
    Modal.error({
      title: 'Error',
      content: errorText,
      okButtonProps: { danger: true, className: 'btn-danger' },
    });
  }

  const fetchReportDefinitionData = useCallback(
    async function fetchReportDefinitionData() {
      try {
        const response = await SupersetClient.get({
          endpoint: `/api/v1/report_definitions/${reportDefition.report_definition_id}`,
        });
        const report_definition = response.json.result;
        setOwners(
          report_definition.owners.map((owner: any) => ({
            value: owner.id,
            label: `${owner.first_name} ${owner.last_name}`,
          })),
        );
      } catch (response) {
        const clientError = await getClientErrorObject(response);
        showError(clientError);
      }
    },
    [reportDefition.report_definition_id],
  );

  // get the owners of this reportDefition
  useEffect(() => {
    fetchReportDefinitionData();
  }, [fetchReportDefinitionData]);

  // update name after it's changed in another modal
  useEffect(() => {
    setName(reportDefition.report_name || '');
  }, [reportDefition.report_name]);

  const loadOptions = (input = '') => {
    const query = rison.encode({
      filter: input,
    });
    return SupersetClient.get({
      endpoint: `/api/v1/report_definitions/related/owners?q=${query}`,
    }).then(
      response => {
        const { result } = response.json;
        return result.map((item: any) => ({
          value: item.value,
          label: item.text,
        }));
      },
      badResponse => {
        getClientErrorObject(badResponse).then(showError);
        return [];
      },
    );
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setSubmitting(true);
    const payload: { [key: string]: any } = {
      report_name: name || null,
      description: description || null,
    };
    if (owners) {
      payload.owners = owners.map(o => o.value);
    }
    try {
      const res = await SupersetClient.put({
        endpoint: `/api/v1/report_definitions/${reportDefition.report_definition_id}`,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      // update the redux state
      const updatedReportDefinition = {
        ...res.json.result,
        id: reportDefition.report_definition_id,
      };
      onSave(updatedReportDefinition);
      onHide();
    } catch (res) {
      const clientError = await getClientErrorObject(res);
      showError(clientError);
    }
    setSubmitting(false);
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      title="Edit Report Definition Properties"
      footer={
        <>
          <Button
            data-test="properties-modal-cancel-button"
            htmlType="button"
            buttonSize="small"
            onClick={onHide}
            cta
          >
            {t('Cancel')}
          </Button>
          <Button
            data-test="properties-modal-save-button"
            htmlType="button"
            buttonSize="small"
            buttonStyle="primary"
            // @ts-ignore
            onClick={onSubmit}
            disabled={!owners || submitting || !name}
            cta
          >
            {t('Save')}
          </Button>
        </>
      }
      responsive
      wrapProps={{ 'data-test': 'properties-edit-modal' }}
    >
      <Form onFinish={onSubmit} layout="vertical">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <h3>{t('Basic information')}</h3>
            <FormItem label={t('Name')} required>
              <Input
                name="name"
                data-test="properties-modal-name-input"
                type="text"
                value={name}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setName(event.target.value ?? '')
                }
              />
            </FormItem>
            <FormItem label={t('Description')}>
              <TextArea
                rows={3}
                name="description"
                value={description}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setDescription(event.target.value ?? '')
                }
                style={{ maxWidth: '100%' }}
              />
              <p className="help-block">
                {t(
                  'The description can be displayed as widget headers in the dashboard view. Supports markdown.',
                )}
              </p>
            </FormItem>
          </Col>
          <Col xs={24} md={12}>
            <h3>{t('Configuration')}</h3>
            {/* <FormItem label={t('Cache timeout')}> */}
            {/*  <Input */}
            {/*    name="cacheTimeout" */}
            {/*    type="text" */}
            {/*    value={cacheTimeout} */}
            {/*    onChange={(event: React.ChangeEvent<HTMLInputElement>) => { */}
            {/*      const targetValue = event.target.value ?? ''; */}
            {/*      setCacheTimeout(targetValue.replace(/[^0-9]/, '')); */}
            {/*    }} */}
            {/*  /> */}
            {/*  <p className="help-block"> */}
            {/*    {t( */}
            {/*      "Duration (in seconds) of the caching timeout for this chart. Note this defaults to the dataset's timeout if undefined.", */}
            {/*    )} */}
            {/*  </p> */}
            {/* </FormItem> */}
            <h3 style={{ marginTop: '1em' }}>{t('Access')}</h3>
            <FormItem label={t('Owners')}>
              <AsyncSelect
                isMulti
                name="owners"
                value={owners || []}
                loadOptions={loadOptions}
                defaultOptions // load options on render
                cacheOptions
                onChange={setOwners}
                disabled={!owners}
                filterOption={null} // options are filtered at the api
              />
              <p className="help-block">
                {t(
                  'A list of users who can alter the chart. Searchable by name or username.',
                )}
              </p>
            </FormItem>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
