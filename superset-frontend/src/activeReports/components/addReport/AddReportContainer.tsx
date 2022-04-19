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
import React, {useEffect, useState} from 'react';
import {css, styled, SupersetClient, t} from "@superset-ui/core";
import {Form, FormItem, FormLabel} from "../../../components/Form";
import {Select} from "../../../components";
import Button from "../../../components/Button";
import {
  templates,
} from "@grapecity/activereports/reportdesigner";
import {Input} from "../../../common/components";
import {getSlices} from "../../utils";
import {postActiveReportEndpoint} from "../../utils";
import {addDangerToast, addSuccessToast} from "../../../components/MessageToasts/actions";

interface Dataset {
  label: string;
  value: string;
}

interface Template {
  id: number;
  name: string;
  report: string;
}

type AddReportContainerProps = {
  datasets: Dataset[];
  templates_list: Template[]; // Idea de agregar reportes como templates.
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
    templates_list
  }: AddReportContainerProps) {
  const [selectedDatasources, setSelectedDatasources] = useState<{ datasourceValue: string, datasourceID: string }[]>([])
  const [selectedTemplates, setSelectedTemplates] = useState<{ value: string, id: number, report: string }>( );
  const [datasetsInfo, setDatasetsInfo] = React.useState(new Map());
  // @ts-ignore
  const [reportList, setReportList] = React.useState(new Map());
  const [reportName, setReportName] = React.useState("");

  useEffect(() => {
    const fetchDatasetsInfo = async () => {
      const selectedDatasets = datasets.map(x => {
        return {
          id: x.value.split('__')[0],
          dataset_name: x.label,
        }
      })

      selectedDatasets.map(dataset => {
        const dataset_i = async() => {
          const res =  await SupersetClient.get({
            endpoint: `/api/v1/chart/${dataset.id}/data?type=full&format=json`
          })

          setDatasetsInfo( (prevstate) => {
            const info = {...dataset, colnames: [...res.json.result[0].colnames]}
            return new Map(prevstate.set(dataset.id, info))
          })
        }
        dataset_i()
      })
    }
    fetchDatasetsInfo()

  }, [datasets])

  const handleOnChangeDatasources = (value: string[]) => {
    const values: any[] = value.map(value => {
      return {
        datasourceValue: value,
        datasourceID: value.split('__')[0]
      }
    })
    setSelectedDatasources(values)
  };

  const handleOnChangeTemplate = (id: any ) => {
    let res = templates_list.filter(value => value.id === id)[0];
    let report = {
      value: res.name,
      id: res.id,
      report: res.report
    }
    setSelectedTemplates(report);
  };

  const isBtnDisabled = () => {
    if (!selectedDatasources) return undefined;
    if (selectedDatasources.length === 0) return true;
    if(datasetsInfo.size !== datasets.length) return true;
    return false;
  };
  // Report: { Author?: undefined | string; Body?: Body; ConsumeContainerWhitespace?: undefined | false | true; DataSets?: DataSet[]; DataSources?: DataSource[]; Description?: undefined | string; DocumentMap?: DocumentMap; EmbeddedImages?: EmbeddedImage[]; FixedPage?: undefined | { DataSetName?: undefined | string; Filters?: Filter[]; Group?: Grouping; Pages?: FixedPageSection[]; SortExpressions?: SortExpression[] }; Language?: undefined | string; Name?: undefined | string; Page?: Page; PageFooter?: PageSection; PageHeader?: PageSection; ReportParameters?: ReportParameter[]; StartPageNumber?: undefined | number; ThemeUri?: undefined | string; Themes?: string[]; Width?: undefined | string }
  {
    //crear reporte

    //guardar reporte en el backend /api/v1/active_reports/ - POST

    //redirect al designer con el id.
    {
    }
  }

  const handleOnCreate = () => {
    if (reportName!== ''){
      //add len of list how id report if it's default
      setReportName('New Report')
    }

    const datasource = {
      "Name": "SupersetDatasource",
      "ConnectionProperties": {
        "DataProvider": "JSON",
        "ConnectString": "endpoint=http://localhost:9000/api/v1/chart"
      }
    }

    const selectedDatasets = selectedDatasources.map(x => {
      return x.datasourceID;
    })

    const charts: any = [];
    datasetsInfo.forEach((value,key) => {
      if(!selectedDatasets.includes(key)) return;

      charts.push({
        "Name": value.dataset_name, //sacar nombre de dataset de los datasets state, con el id
        "Fields": value.colnames.map((col: string) => {
          return {Name: col, DataField: col}
        }),
        "Query": {
          "DataSourceName": "SupersetDatasource",
          "CommandText": `uri=/${key}/data?type=full&format=json;jpath=$.result[0].data[*]`
        },
        "CaseSensitivity": "Auto",
        "KanatypeSensitivity": "Auto",
        "AccentSensitivity": "Auto",
        "WidthSensitivity": "Auto"
      })
    });

    const report = {
      report_data: "",
      report_name: "",
      slices: [],
    };

    const template = {
      definition: {},
      id: "",
    }
    let slices: any[] = [];
    if(selectedTemplates) {
      let template_selected = JSON.parse(selectedTemplates.report);
      let auxDatasetTemplates: any = template_selected.DataSets;
      // let auxDatasourcesTemplates: any = template_selected.DataSources
      charts.map((valueCharts: any) => {
        auxDatasetTemplates.splice(auxDatasetTemplates.findIndex((valueTemplates: any) =>
          valueCharts.Query.CommandText === valueTemplates.Query.CommandText),1);
      });

      // selectedDatasources.map((valueDatasources: any) => {
      //   auxDatasourcesTemplates.splice(auxDatasourcesTemplates.findIndex((valueTemplates: any) =>
      //       valueDatasources.ConnectionProperties.ConnectString === valueTemplates.ConnectionProperties.ConnectString),1);
      //   }
      // )
      if(auxDatasetTemplates.length !== 0){
        auxDatasetTemplates.map((templ:any) => {
          charts.push(templ);
        });
        slices = getSlices(charts);
      }
      // if(auxDatasourcesTemplates.length !== 0){
      //   auxDatasourcesTemplates.map((templ:any) => {
      //     selectedDatasources.push(templ);
      //   })
      // }
      // console.log("dataSources");
      // console.log(selectedDatasources);
      // console.log("dataSources template");
      // console.log(template_selected.DataSources)

      template.definition = template_selected;
      template.id = reportName;
    }
    else{
      template.definition = templates.CPL
      template.id = reportName
    }

    report.report_data = JSON.stringify({
      ...template.definition,
      DataSets: charts,
      DataSources:[datasource]
    });
    report.report_name = template.id;
    if(slices.length === 0){
      // @ts-ignore
      report.slices = [...selectedDatasets]
    }
    else{
      // @ts-ignore
      report.slices = slices;
    }

    postActiveReportEndpoint('/', report, addSuccessToast, addDangerToast).then(r => {
      if(r){
        if ("json" in r) {
          const {id} = r.json;
          window.location.href = `/active_reports/report/${id}`
        }
      }
    } ).catch();
  }


  return (
    <>
      <StyledContainer>
        <Form layout="vertical">
          <h3>{t('New Report')}</h3>

          <FormItem label={t('Name')}>
            <Input
              name="name"
              type="text"
              value={reportName}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setReportName(event.target.value ?? '')
              }
            />
          </FormItem>

          <div className={'templates'}>
            <Select
              mode={'single'}
              ariaLabel={t('templates')}
              name="select-template"
              header={<FormLabel>{t('Select template')}</FormLabel>}
              onChange={handleOnChangeTemplate}
              options={templates_list.map(tl => {
                return {value: tl.id, label: tl.name}
              })}
              placeholder={t('Select templates')}
              showSearch
              value = { selectedTemplates?.value  }
            />
          </div>

          <br />

          <div className={'dataset-active-report'}>
            <Select
              mode={'multiple'}
              ariaLabel={t('Dataset')}
              name="select-datasource"
              header={<FormLabel required>{t('Select datasets')}</FormLabel>}
              onChange={handleOnChangeDatasources}
              options={datasets}
              placeholder={t('Select datasets')}
              showSearch
              value={selectedDatasources.map(datasource => {
                return datasource.datasourceValue
              })}
            />
          </div>
          <hr />
        </Form>

        <div className={'Report name'}>
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
