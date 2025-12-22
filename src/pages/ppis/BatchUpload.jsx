import { BatchUploadPage } from "../../components/common/BatchUploadPage";
import PageMeta from "../../components/common/PageMeta";

export default function PpisBatchUpload() {
  return (
    <>
      <PageMeta
        title="CN PPI Batch Upload"
        description="Upload CN PPI records in bulk."
      />
      <BatchUploadPage resourceName="ppis" title="CN PPI Batch Upload" />
    </>
  );
}
