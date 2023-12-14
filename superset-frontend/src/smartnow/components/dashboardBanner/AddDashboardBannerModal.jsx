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
import React from 'react';
import { t } from '@superset-ui/core';
import Button from 'src/components/Button';
import Modal from 'src/common/components/Modal';
import FormLabel from 'src/components/FormLabel';

import { FormControl } from 'react-bootstrap';

const AddDashboardBannerModal = props => {
  console.log('AddDashboardBannerModal');
  console.log(props.show);
  const handleDashboardBannerChange = event => {
    props.onDashboardBannerChange(event.target.value);
  };

  return (
    <Modal
      show={props.show}
      onHide={props.onHide}
      title={t('Dashboard Information Banner')}
      footer={
        <>
          <Button type="button" buttonSize="sm" onClick={props.onHide} cta>
            {t('Cancel')}
          </Button>
          <Button
            onClick={props.onSubmit}
            buttonSize="sm"
            buttonStyle="primary"
            className="m-r-5"
            disabled={false}
            cta
          >
            Save
          </Button>
        </>
      }
      responsive
    >
      <h2> Dashboard Banner Information </h2>
      <form onSubmit={props.onSubmit}>
        <div>
          <FormLabel htmlFor="embed-height">{t('Banner')}</FormLabel>
          <FormControl
            name="dashboard_banner"
            type="text"
            bsSize="sm"
            value={props.dashboardBanner}
            onChange={handleDashboardBannerChange}
          />
        </div>
      </form>
    </Modal>
  );
};

export default AddDashboardBannerModal;
