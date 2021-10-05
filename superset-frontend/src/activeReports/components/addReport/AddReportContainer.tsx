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
import React, {useState} from 'react';
import {css, styled, t} from "@superset-ui/core";
import {FormLabel} from "../../../components/Form";
import {Select} from "../../../components";
import {MAX_ADVISABLE_VIZ_GALLERY_WIDTH} from "../../../explore/components/controls/VizTypeControl/VizTypeGallery";
import Button from "../../../components/Button";

interface Datasource {
  label: string;
  value: string;
}

type AddReportContainerProps = {
  datasources: Datasource[];
  templates?: any[]; // Idea de agregar reportes como templates.
};


const ESTIMATED_NAV_HEIGHT = '56px';

const StyledContainer = styled.div`
  ${({theme}) => `
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
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
        min-width: 500px;
        width: 600px;
      }
    }
  `}
`;

const cssStatic = css`
  flex: 0 0 auto;
`;

function AddReportContainer(
  {
    datasources,
    templates,
  }: AddReportContainerProps) {

  const [selectedDatasources, setSelectedDatasources] = useState<{ datasourceValue: string, datasourceID: string }[]>([])

  const handleOnChange = (value: string[]) => {
    const data = value.map(x => {
        return {
          datasourceValue: x,
          datasourceID: x.split('__')[0]
        }
      }
    )
    setSelectedDatasources(data)
  }


  return (

    <>
      <StyledContainer>
        <h3 css={cssStatic}>{t('Create a new report')}</h3>
        <div className={'dataset'}>
          <Select
            mode={'multiple'}
            autoFocus
            ariaLabel={t('Dataset')}
            name="select-datasource"
            header={<FormLabel required>{t('Select datasets')}</FormLabel>}
            onChange={handleOnChange}
            options={datasources}
            placeholder={t('Select datasets')}
            showSearch
            value={selectedDatasources.map(datasource => {
              return datasource.datasourceValue
            })}
          />
        </div>
        <Button
          css={[
            cssStatic,
            css`
              align-self: flex-end;
            `,
          ]}
          buttonStyle="primary"
          disabled={true}
          onClick={() => console.log('go to report designer')}
        >
          {t('Create new report')}
        </Button>
      </StyledContainer>
    </>

  )
}

export default AddReportContainer;
