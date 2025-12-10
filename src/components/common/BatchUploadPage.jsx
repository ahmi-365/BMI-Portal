import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BatchUpload } from "../../components/common/BatchUpload";
import { Upload, AlertCircle, CheckCircle } from "lucide-react";
import { apiService } from "../../services/api";

export const BatchUploadPage = ({
  resourceName,
  title,
  enableOCR = false,
  ocrSettings = {},
}) => {
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [ocrResults, setOcrResults] = useState({});
  const [uploadStatus, setUploadStatus] = useState(null);

  const handleFilesSelected = (files) => {
    setUploadedFiles(files);
  };

  const handleOCRComplete = (results) => {
    setOcrResults(results);
    console.log("OCR Results:", results);
  };

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      alert("Please select files to upload");
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);

    try {
      // If OCR is enabled, we need all files to be processed first
      if (enableOCR) {
        const unprocessedFiles = uploadedFiles.filter((f) => !ocrResults[f.id]);
        if (unprocessedFiles.length > 0) {
          alert(
            `Please wait for all files to be processed with OCR.\nProcessed: ${
              uploadedFiles.length - unprocessedFiles.length
            }/${uploadedFiles.length}`
          );
          setIsUploading(false);
          return;
        }
      }

      // Prepare data to log/display (OCR text extraction is the main goal)
      const processedData = {
        totalFiles: uploadedFiles.length,
        extractedData: enableOCR ? ocrResults : {},
        batchSettings: enableOCR
          ? {
              processingMode: "standard",
              ocrEnabled: true,
              extractedFiles: Object.keys(ocrResults).filter(
                (k) => ocrResults[k]?.success
              ).length,
            }
          : null,
      };

      // Log the extracted data that would be sent to backend
      console.log("Extracted OCR Data Ready for Backend:", processedData);

      // Show success with extracted text
      setUploadStatus({
        type: "success",
        message: `Successfully extracted text from ${uploadedFiles.length} file(s)`,
        details: enableOCR
          ? `${
              Object.values(ocrResults).filter((r) => r.success).length
            } files processed with OCR text extraction`
          : `${uploadedFiles.length} files ready`,
      });

      // Log each file's extracted text for backend consumption
      uploadedFiles.forEach((fileObj, index) => {
        const result = ocrResults[fileObj.id];
        if (result && result.success) {
          console.log(`\n📄 File ${index + 1}: ${fileObj.name}`);
          console.log(
            "Extracted Text:",
            result.extractedText.substring(0, 200) + "..."
          );
          console.log(
            "Full Text Length:",
            result.extractedText.length,
            "characters"
          );
        }
      });

      // Reset after 3 seconds
      setTimeout(() => {
        setUploadedFiles([]);
        setOcrResults({});
        navigate(`/${resourceName}/view`);
      }, 3000);
    } catch (error) {
      console.error("Error processing files:", error);
      setUploadStatus({
        type: "error",
        message: error.message || "Error processing files. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-title-md2 font-bold text-black dark:text-white">
            Batch Upload - {title}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Upload multiple documents at once
          </p>
        </div>
      </div>

      <div className="max-w-4xl">
        <div className="rounded-xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-black dark:text-white">
                Upload Files
                {enableOCR && (
                  <span className="ml-2 inline-block text-xs bg-green-100 text-green-800 px-2 py-1 rounded dark:bg-green-900 dark:text-green-200">
                    OCR Enabled
                  </span>
                )}
              </h3>
            </div>
          </div>

          <div className="p-6">
            <BatchUpload
              onFilesSelected={handleFilesSelected}
              maxFiles={enableOCR ? 20 : 10}
              enableOCR={enableOCR}
              ocrSettings={ocrSettings}
              onOCRComplete={handleOCRComplete}
            />

            {/* Status Messages */}
            {uploadStatus && (
              <div
                className={`mt-4 rounded-lg p-4 flex items-start gap-3 ${
                  uploadStatus.type === "success"
                    ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                    : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                }`}
              >
                {uploadStatus.type === "success" ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-medium">{uploadStatus.message}</p>
                  {uploadStatus.details && (
                    <p className="text-sm mt-1">{uploadStatus.details}</p>
                  )}
                </div>
              </div>
            )}

            {/* OCR Summary */}
            {enableOCR && Object.keys(ocrResults).length > 0 && (
              <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
                <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                  OCR Processing Summary
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-400">
                  {Object.values(ocrResults).filter((r) => r.success).length} of{" "}
                  {Object.keys(ocrResults).length} files processed successfully
                </p>
              </div>
            )}

            <div className="mt-8 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate(`/${resourceName}/view`)}
                className="flex justify-center rounded-lg border border-stroke px-6 py-2.5 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading || uploadedFiles.length === 0}
                className="flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 font-medium text-gray-100 hover:bg-opacity-90 disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {isUploading
                  ? "Uploading..."
                  : `Upload ${uploadedFiles.length} File(s)`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
