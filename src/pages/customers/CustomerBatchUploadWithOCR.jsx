import { BatchUploadPage } from "../../components/common/BatchUploadPage";

/**
 * Customer Documents Batch Upload with OCR
 * Example of using BatchUploadPage with OCR for customer documents
 *
 * Features:
 * - Upload customer identification documents
 * - OCR processing for identity verification
 * - PDF support
 * - Batch settings for document type
 */
export const CustomerBatchUploadWithOCR = () => {
  const ocrSettings = {
    processingMode: "structured",
    autoProcess: false,
    documentType: "identification",
    extractFields: ["name", "id_number", "date_of_birth", "address"],
  };

  return (
    <BatchUploadPage
      title="Customer Documents"
      resourceName="customers"
      enableOCR={true}
      ocrSettings={ocrSettings}
    />
  );
};

export default CustomerBatchUploadWithOCR;
