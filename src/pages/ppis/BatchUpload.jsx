import BatchUploadSimple from "../../components/common/BatchUploadSimple";
import PageMeta from "../../components/common/PageMeta";

export default function PpisBatchUpload() {
  return (
    <>
      <PageMeta
        title="CN PPI Batch Upload"
        description="Upload CN PPI records in bulk."
      />
      <BatchUploadSimple
        resourceName="ppis"
        sampleUrl="/ppis/sample"
        uploadUrl="/ppis/bulk-upload"
      />
    </>
  );
}
