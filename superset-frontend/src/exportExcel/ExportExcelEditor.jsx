import React from 'react';
import PropTypes from 'prop-types';
import {styled, SupersetClient, t, supersetTheme} from '@superset-ui/core';
import Card from 'src/components/Card';

import Tabs from 'src/components/Tabs';

import CheckboxControl from 'src/explore/components/controls/CheckboxControl';
import TextControl from 'src/explore/components/controls/TextControl';
import SelectControl from 'src/explore/components/controls/SelectControl';
import TextAreaControl from 'src/explore/components/controls/TextAreaControl';
import SelectAsyncControl from 'src/explore/components/controls/SelectAsyncControl';
import SpatialControl from 'src/explore/components/controls/SpatialControl';
import Label from 'src/components/Label';
import EditableTitle from 'src/components/EditableTitle';

import CollectionTable from 'src/CRUD/CollectionTable';
import Fieldset from 'src/CRUD/Fieldset';
import Field from 'src/CRUD/Field';

import withToasts from 'src/messageToasts/enhancers/withToasts';
import {Col, Row} from 'react-bootstrap';

import Spreadsheet from "react-spreadsheet";
import Badge from "../components/Badge";

import {SketchPicker} from 'react-color'
import {DATA_TYPES, NUMBER_FORMAT, EXCEL_DATE_FORMAT} from "./exportExcelUtils"

const ExportExcelContainer = styled.div`
  .change-warning {
    margin: 16px 10px 0;
    color: ${({theme}) => theme.colors.warning.base};
  }

  .change-warning .bold {
    font-weight: ${({theme}) => theme.typography.weights.bold};
  }

  .form-group.has-feedback > .help-block {
    margin-top: 8px;
  }

  .form-group.form-group-md {
    margin-bottom: 8px;
  }
`;

const StyledTableTabs = styled(Tabs)`
  overflow: visible;

  .ant-tabs-content-holder {
    overflow: visible;
  }
`;

function CollectionTabTitle({title, collection}) {
  return (
    <div data-test={`collection-tab-${title}`}>
      {title} <Badge count={collection ? collection.length : 0} showZero/>
    </div>
  );
}

CollectionTabTitle.propTypes = {
  title: PropTypes.string,
  collection: PropTypes.array,
};

const checkboxGenerator = (d, onChange) => (
  <CheckboxControl value={d} onChange={onChange}/>
);
// const default_column_info = {
//   column_name: undefined,
//   type: undefined,
//   show: true,
//   format: undefined,
//   alias: undefined,
//   width: undefined,
//   font: undefined,
//   background_color: undefined,
//   font_color: undefined,
//   isBold: false,
// };
function ColumnCollectionTable(
  {
    columns,
    onChange,
    editableColumnName,
    allowAddItem,
    itemGenerator,
    formats,
  }
  ) {
  return (
    <CollectionTable
      collection={columns}
      tableColumns={['column_name', 'type', 'show']}
      allowDeletes
      allowAddItem={allowAddItem}
      itemGenerator={itemGenerator}
      stickyHeader
      expandFieldset={
        <FormContainer>
          <Fieldset compact>
            <Field
              fieldKey="alias"
              label={t('Label')}
              control={
                <TextControl
                  controlId="alias"
                  placeholder={t('Label')}
                />
              }
            />
            <Field
              label={t("format")}
              fieldKey={"format"}
              control={
                <SelectControl choices={formats}/>
              }
            />
            <Field
              label={t('Column Width')}
              fieldKey={'width'}
              control={
                <TextControl
                  controlId="width"
                  placeholder="20"
                />
              }
            />
            <Field
              label={t("font_color")}
              fieldKey={"font_color"}
              control={
                <CheckboxControl/>
              }
            />
            <Field
              label={t("font")}
              fieldKey={"font"}
              control={
                <CheckboxControl/>
              }
            />
            <Field
              label={t("background_color")}
              fieldKey={"background_color"}
              control={
                <CheckboxControl/>
              }
            />
            <Field
              label={t("Bold")}
              fieldKey={"isBold"}
              control={
                <CheckboxControl/>
              }
            />
            <Field
              label={t("Bold")}
              fieldKey={"isBold1"}
              control={
                <CheckboxControl/>
              }
            />
            <Field
              label={t("Bold")}
              fieldKey={"isBold2"}
              control={
                <SketchPicker/>
              }
            />
            <Field
              label={t("Bold")}
              fieldKey={"isBold3"}
              control={
                <SketchPicker hex={'#300000'}/>
              }
            />
          </Fieldset>
        </FormContainer>
      }
      columnLabels={{
        column_name: t('Column'),
        type: t('Data type'),
        show: t('Show in exported data'),
      }}
      onChange={onChange}
      itemRenderers={{
        column_name: (v, onItemChange) =>
          editableColumnName ? (
            <EditableTitle canEdit title={v} onSaveTitle={onItemChange}/>
          ) : (
            v
          ),
        type: d => <Label>{d}</Label>,
        show: checkboxGenerator,
      }}
    />
  );
}

ColumnCollectionTable.propTypes = {
  columns: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  editableColumnName: PropTypes.bool,
  showExpression: PropTypes.bool,
  allowAddItem: PropTypes.bool,
  allowEditDataType: PropTypes.bool,
  itemGenerator: PropTypes.func,
};

ColumnCollectionTable.defaultProps = {
  editableColumnName: false,
  showExpression: false,
  allowAddItem: false,
  allowEditDataType: false,
  itemGenerator: () => ({
    column_name: '<new column>',
    filterable: true,
    groupby: true,
  }),
};

function FormContainer({children}) {
  return <Card padded>{children}</Card>;
}

FormContainer.propTypes = {
  children: PropTypes.node,
};

const propTypes = {
  //   datasource: PropTypes.object.isRequired,
  //   onChange: PropTypes.func,
  // addSuccessToast: PropTypes.func.isRequired,
  // addDangerToast: PropTypes.func.isRequired,
  queriesResponse: PropTypes.object.isRequired,
  previewData: PropTypes.object,
  columnsInfo: PropTypes.array,
};

class ExportExcelEditor extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      activeTabKey: 0,
      //   collection: {}
    };

    this.generateColumnsProperties = this.generateColumnsProperties.bind(this);
  }

  handleTabSelect(activeTabKey) {
    this.setState({activeTabKey});
  }

  //Generate properties for columns
  generateColumnsProperties() {
    const queriesResponse = this.props.queriesResponse[0];
    const colNames = queriesResponse.colnames;
    const colTypes = queriesResponse.coltypes;

    const collection = colNames.map((col, index) => {
      return {
        column_name: col,
        type: colTypes[index],
        show: true,
        format: '',
        alias: '',
      };
    });
    console.log('Generate columns properties');
    console.log(collection);
    //   this.setState({collection});
    return collection;
  }

  render() {
    const {activeTabKey} = this.state;
    // const collection = this.generateColumnsProperties();
    const {columnsInfo} = this.props;

    console.log('export excel editor')
    console.log(this.props.previewData)
    return (
      <ExportExcelContainer>
        <Row>
          <Col>
            <StyledTableTabs
              fullWidth={false}
              id="table-export-excel-tabs"
              data-test="edit-export-excel-tabs"
              onChange={this.handleTabSelect}
              defaultActiveKey={activeTabKey}
            >
              <Tabs.TabPane
                key={0}
                tab={
                  <CollectionTabTitle
                    collection={columnsInfo}
                    title={t('Columns')}
                  />
                }>
                {/* <p>Tab de Columnas </p> */}
                <ColumnCollectionTable
                  className="columns-table-report"
                  columns={columnsInfo}
                />
              </Tabs.TabPane>
              <Tabs.TabPane key={1} tab={t('Headers')}>
                <p>Tab de Headers</p>
              </Tabs.TabPane>
              <Tabs.TabPane key={2} tab={t('Audit')}>
                <p>Tab de Audit</p>
              </Tabs.TabPane>
            </StyledTableTabs>
          </Col>
        </Row>
        <Row>
          <Col>
            <h1> PREVIEW </h1>
            <Spreadsheet data={this.props.previewData}/>
          </Col>
        </Row>
      </ExportExcelContainer>
    );
  }
}

// ExportExcelEditor.defaultProps = defaultProps;
ExportExcelEditor.propTypes = propTypes;

export default withToasts(ExportExcelEditor);
