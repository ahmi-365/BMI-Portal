import { useState, useRef, useEffect } from "react";
import { Upload, X, FileText, Settings, Loader } from "lucide-react";
import {
  extractTextFromImage,
  processPDFFile,
  processFile,
} from "../../services/ocr";

export const BatchUpload = ({
  onFilesSelected,
  maxFiles = 10,
  enableOCR = false,
  ocrSettings = {},
  onOCRComplete = null,
}) => {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState({});
  const [ocrResults, setOcrResults] = useState({});
  const [batchSettings, setBatchSettings] = useState(ocrSettings);
  const [showSettings, setShowSettings] = useState(false);
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
    const totalFiles = files.length + fileArray.length;

    if (totalFiles > maxFiles) {
      alert(
        `Maximum ${maxFiles} files allowed. You're trying to add ${totalFiles} files.`
      );
      return;
    }

    const newFileObjects = fileArray.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      file: file,
    }));

    const updatedFiles = [...files, ...newFileObjects];
    setFiles(updatedFiles);
    onFilesSelected(updatedFiles);

    // Auto-process files if OCR is enabled
    if (enableOCR) {
      newFileObjects.forEach((fileObj) => {
        setTimeout(() => processFileOCR(fileObj), 500);
      });
    }
  };

  const removeFile = (id) => {
    const updatedFiles = files.filter((f) => f.id !== id);
    setFiles(updatedFiles);
    onFilesSelected(updatedFiles);

    // Clean up OCR results for removed file
    const newResults = { ...ocrResults };
    delete newResults[id];
    setOcrResults(newResults);
  };

  const processFileOCR = async (fileObj) => {
    if (!enableOCR) return;

    setProcessing((prev) => ({ ...prev, [fileObj.id]: true }));

    try {
      // Use universal file processor that handles PDFs and images
      const result = await processFile(fileObj.file);
      setOcrResults((prev) => ({
        ...prev,
        [fileObj.id]: result,
      }));
    } catch (error) {
      setOcrResults((prev) => ({
        ...prev,
        [fileObj.id]: {
          success: false,
          fileName: fileObj.name,
          error: error.message,
        },
      }));
    } finally {
      setProcessing((prev) => ({ ...prev, [fileObj.id]: false }));
    }
  };

  const processAllFilesOCR = async () => {
    const filesToProcess = files.filter((f) => !ocrResults[f.id]);

    for (const fileObj of filesToProcess) {
      await processFileOCR(fileObj);
      // Add delay between API calls
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (onOCRComplete) {
      onOCRComplete(ocrResults);
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
          Drag and drop your files here
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
          Max {maxFiles} files • PDF, DOC, DOCX, XLS, XLSX, Images allowed
          {enableOCR && " • OCR Processing enabled"}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp"
        />
      </div>

      {/* Batch Settings */}
      {enableOCR && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
          >
            <Settings className="w-4 h-4" />
            {showSettings ? "Hide" : "Show"} Batch Settings
          </button>

          {showSettings && (
            <div className="mt-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Processing Mode
                  </label>
                  <select
                    value={batchSettings.processingMode || "standard"}
                    onChange={(e) =>
                      setBatchSettings({
                        ...batchSettings,
                        processingMode: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="standard">Standard (Text extraction)</option>
                    <option value="structured">Structured (JSON format)</option>
                    <option value="detailed">Detailed (Full analysis)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Auto-process files
                  </label>
                  <input
                    type="checkbox"
                    checked={batchSettings.autoProcess || false}
                    onChange={(e) =>
                      setBatchSettings({
                        ...batchSettings,
                        autoProcess: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300"
                  />
                  <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                    Automatically process files when uploaded
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Selected Files ({files.length}/{maxFiles})
          </h3>
          <div className="space-y-2">
            {files.map((file) => {
              const ocrResult = ocrResults[file.id];
              const isProcessing = processing[file.id];
              const isImage = !file.file.type.includes("pdf");

              return (
                <div
                  key={file.id}
                  className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>

                    {enableOCR && (
                      <button
                        type="button"
                        onClick={() => processFileOCR(file)}
                        disabled={isProcessing || !!ocrResult}
                        className="ml-2 px-2 py-1 text-xs rounded bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 flex items-center gap-1"
                      >
                        {isProcessing ? (
                          <>
                            <Loader className="w-3 h-3 animate-spin" />
                            Processing...
                          </>
                        ) : ocrResult ? (
                          "Done"
                        ) : (
                          "Process"
                        )}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* OCR Result Preview */}
                  {enableOCR && ocrResult && (
                    <div className="mt-2 rounded bg-gray-50 p-2 dark:bg-gray-700">
                      {ocrResult.success ? (
                        <div>
                          <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                            ✓ Text Extracted
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                            {ocrResult.extractedText?.substring(0, 150)}...
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-red-600 dark:text-red-400">
                          ✗ {ocrResult.error}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Process All Button */}
          {enableOCR && files.some((f) => !ocrResults[f.id]) && (
            <button
              type="button"
              onClick={processAllFilesOCR}
              className="mt-4 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 flex items-center gap-2"
            >
              <Loader className="w-4 h-4" />
              Process All Files
            </button>
          )}
        </div>
      )}
    </div>
  );
};
