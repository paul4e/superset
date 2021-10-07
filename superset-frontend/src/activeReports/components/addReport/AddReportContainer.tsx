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
import Button from "../../../components/Button";
import {postActiveReportEndpoint} from "../../utils";

interface Dataset {
  label: string;
  value: string;
}

type AddReportContainerProps = {
  datasets: Dataset[];
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
    max-width: ${750}px;
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
    datasets,
    templates,
  }: AddReportContainerProps) {
  //@ts-ignore
  const [selectedDatasources, setSelectedDatasources] = useState<{ datasourceValue: string, datasourceID: string }[]>([])

  const handleOnChange = (value: string[]) => {
    const values: any[] = value.map(value => {
      return {
        datasourceValue: value,
        datasourceID: value.split('__')[0]
      }
    })
    setSelectedDatasources(values)
  }

  const isBtnDisabled = () => {
    if (!selectedDatasources) return undefined
    if (selectedDatasources.length === 0) return true;
    return false;
  }
  // Report: { Author?: undefined | string; Body?: Body; ConsumeContainerWhitespace?: undefined | false | true; DataSets?: DataSet[]; DataSources?: DataSource[]; Description?: undefined | string; DocumentMap?: DocumentMap; EmbeddedImages?: EmbeddedImage[]; FixedPage?: undefined | { DataSetName?: undefined | string; Filters?: Filter[]; Group?: Grouping; Pages?: FixedPageSection[]; SortExpressions?: SortExpression[] }; Language?: undefined | string; Name?: undefined | string; Page?: Page; PageFooter?: PageSection; PageHeader?: PageSection; ReportParameters?: ReportParameter[]; StartPageNumber?: undefined | number; ThemeUri?: undefined | string; Themes?: string[]; Width?: undefined | string }
  {
    //crear reporte

    //guardar reporte en el backend /api/v1/active_reports/ - POST

    //redirect al designer con el id.
    {
    }
  }

  const handleOnCreate = () => {

    console.log(datasets)
    const datasetss = selectedDatasources.map(x => {
      return x.datasourceID;
    })
    // const slices = datasets.map(slice => {
    //   if (slice.)
    // })
    const report = {
      report_name: "New Report",
      report_data: JSON.stringify({}),
      slices: [...datasetss]
    }

    postActiveReportEndpoint('/', report);

  }

  return (

    <>
      <StyledContainer>
        <h3 css={cssStatic}>{t('Create a new report')}</h3>
        <div className={'dataset'}>
          <Select
            mode={'multiple'}

            ariaLabel={t('Dataset')}
            name="select-datasource"
            header={<FormLabel required>{t('Select datasets')}</FormLabel>}
            onChange={handleOnChange}
            options={datasets}
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
          disabled={isBtnDisabled()}
          onClick={handleOnCreate}
        >
          {t('Create new report')}
        </Button>
      </StyledContainer>
    </>

  )
}

export default AddReportContainer;
