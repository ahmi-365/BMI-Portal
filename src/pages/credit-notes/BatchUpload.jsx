import { BatchUploadPage } from "../../components/common/BatchUploadPage";

export default function CreditNotesBatchUpload() {
  return (
    <BatchUploadPage
      resourceName="creditnotes"
      title="Credit Notes"
      enableOCR={true}
    />
  );
}
