import React, { useState } from 'react';
// import { pdfjs, Document, Page } from 'react-pdf';
import { pdfjs, Document, Page } from 'react-pdf/dist/esm/entry.webpack';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.js`;
// const ASSET_BASE_URL = process.env.ASSET_BASE_URL || '';

const options = {
  cMapUrl: 'cmaps/',
  cMapPacked: true,
  workerSrc: `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.js`,
};

export default function AllPagesPdfViewer(props) {
  const [numPages, setNumPages] = useState(null);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const { pdf } = props;

  return (
    <Document
      file={pdf}
      // options={{ workerSrc: 'pdf.worker.js' }}
      // options={{ workerSrc: `${ASSET_BASE_URL}/static/assets/pdf.worker.js` }}
      options={options}
      onLoadSuccess={onDocumentLoadSuccess}
    >
      {Array.from(new Array(numPages), (el, index) => (
        <Page key={`page_${index + 1}`} pageNumber={index + 1} />
      ))}
    </Document>
  );
}
