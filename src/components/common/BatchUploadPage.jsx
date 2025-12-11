import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BatchUpload } from "../../components/common/BatchUpload";
import { Upload, AlertCircle, ChevronRight } from "lucide-react";
import {
  debitNotesAPI,
  creditNotesAPI,
  deliveryOrdersAPI,
  statementsAPI,
} from "../../services/api";
import Toast from "./Toast";

const getAPI = (resourceName) => {
  switch (resourceName) {
    case "debitnotes":
      return debitNotesAPI;
    case "creditnotes":
      return creditNotesAPI;
    case "deliveryorders":
      return deliveryOrdersAPI;
    case "statements":
      return statementsAPI;
    default:
      return null;
  }
};

export const BatchUploadPage = ({ resourceName, title }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Step 1: Upload, Step 2: Forms
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [formData, setFormData] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState("success");

  const handleFilesSelected = (files) => {
    setUploadedFiles(files);
    setError(null);
  };

  const handleParse = async () => {
    if (uploadedFiles.length === 0) {
      setError("Please select files to upload");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const api = getAPI(resourceName);
      console.log("ResourceName:", resourceName, "API:", api);
      if (!api) throw new Error(`Invalid resource: ${resourceName}`);

      const fd = new FormData();
      uploadedFiles.forEach((fileObj) => {
        fd.append("file[]", fileObj.file, fileObj.name);
      });

      const result = await api.bulkParse(fd);
      console.log("Bulk Parse Result:", result);

      // Use result directly - it contains all the parsed data
      const parseData = result;
      if (!parseData) throw new Error("No data returned from parse");

      setParsedData(parseData);
      // Initialize form data array with parsed values
      const fileCount =
        typeof parseData.files === "number"
          ? parseData.files
          : uploadedFiles.length;
      console.log("File count:", fileCount, "ParseData:", parseData);

      const initialForms = Array(fileCount)
        .fill(null)
        .map((_, idx) => {
          const form = { index: idx };

          // Map parsed data arrays to each form
          Object.keys(parseData).forEach((key) => {
            if (
              Array.isArray(parseData[key]) &&
              key !== "folderNames" &&
              key !== "prev_files" &&
              key !== "data"
            ) {
              form[key] = parseData[key][idx] ?? "";
            }
          });

          // Set folder if available
          if (Array.isArray(parseData.folderNames)) {
            form.folder = parseData.folderNames[idx] ?? "";
          }

          // Determine the doc field name based on resource
          if (resourceName === "debitnotes") {
            form.dn_doc = parseData.prev_files?.[idx] ?? "";
          } else if (resourceName === "creditnotes") {
            form.cn_doc = parseData.prev_files?.[idx] ?? "";
          } else if (resourceName === "deliveryorders") {
            form.do_doc = parseData.prev_files?.[idx] ?? "";
          } else if (resourceName === "statements") {
            form.as_doc = parseData.prev_files?.[idx] ?? "";
          }

          console.log("Form at index", idx, ":", form);
          return form;
        });

      console.log("Initial forms:", initialForms);
      setFormData(initialForms);
      setStep(2);
    } catch (err) {
      console.error("Error parsing files:", err);
      setError(err.message || "Error parsing files. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async () => {
    setSubmitLoading(true);
    setError(null);

    try {
      const api = getAPI(resourceName);
      if (!api) throw new Error("Invalid resource");

      // Build payload as arrays
      const payload = {};
      const fieldNames = new Set();

      // Collect all field names from all forms
      formData.forEach((form) => {
        Object.keys(form).forEach((key) => {
          if (key !== "index") fieldNames.add(key);
        });
      });

      // Build arrays for each field
      fieldNames.forEach((field) => {
        payload[field] = formData.map((form) => form[field] || "");
      });

      const result = await api.bulkUpload(payload);

      if (result) {
        setToastType("success");
        setToastMessage(`Successfully uploaded ${formData.length} record(s)`);
        setTimeout(() => {
          navigate(`/${resourceName}/view`);
        }, 2000);
      }
    } catch (err) {
      console.error("Error submitting forms:", err);
      setToastType("error");
      setToastMessage(
        err.message || "Error submitting forms. Please try again."
      );
    } finally {
      setSubmitLoading(false);
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

      {toastMessage && (
        <Toast
          type={toastType}
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      <div className="max-w-4xl">
        {step === 1 ? (
          <div className="rounded-xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
              <h3 className="font-medium text-black dark:text-white">
                Step 1: Upload Files
              </h3>
            </div>

            <div className="p-6">
              <BatchUpload
                onFilesSelected={handleFilesSelected}
                maxFiles={50}
              />

              {error && (
                <div className="mt-4 rounded-lg p-4 flex items-start gap-3 bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{error}</p>
                  </div>
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
                  onClick={handleParse}
                  disabled={isLoading || uploadedFiles.length === 0}
                  className="flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 font-medium text-gray-100 hover:bg-opacity-90 disabled:opacity-50"
                >
                  {isLoading ? "Parsing..." : "Parse & Continue"}
                  {!isLoading && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
              <h3 className="font-medium text-black dark:text-white">
                Step 2: Review & Confirm ({formData.length} records)
              </h3>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {formData.map((form, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
                  >
                    <h4 className="font-medium text-black dark:text-white mb-4">
                      Record {idx + 1}
                    </h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {Object.entries(form)
                        .filter(([key]) => key !== "index" && key !== "folder")
                        .map(([key, value]) => (
                          <div key={`${idx}-${key}`}>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              {key}
                            </label>
                            <input
                              type="text"
                              value={value ?? ""}
                              onChange={(e) =>
                                handleFormChange(idx, key, e.target.value)
                              }
                              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setUploadedFiles([]);
                    setParsedData(null);
                    setFormData([]);
                  }}
                  className="flex justify-center rounded-lg border border-stroke px-6 py-2.5 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitLoading}
                  className="flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 font-medium text-gray-100 hover:bg-opacity-90 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  {submitLoading ? "Uploading..." : "Submit All"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
