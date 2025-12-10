import { BatchUploadPage } from "../../components/common/BatchUploadPage";

export default function AccountStatementsBatchUpload() {
  return (
    <BatchUploadPage
      resourceName="statements"
      title="Account Statements"
      enableOCR={true}
    />
  );
}
