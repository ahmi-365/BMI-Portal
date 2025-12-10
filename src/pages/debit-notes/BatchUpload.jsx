import { BatchUploadPage } from "../../components/common/BatchUploadPage";

export default function DebitNotesBatchUpload() {
  return (
    <BatchUploadPage
      resourceName="debitnotes"
      title="Debit Notes"
      enableOCR={true}
    />
  );
}
