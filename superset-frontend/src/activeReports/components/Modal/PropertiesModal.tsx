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
import React, { useState, useEffect } from 'react';
import Modal from 'src/components/Modal';
import { Row, Col, Input } from 'src/common/components';
import Button from 'src/components/Button';
import { AsyncSelect } from 'src/components/Select';
import { t } from '@superset-ui/core';
import { Form, FormItem } from 'src/components/Form';
import { getClientErrorObject } from 'src/utils/getClientErrorObject';
import Report from '../../types/Report';
import {
  getActiveReportEndpoint,
  getRelated,
  getSlices,
  putActiveReport,
} from '../../utils';
import {
  addDangerToast,
  addSuccessToast,
} from '../../../components/MessageToasts/actions';

type PropertiesModalProps = {
  reportEdit: Report;
  show: boolean;
  onHide: () => void;
  onSave: (report: Report) => void;
};

export default function PropertiesModal({
  reportEdit,
  onHide,
  show,
  onSave,
}: PropertiesModalProps) {
  const [submitting, setSubmitting] = useState(false);

  // values of form inputs
  const [name, setName] = useState(reportEdit.report_name || '');
  //const [description, setDescription] = useState(reportEdit.report_data || '');
  // const [cacheTimeout, setCacheTimeout] = useState(
  //   slice.cache_timeout != null ? reportEdit.cache_timeout : '',
  // );
  const [owners, setOwners] = useState<{ value: any; label: string }[]>();
  function showError({ error, statusText, message }: any) {
    let errorText = error || statusText || t('An error has occurred');
    if (message === 'Forbidden') {
      errorText = t('You do not have permission to edit this chart');
    }
    Modal.error({
      title: 'Error',
      content: errorText,
      okButtonProps: { danger: true, className: 'btn-danger' },
    });
  }

  useEffect(() => {
    setOwners(
      reportEdit.owners.map((owner: any) => ({
        value: owner.id,
        label: `${owner.first_name} ${owner.last_name}`,
      })),
    );
  }, [reportEdit.owners]);
  // update name after it's changed in another modal
  useEffect(() => {
    setName(reportEdit.report_name || '');
  }, [reportEdit.report_name]);

  const loadOptions = () => {
    return getRelated('owners').then(
      response => {
        // @ts-ignore
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
    let aux_slices: string[] = [];
    const report = {
      report_name: '',
      report_data: '',
      slices: aux_slices,
      owners: [],
    };

    if (owners) {
      // @ts-ignore
      report.owners = owners.map(o => o.value);
    }

    getActiveReportEndpoint(`/${reportEdit.id}`, addSuccessToast).then(
      response => {
        report.report_name = name;
        // @ts-ignore
        if ('json' in response) {
          // @ts-ignore
          report.slices = getSlices(
            JSON.parse(response.json.result.report_data).DataSets,
          );
          report.report_data = response.json.result.report_data;
        }
        putActiveReport(
          `/${reportEdit.id}`,
          report,
          addSuccessToast,
          addDangerToast,
        );
        onSave(reportEdit);
        onHide();
      },
    );
    setSubmitting(false);
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      title="Edit Report Properties"
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
            {/*<FormItem label={t('Description')}>*/}
            {/*  <TextArea*/}
            {/*    rows={3}*/}
            {/*    name="description"*/}
            {/*    value={description}*/}
            {/*    onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>*/}
            {/*      setDescription(event.target.value ?? '')*/}
            {/*    }*/}
            {/*    style={{ maxWidth: '100%' }}*/}
            {/*  />*/}
            {/*  <p className="help-block">*/}
            {/*    {t(*/}
            {/*      'The description can be displayed as widget headers in the dashboard view. Supports markdown.',*/}
            {/*    )}*/}
            {/*  </p>*/}
            {/*</FormItem>*/}
          </Col>
          <Col xs={24} md={12}>
            <h3>{t('Configuration')}</h3>
            {/*<FormItem label={t('Cache timeout')}>*/}
            {/*  <Input*/}
            {/*    name="cacheTimeout"*/}
            {/*    type="text"*/}
            {/*    value={cacheTimeout}*/}
            {/*    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {*/}
            {/*      const targetValue = event.target.value ?? '';*/}
            {/*      setCacheTimeout(targetValue.replace(/[^0-9]/, ''));*/}
            {/*    }}*/}
            {/*  />*/}
            {/*  <p className="help-block">*/}
            {/*    {t(*/}
            {/*      "Duration (in seconds) of the caching timeout for this chart. Note this defaults to the dataset's timeout if undefined.",*/}
            {/*    )}*/}
            {/*  </p>*/}
            {/*</FormItem>*/}
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
