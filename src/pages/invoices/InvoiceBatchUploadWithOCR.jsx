import { BatchUploadPage } from "../../components/common/BatchUploadPage";

/**
 * Invoice Batch Upload with OCR
 * Example of using BatchUploadPage with OCR enabled
 *
 * Features:
 * - Drag and drop file upload
 * - OCR processing for image documents
 * - PDF support (with backend service)
 * - Batch-specific settings
 * - Real-time text extraction preview
 */
export const InvoiceBatchUploadWithOCR = () => {
  const ocrSettings = {
    processingMode: "structured", // standard, structured, detailed
    autoProcess: false,
    extractTables: true,
    extractLineItems: true,
    customPrompt: "Extract invoice number, amount, vendor name, and line items",
  };

  return (
    <BatchUploadPage
      title="Invoices"
      resourceName="invoices"
      enableOCR={true}
      ocrSettings={ocrSettings}
    />
  );
};

export default InvoiceBatchUploadWithOCR;
