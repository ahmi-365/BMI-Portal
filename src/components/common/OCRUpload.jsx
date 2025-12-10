import { useState, useRef } from "react";
import {
  Upload,
  X,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader,
} from "lucide-react";
import { extractTextFromImage, processDocumentBatch } from "../../services/ocr";

export const OCRUpload = ({ onOCRComplete, maxFiles = 10 }) => {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [processingFiles, setProcessingFiles] = useState({});
  const [extractedData, setExtractedData] = useState({});
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = e.dataTransfer.files;
    addFiles(droppedFiles);
  };

  const handleChange = (e) => {
    const selectedFiles = e.target.files;
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles) => {
    const fileArray = Array.from(newFiles);
    const supportedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    // Filter files by type
    const validFiles = fileArray.filter((file) => {
      if (!supportedTypes.includes(file.type)) {
        alert(
          `${file.name} is not a supported format. Please use JPEG, PNG, GIF, or WEBP.`
        );
        return false;
      }
      return true;
    });

    const totalFiles = files.length + validFiles.length;

    if (totalFiles > maxFiles) {
      alert(
        `Maximum ${maxFiles} files allowed. You're trying to add ${totalFiles} files.`
      );
      return;
    }

    const newFileObjects = validFiles.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      status: "pending", // pending, processing, completed, error
    }));

    const updatedFiles = [...files, ...newFileObjects];
    setFiles(updatedFiles);
  };

  const removeFile = (id) => {
    const updatedFiles = files.filter((f) => f.id !== id);
    setFiles(updatedFiles);

    // Remove extracted data for this file
    const newExtractedData = { ...extractedData };
    delete newExtractedData[id];
    setExtractedData(newExtractedData);

    // Remove processing status for this file
    const newProcessingFiles = { ...processingFiles };
    delete newProcessingFiles[id];
    setProcessingFiles(newProcessingFiles);
  };

  const processFile = async (fileObj) => {
    setProcessingFiles((prev) => ({
      ...prev,
      [fileObj.id]: true,
    }));

    try {
      const result = await extractTextFromImage(fileObj.file);

      setExtractedData((prev) => ({
        ...prev,
        [fileObj.id]: result,
      }));

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileObj.id
            ? { ...f, status: result.success ? "completed" : "error" }
            : f
        )
      );
    } catch (error) {
      console.error("Processing error:", error);
      setExtractedData((prev) => ({
        ...prev,
        [fileObj.id]: {
          success: false,
          error: error.message,
          fileName: fileObj.name,
        },
      }));

      setFiles((prev) =>
        prev.map((f) => (f.id === fileObj.id ? { ...f, status: "error" } : f))
      );
    } finally {
      setProcessingFiles((prev) => ({
        ...prev,
        [fileObj.id]: false,
      }));
    }
  };

  const processAllFiles = async () => {
    const pendingFiles = files.filter((f) => f.status === "pending");

    for (const fileObj of pendingFiles) {
      await processFile(fileObj);
    }

    if (onOCRComplete) {
      onOCRComplete(extractedData);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="mb-6">
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          dragActive
            ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
            : "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800"
        }`}
      >
        <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
          Drag and drop your documents here
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">or</p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          <Upload className="w-4 h-4" />
          Select Files
        </button>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Max {maxFiles} files • JPEG, PNG, GIF, WEBP supported • Will be
          processed with OCR
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleChange}
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
        />
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div className="mt-6">
          <h4 className="mb-4 font-medium text-gray-900 dark:text-white">
            Files ({files.length})
          </h4>
          <div className="space-y-3">
            {files.map((fileObj) => {
              const extracted = extractedData[fileObj.id];
              const isProcessing = processingFiles[fileObj.id];

              return (
                <div
                  key={fileObj.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {fileObj.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(fileObj.size)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status Indicator */}
                    {isProcessing && (
                      <div className="flex items-center gap-2">
                        <Loader className="h-4 w-4 animate-spin text-brand-500" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          Processing...
                        </span>
                      </div>
                    )}
                    {extracted && !isProcessing && (
                      <>
                        {extracted.success ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span className="text-xs text-green-600 dark:text-green-400">
                              Extracted
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            <span className="text-xs text-red-600 dark:text-red-400">
                              {extracted.error || "Error"}
                            </span>
                          </div>
                        )}
                      </>
                    )}

                    {!isProcessing && fileObj.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => processFile(fileObj)}
                        className="px-3 py-1 text-xs font-medium rounded bg-brand-500 text-white hover:bg-brand-600"
                      >
                        Extract
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => removeFile(fileObj.id)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Process All Button */}
          <div className="mt-4 flex justify-end gap-2">
            {files.some((f) => f.status === "pending") && (
              <button
                type="button"
                onClick={processAllFiles}
                className="px-4 py-2 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Process All Files
              </button>
            )}
          </div>
        </div>
      )}

      {/* Extracted Data Preview */}
      {Object.keys(extractedData).length > 0 && (
        <div className="mt-6">
          <h4 className="mb-4 font-medium text-gray-900 dark:text-white">
            Extracted Data
          </h4>
          <div className="space-y-4">
            {Object.entries(extractedData).map(([fileId, data]) => {
              const fileObj = files.find((f) => f.id === parseFloat(fileId));
              if (!data.success) return null;

              return (
                <div
                  key={fileId}
                  className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                >
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                    {fileObj?.name}
                  </h5>
                  <div className="max-h-48 overflow-y-auto rounded bg-gray-50 p-3 dark:bg-gray-900">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                      {data.extractedText?.substring(0, 500)}
                      {data.extractedText?.length > 500 ? "..." : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
