import { OCRPage } from "../../components/common/OCRPage";

/**
 * Example OCR Page for Invoices
 * This is a template showing how to use the OCRPage component
 * Copy this pattern for other resources (customers, delivery-orders, etc.)
 */
export const InvoiceOCRExample = () => {
  const handleProcessingComplete = async (processedData) => {
    try {
      console.log("Processing complete. Documents:", processedData);

      // Example: Save to backend
      // const response = await apiService.create("/invoices/ocr-process", {
      //   documents: processedData,
      //   processedAt: new Date().toISOString(),
      // });
      // console.log("Saved successfully:", response);

      // For now, just log the data
      processedData.forEach((doc) => {
        console.log(`File: ${doc.fileName}`);
        console.log(`Text Preview: ${doc.extractedText.substring(0, 200)}...`);
        if (doc.structuredData) {
          console.log(`Structured:`, doc.structuredData);
        }
      });
    } catch (error) {
      console.error("Error processing documents:", error);
      alert("Error processing documents. Please try again.");
    }
  };

  return (
    <OCRPage
      title="Upload & Process Invoices"
      description="Upload invoice documents for automatic text extraction and processing using AI-powered OCR"
      resourceName="invoices"
      onProcessingComplete={handleProcessingComplete}
      maxFiles={15}
      allowedFormats={["JPEG", "PNG", "GIF", "WEBP"]}
    />
  );
};

export default InvoiceOCRExample;
