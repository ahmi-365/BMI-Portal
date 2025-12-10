import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OCRUpload } from "../../components/common/OCRUpload";
import { Upload, AlertCircle } from "lucide-react";
import { getOCRStatus } from "../../services/ocr";

/**
 * Common OCR Page Component
 * Reusable page for OCR document processing across all modules
 *
 * Usage:
 * <OCRPage
 *   title="Upload Invoices"
 *   resourceName="invoices"
 *   onProcessingComplete={handleComplete}
 *   maxFiles={10}
 * />
 */
export const OCRPage = ({
  title = "Document OCR Processing",
  description = "Upload documents for automatic text extraction using OCR",
  resourceName = "documents",
  onProcessingComplete,
  maxFiles = 10,
  allowedFormats = ["JPEG", "PNG", "GIF", "WEBP"],
}) => {
  const navigate = useNavigate();
  const [extractedData, setExtractedData] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState(null);

  useEffect(() => {
    // Check if OCR is configured
    const status = getOCRStatus();
    setOcrStatus(status);
  }, []);

  const handleOCRComplete = (data) => {
    setExtractedData(data);
  };

  const handleProcessingComplete = async () => {
    const completedExtractions = Object.values(extractedData).filter(
      (d) => d.success
    );

    if (completedExtractions.length === 0) {
      alert(
        "No successfully extracted documents. Please process some files first."
      );
      return;
    }

    setIsUploading(true);

    try {
      // Prepare data for backend
      const processedData = completedExtractions.map((extraction) => ({
        fileName: extraction.fileName,
        fileType: extraction.fileType,
        extractedText: extraction.extractedText,
        structuredData: extraction.structuredData,
        model: extraction.model,
        processedAt: new Date().toISOString(),
      }));

      // Call backend to save processed data
      // Example: await apiService.create(`/${resourceName}/ocr`, { documents: processedData });

      // For now, call the provided callback or show success
      if (onProcessingComplete) {
        await onProcessingComplete(processedData);
      } else {
        alert(
          `Successfully processed ${completedExtractions.length} document(s)`
        );
      }

      // Navigate to resource view page
      navigate(`/${resourceName}/view`);
    } catch (error) {
      console.error("Error saving processed data:", error);
      alert("Error saving processed data. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    if (confirm("Are you sure? Any unsaved changes will be lost.")) {
      navigate(`/${resourceName}/view`);
    }
  };

  // Validate OCR configuration
  if (!ocrStatus?.configured) {
    return (
      <div className="p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-title-md2 font-bold text-black dark:text-white">
              {title}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          </div>
        </div>

        <div className="max-w-4xl rounded-xl border-l-4 border-red-500 bg-red-50 p-6 dark:bg-red-500/10">
          <div className="flex gap-4">
            <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-400 mb-2">
                OCR Service Not Configured
              </h3>
              <p className="text-red-800 dark:text-red-300 text-sm mb-4">
                The OpenAI OCR service is not properly configured. Please follow
                these steps to enable it:
              </p>
              <ol className="list-decimal list-inside text-sm text-red-800 dark:text-red-300 space-y-2">
                <li>
                  Create a{" "}
                  <code className="bg-red-100 dark:bg-red-900 px-2 py-1 rounded">
                    .env.local
                  </code>{" "}
                  file in the project root
                </li>
                <li>
                  Add your OpenAI API key:{" "}
                  <code className="bg-red-100 dark:bg-red-900 px-2 py-1 rounded">
                    VITE_OPENAI_API_KEY=your_api_key_here
                  </code>
                </li>
                <li>
                  Get your API key from{" "}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-red-600"
                  >
                    platform.openai.com/api-keys
                  </a>
                </li>
                <li>Restart your development server</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-title-md2 font-bold text-black dark:text-white">
            {title}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl">
        <div className="rounded-xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
          {/* Info Section */}
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
            <h3 className="font-medium text-black dark:text-white mb-2">
              Document Upload & OCR Processing
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Upload document images for automatic text extraction using
              AI-powered OCR. Supported formats: {allowedFormats.join(", ")}
            </p>
          </div>

          <div className="p-6">
            {/* OCR Upload Component */}
            <OCRUpload onOCRComplete={handleOCRComplete} maxFiles={maxFiles} />

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end gap-4 border-t border-gray-200 pt-6 dark:border-gray-700">
              <button
                type="button"
                onClick={handleCancel}
                className="flex justify-center rounded-lg border border-stroke px-6 py-2.5 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessingComplete}
                disabled={
                  isUploading ||
                  Object.values(extractedData).filter((d) => d.success)
                    .length === 0
                }
                className="flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 font-medium text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4" />
                {isUploading
                  ? "Processing..."
                  : `Complete (${
                      Object.values(extractedData).filter((d) => d.success)
                        .length
                    })`}
              </button>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-500/10">
          <h4 className="font-medium text-blue-900 dark:text-blue-400 mb-2">
            📋 Tips for Best Results
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-300">
            <li>Ensure documents are well-lit and clearly visible</li>
            <li>Use high-quality images for better extraction accuracy</li>
            <li>Avoid blurry or rotated images when possible</li>
            <li>Process one document type at a time for better organization</li>
            <li>Review extracted text for accuracy before completing</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
