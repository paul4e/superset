import React /* , {  useState,  useMemo } */, {
  useEffect,
  useState,
} from 'react';
import { useParams } from 'react-router-dom';
import withToasts from 'src/messageToasts/enhancers/withToasts';
import {
  SupersetClient,
  styled /* , t, css, useTheme */,
} from '@superset-ui/core';
// @ts-ignore
import { Document, Page } from 'react-pdf';

import AllPagesPdfViewer from '../../components/pdf/all-pages-pdf-viewer';

interface ReportDefinitionPageProps {
  addDangerToast: (msg: string) => void;
  addSuccessToast: (msg: string) => void;
  user: {
    userId: string | number;
  };
}

const Styles = styled.div`
  background: ${({ theme }) => theme.colors.grayscale.light5};
  text-align: left;
  position: relative;
  width: 100%;
  max-height: 90%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: stretch;
  border-top: 1px solid ${({ theme }) => theme.colors.grayscale.light2};
  .render-report-html {
    display: flex;
    flex: auto;
    align-items: center;
    justify-content: center;
    margin: 15px;
    border: 1px solid ${({ theme }) => theme.colors.grayscale.light2};
  }
  .render-report-pdf {
    display: flex;
    flex: auto;
    align-items: center;
    justify-content: center;
    margin: 15px;
    border: 1px solid ${({ theme }) => theme.colors.grayscale.light2};
  }
`;

const renderReport = ({
  report_definition_id,
  render_format,
}: {
  report_definition_id: string;
  render_format: string;
}) =>
  SupersetClient.get({
    endpoint: `/api/v1/report_definitions/render/${report_definition_id}/${render_format}`,
  })
    .then(res => {
      if (render_format === 'HTML') {
        return res.json.json.content;
      }
      // console.log(typeof res.json);
      return res.json.json.content;
    })
    .catch(err => {
      console.log(err);
      return err;
    });

function ReportDefinitionPage(props: ReportDefinitionPageProps) {
  const { report_definition_id, render_format } = useParams<{
    report_definition_id: string;
    render_format: string;
  }>();

  const [reportContent, setReportContent] = useState<string>('');
  const [isHTML, setIsHTML] = useState<boolean>(false);
  const [pdfURL, setPDFURL] = useState<string>('');
  // const theme = useTheme();

  // const testing_report_html =
  //   '\n<style type="text/css">\n\t\t.style_0 { font-family: serif; font-style: normal; font-variant: normal; font-weight: normal; font-size: 10pt; color: black; text-indent: 0em; letter-spacing: normal; word-spacing: normal; text-transform: none; white-space: normal; line-height: normal;}\n\t\t.style_1 { width: 100%;}\n</style>\n<script type="text/javascript">\n //<![CDATA[\n   function redirect(target, url){\n       if (target ==\'_blank\'){\n           open(url);\n       }\n       else if (target == \'_top\'){\n           window.top.location.href=url;\n       }\n       else if (target == \'_parent\'){\n           location.href=url;\n       }\n       else if (target == \'_self\'){\n           location.href =url;\n       }\n       else{\n           open(url);\n       }\n      }\n //]]>\n</script>\n<div id="__BIRT_ROOT" class="style_0" title="Sample Report">\n\t<table cellpadding="0" style="empty-cells: show; border-collapse:collapse; width:8in; overflow: hidden; table-layout:fixed;">\n\t\t<col></col>\n\t\t<tr>\n\t\t\t<td></td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td valign="top">\n\t\t\t\t<table class="style_1" style="border-collapse: collapse; empty-cells: show; width: 100%; overflow:hidden; table-layout:fixed;" id="AUTOGENBOOKMARK_1_071f96b8-8fa5-41f1-b8dc-c3201f35a1f9">\n\t\t\t\t\t<col></col>\n\t\t\t\t\t<col></col>\n\t\t\t\t\t<tr valign="top" align="left">\n\t\t\t\t\t\t<td style=" overflow:hidden;">\n\t\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t\t<img id="AUTOGENBOOKMARK_2_3e5b272c-3f05-4df0-bba9-e9728841c412" src="https://www.baeldung.com/wp-content/themes/baeldung/favicon/favicon-96x96.png" alt="" style="display: block;"></img>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</td>\n\t\t\t\t\t\t<td style=" overflow:hidden;">\n\t\t\t\t\t\t\t<div id="AUTOGENBOOKMARK_3_83deab78-85d7-4b4d-afc6-0163a382c59c">Hello, Baeldung world!</div>\n\t\t\t\t\t\t</td>\n\t\t\t\t\t</tr>\n\t\t\t\t</table>\n\t\t\t</td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td></td>\n\t\t</tr>\n\t</table>\n</div>';
  // const testing_report_html =
  //   '\n<style type="text/css">\n\t\t.style_0 { font-family: serif; font-style: normal; font-variant: normal; font-weight: normal; font-size: 10pt; color: black; text-indent: 0em; letter-spacing: normal; word-spacing: normal; text-transform: none; white-space: normal; line-height: normal;}\n\t\t.style_1 { width: 7.948in;}\n\t\t.style_4 { border: solid black;}\n\t\t.style_2 { height: 286.125pt; width: 572.25pt;}\n\t\t.style_3 { border: solid black;}\n</style>\n<script type="text/javascript">\n //<![CDATA[\n   function redirect(target, url){\n       if (target ==\'_blank\'){\n           open(url);\n       }\n       else if (target == \'_top\'){\n           window.top.location.href=url;\n       }\n       else if (target == \'_parent\'){\n           location.href=url;\n       }\n       else if (target == \'_self\'){\n           location.href =url;\n       }\n       else{\n           open(url);\n       }\n      }\n //]]>\n</script>\n<div id="__BIRT_ROOT" class="style_0" title="new_report">\n\t<table cellpadding="0" style="empty-cells: show; border-collapse:collapse; width:8in; overflow: hidden; table-layout:fixed;">\n\t\t<col></col>\n\t\t<tr>\n\t\t\t<td></td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td valign="top">\n\t\t\t\t<table class="style_1" style="border-collapse: collapse; empty-cells: show; width: 7.948in; overflow:hidden; table-layout:fixed;" id="AUTOGENBOOKMARK_1_1075a09a-71bc-4eac-ac6f-08453adbb39e">\n\t\t\t\t\t<col style=" width: 2.156in;"></col>\n\t\t\t\t\t<col></col>\n\t\t\t\t\t<tr valign="top" align="left">\n\t\t\t\t\t\t<td colspan="2" style=" overflow:hidden;">\n\t\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t\t<embed class="style_2" id="__bookmark_1" onresize="document.getElementById(\'__bookmark_1\').reload()" type="image/svg+xml" src="/reports/$images.relative.path/custom7301076517e208f747f3.svg" alt="" style=" width: 572.25pt; height: 286.125pt;display: block;"></embed>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</td>\n\t\t\t\t\t</tr>\n\t\t\t\t\t<tr valign="top" align="left">\n\t\t\t\t\t\t<td colspan="2" style=" overflow:hidden;">\n\t\t\t\t\t\t\t<table class="style_3" style="border-collapse: collapse; empty-cells: show; width: 100%; overflow:hidden; table-layout:fixed;" id="__bookmark_2">\n\t\t\t\t\t\t\t\t<col></col>\n\t\t\t\t\t\t\t\t<col></col>\n\t\t\t\t\t\t\t\t<col></col>\n\t\t\t\t\t\t\t\t<col></col>\n\t\t\t\t\t\t\t\t<tr class="style_4" valign="top" align="center">\n\t\t\t\t\t\t\t\t\t<th style=" overflow:hidden;font-weight: normal; border-top: solid black; border-bottom: solid black; border-left: solid black;">\n\t\t\t\t\t\t\t\t\t\t<div id="AUTOGENBOOKMARK_2_9fe74d88-3dd5-4caa-9258-58631182ea24">Student</div>\n\t\t\t\t\t\t\t\t\t</th>\n\t\t\t\t\t\t\t\t\t<th style=" overflow:hidden;font-weight: normal; border-top: solid black; border-bottom: solid black;">\n\t\t\t\t\t\t\t\t\t\t<div id="AUTOGENBOOKMARK_3_8657c99d-11f0-4ba1-80b9-51fa5b1c2472">Math</div>\n\t\t\t\t\t\t\t\t\t</th>\n\t\t\t\t\t\t\t\t\t<th style=" overflow:hidden;font-weight: normal; border-top: solid black; border-bottom: solid black;">\n\t\t\t\t\t\t\t\t\t\t<div id="AUTOGENBOOKMARK_4_b50341bc-84b6-4471-8478-f7b76b36dd10">Geography</div>\n\t\t\t\t\t\t\t\t\t</th>\n\t\t\t\t\t\t\t\t\t<th style=" overflow:hidden;font-weight: normal; border-top: solid black; border-right: solid black; border-bottom: solid black;">\n\t\t\t\t\t\t\t\t\t\t<div id="AUTOGENBOOKMARK_5_a824b33d-b5bb-4bb1-b737-c67b3e1d5a5b">History</div>\n\t\t\t\t\t\t\t\t\t</th>\n\t\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t\t\t<tr valign="top" align="center">\n\t\t\t\t\t\t\t\t\t<td style=" overflow:hidden;">\n\t\t\t\t\t\t\t\t\t\t<div>Bill</div>\n\t\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t\t\t<td style=" overflow:hidden;">\n\t\t\t\t\t\t\t\t\t\t<div>10</div>\n\t\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t\t\t<td style=" overflow:hidden;">\n\t\t\t\t\t\t\t\t\t\t<div>3</div>\n\t\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t\t\t<td style=" overflow:hidden;">\n\t\t\t\t\t\t\t\t\t\t<div>8</div>\n\t\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t\t\t<tr valign="top" align="center">\n\t\t\t\t\t\t\t\t\t<td style=" overflow:hidden;">\n\t\t\t\t\t\t\t\t\t\t<div>Tom</div>\n\t\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t\t\t<td style=" overflow:hidden;">\n\t\t\t\t\t\t\t\t\t\t<div>5</div>\n\t\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t\t\t<td style=" overflow:hidden;">\n\t\t\t\t\t\t\t\t\t\t<div>6</div>\n\t\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t\t\t<td style=" overflow:hidden;">\n\t\t\t\t\t\t\t\t\t\t<div>5</div>\n\t\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t\t\t<tr valign="top" align="center">\n\t\t\t\t\t\t\t\t\t<td style=" overflow:hidden;">\n\t\t\t\t\t\t\t\t\t\t<div>Anne</div>\n\t\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t\t\t<td style=" overflow:hidden;">\n\t\t\t\t\t\t\t\t\t\t<div>7</div>\n\t\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t\t\t<td style=" overflow:hidden;">\n\t\t\t\t\t\t\t\t\t\t<div>4</div>\n\t\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t\t\t<td style=" overflow:hidden;">\n\t\t\t\t\t\t\t\t\t\t<div>9</div>\n\t\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t\t\t<tr valign="top" align="center">\n\t\t\t\t\t\t\t\t\t<td style=" overflow:hidden;"></td>\n\t\t\t\t\t\t\t\t\t<td style=" overflow:hidden;"></td>\n\t\t\t\t\t\t\t\t\t<td style=" overflow:hidden;"></td>\n\t\t\t\t\t\t\t\t\t<td style=" overflow:hidden;"></td>\n\t\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t\t</table>\n\t\t\t\t\t\t</td>\n\t\t\t\t\t</tr>\n\t\t\t\t</table>\n\t\t\t</td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td></td>\n\t\t</tr>\n\t</table>\n</div>';

  useEffect(() => {
    renderReport({ report_definition_id, render_format })
      .then(res => {
        if (render_format === 'HTML') {
          console.log('html content');
          console.log(res);
          setReportContent(res);
          setIsHTML(true);
        } else if (render_format === 'PDF') {
          console.log('PDF');
          console.log(res);
          const x = async () => {
            await setReportContent(res);
            await setIsHTML(false);
            const blob = base64toBlob(res);
            const urlPDF = URL.createObjectURL(blob);
            console.log(urlPDF);
            setPDFURL(urlPDF);

            return true;
          };
          x();
        }
        return false;
      })
      .catch();
  }, []);

  return (
    <Styles id="report-definition-view-container">
      {isHTML ? (
        <div
          className="render-report-html"
          dangerouslySetInnerHTML={{ __html: reportContent }}
        />
      ) : (
        <div className="render-report-pdf">
          {/* <RenderPDF */}
          {/*  url={`/api/v1/report_definitions/render/${report_definition_id}/PDF`} */}
          {/* /> */}
          <AllPagesPdfViewer pdf={pdfURL} />
        </div>
      )}
    </Styles>
  );
}

// interface RenderPDFProps {
//   url: string;
// }

// function RenderPDF(props: RenderPDFProps) {
//   const [numPages, setNumPages] = useState(null);
//   const [pageNumber, setPageNumber] = useState(1);
//
//   // @ts-ignore
//   function onDocumentLoadSuccess({ numPages }) {
//     setNumPages(numPages);
//   }
//
//   return (
//     <div>
//       <Document file={props.url}  options={{ workerSrc: "/pdf.worker.js" }} onLoadSuccess={onDocumentLoadSuccess}>
//         <Page pageNumber={pageNumber} />
//       </Document>
//       <p>
//         Page {pageNumber} of {numPages}
//       </p>
//     </div>
//   );
// }

const base64toBlob = (data: string) => {
  // Cut the prefix `data:application/pdf;base64` from the raw base 64
  // const base64WithoutPrefix = data.substr(
  //   'data:application/pdf;base64,'.length,
  // );

  const bytes = atob(data);
  let { length } = bytes;
  const out = new Uint8Array(length);

  // eslint-disable-next-line no-plusplus
  while (length--) {
    out[length] = bytes.charCodeAt(length);
  }

  return new Blob([out], { type: 'application/pdf' });
};

export default withToasts(ReportDefinitionPage);
