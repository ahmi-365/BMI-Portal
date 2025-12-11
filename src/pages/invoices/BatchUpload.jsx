import { BatchUploadPage } from "../../components/common/BatchUploadPage";

export default function InvoicesBatchUpload() {
  return (
    <BatchUploadPage
      resourceName="invoices"
      title="Invoices"
      enableOCR={true}
    />
    
  );
}
