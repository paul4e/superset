import React, { useEffect, useState } from 'react';
import Button from 'src/components/Button';
import { List } from 'src/common/components';
import Icons from 'src/components/Icons';
import { styled, t } from '@superset-ui/core';
import { Tooltip } from 'src/components/Tooltip';
import FileUploadType from '../../types/FileUploadType';
import { FormLabel } from '../../../components/Form';

const StyledContainer = styled.div`
  width: 90%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-height: ${({ theme }) => theme.gridUnit * 10}px;
  padding-top: ${({ theme }) => theme.gridUnit * 2 + 2}px;
  margin-left: 1.5rem;

  .btn-select-csv {
    margin-bottom: 1rem;
    min-width: 12rem;
  }
  .file-list {
    display: flex;
    flex-direction: row;
    align-content: center;
    align-items: flex-start;
    margin-bottom: 1rem;
    width: 100%;
  }

  .file-list .file-list-item {
    height: 2rem;
    display: flex;
    flex-direction: row;
    align-content: center;
    align-items: flex-start;
    padding-bottom: 4px;
    padding-top: 4px;
  }
  .ant-spin-nested-loading {
    width: 100%;
  }
  .file-list .file-list-item .action-button {
    padding-top: 2px;
  }
`;

interface FileUploadProps {
  OnFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  accept: string;
  selectedFiles: FileUploadType[];
  handleDelete: (file: string) => void;
}

const LoadMultipleFiles = (props: FileUploadProps) => {
  const hiddenFileInput = React.useRef<HTMLInputElement>(null);
  const [fileNames, setFileNames] = useState<string[] | null>(null);

  useEffect(() => {
    console.log(`Inicial, files ${fileNames}`);
  }, []);

  useEffect(() => {
    const file_names = props.selectedFiles.map(
      file => (file.selectedFileName || file.selectedFile?.name) as string,
    );
    setFileNames(file_names);
  }, [props.selectedFiles]);

  const handleClick = (e: React.ChangeEvent<any>) => {
    if (hiddenFileInput.current) {
      hiddenFileInput.current.click();
    }
  };

  const render_list_item = (file: string) => (
    // {fileNames &&
    // fileNames.map(file => {
    //   console.log(`files ${fileNames}`);
    <List.Item className="file-list-item" id={file}>
      {file}
      <Tooltip
        id="delete-action-tooltip"
        title={t('Delete')}
        placement="bottom"
      >
        {/* eslint-disable-next-line jsx-a11y/interactive-supports-focus */}
        <span
          role="button"
          className="action-button"
          onClick={() => {
            console.log(`file deleted , ${file}`);
            props.handleDelete(file);
          }}
        >
          <Icons.Close />
        </span>
      </Tooltip>
    </List.Item>
  );
  // })}
  const fileList = () =>
    fileNames && fileNames?.length > 0 ? (
      <List
        size="small"
        bordered
        className="file-list"
        dataSource={fileNames}
        renderItem={render_list_item}
      />
    ) : (
      <h3> No CSV files selected</h3>
    );

  return (
    <StyledContainer>
      <FormLabel>{t('Select CSV Files')}</FormLabel>
      <Button
        className="btn-select-csv"
        buttonStyle="primary"
        onClick={handleClick}
      >
        Select CSV Files
      </Button>
      {fileList()}
      <input
        ref={hiddenFileInput}
        onChange={props.OnFileChange}
        accept={props.accept}
        type="file"
        style={{ display: 'none' }}
        multiple
      />
    </StyledContainer>
  );
};

export default LoadMultipleFiles;
