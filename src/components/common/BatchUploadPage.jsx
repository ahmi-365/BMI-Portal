import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BatchUpload } from "../../components/common/BatchUpload";
import { Upload, AlertCircle, ChevronRight } from "lucide-react";
import {
  debitNotesAPI,
  creditNotesAPI,
  deliveryOrdersAPI,
  statementsAPI,
} from "../../services/api";
import { companiesAPI } from "../../services/api";
import SearchableSelect from "./SearchableSelect";
import Toast from "./Toast";

// Convert various date strings (e.g. 18.11.2025 or 18/11/2025) to yyyy-mm-dd for date inputs
const toISODate = (raw) => {
  if (!raw) return "";
  const value = String(raw).trim();
  if (!value) return "";

  const normalizeParts = (parts) => {
    if (parts.length !== 3) return null;
    const [d, m, y] = parts.map((p) => parseInt(p, 10));
    if (!d || !m || !y) return null;
    const date = new Date(y, m - 1, d);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  let date = null;
  if (value.includes(".")) date = normalizeParts(value.split("."));
  if (!date && value.includes("/")) date = normalizeParts(value.split("/"));
  if (!date) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) date = parsed;
  }
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// Extract day count from payment term text like "30 Days" and return due date (today + days)
const dueDateFromTerm = (term, baseDate = new Date()) => {
  if (!term) return "";
  const match = String(term).match(/(\d+)\s*day/i);
  const days = match ? parseInt(match[1], 10) : null;
  if (!days) return "";
  const date = new Date(baseDate);
  date.setDate(date.getDate() + days);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

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
  const [companyOptions, setCompanyOptions] = useState([]);
  const [duplicateList, setDuplicateList] = useState([]);

  // Load companies for credit/debit notes dropdowns
  useEffect(() => {
    const shouldLoadCompanies =
      resourceName === "creditnotes" || resourceName === "debitnotes";
    if (!shouldLoadCompanies) return;
    const load = async () => {
      try {
        const res = await companiesAPI.list();
        const list = res?.data ?? res ?? [];
        const opts = Array.isArray(list)
          ? list.map((c) => ({ value: c.id, label: c.company || c.name }))
          : [];
        setCompanyOptions(opts);
      } catch (e) {
        console.error("Error loading companies:", e);
        setCompanyOptions([]);
      }
    };
    load();
  }, [resourceName]);

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

          // Ensure expected fields exist for credit/debit notes
          if (resourceName === "creditnotes") {
            form.user_id = form.user_id ?? ""; // company dropdown value
            form.customer_no = form.customer_no ?? "";
            form.amount = form.amount ?? "";
            form.po_no = form.po_no ?? "";
            form.ref_no = form.ref_no ?? "";
            form.cn_no = form.cn_no ?? "";
            form.cn_date = toISODate(form.cn_date) || form.cn_date || "";
            const dueFromTermCN = dueDateFromTerm(form.payment_term);
            form.payment_term =
              dueFromTermCN || toISODate(form.payment_term) || ""; // due date
            form.remarks = form.remarks ?? "";
            form.cn_doc = form.cn_doc ?? "";
          }
          if (resourceName === "debitnotes") {
            form.user_id = form.user_id ?? ""; // company dropdown value
            form.customer_no = form.customer_no ?? "";
            form.amount = form.amount ?? "";
            form.po_no = form.po_no ?? "";
            form.ref_no = form.ref_no ?? "";
            form.dn_no = form.dn_no ?? "";
            form.dn_date = toISODate(form.dn_date) || form.dn_date || "";
            const dueFromTermDN = dueDateFromTerm(form.payment_term);
            form.payment_term =
              dueFromTermDN || toISODate(form.payment_term) || "";
            form.remarks = form.remarks ?? "";
            form.dn_doc = form.dn_doc ?? "";
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

  const handleRemoveRecord = (index) => {
    setFormData((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setSubmitLoading(true);
    setError(null);
    setToastMessage(null);

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
        payload[field] = formData.map((form) =>
          form[field] === undefined || form[field] === null ? "" : form[field]
        );
      });

      const result = await api.bulkUpload(payload);

      // Handle backend-declared errors (e.g., duplicate invoices)
      const status = result?.status?.toLowerCase?.();
      const duplicateInvoices = result?.duplicate_invoices;
      if (status === "error" || status === "fail") {
        const dupList = Array.isArray(duplicateInvoices)
          ? duplicateInvoices.map((d) => String(d))
          : [];
        setDuplicateList(dupList);
        setError(result?.message || "Upload failed.");
        setToastMessage(null);
        return;
      }

      if (result) {
        setDuplicateList([]);
        setToastType("success");
        setToastMessage(`Successfully uploaded ${formData.length} record(s)`);
        // Clear form state before navigating
        setUploadedFiles([]);
        setParsedData(null);
        setFormData([]);
        setDuplicateList([]);
        setError(null);
        setStep(1);
        setTimeout(() => {
          navigate(`/${resourceName}`);
        }, 2000);
        window.location.reload();
      }
    } catch (err) {
      console.error("Error submitting forms:", err);
      // Attempt to extract structured error from thrown text (e.g., API Error: 422 {json})
      const msg = String(err?.message || "");
      const jsonStart = msg.indexOf("{");
      const jsonEnd = msg.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        try {
          const json = JSON.parse(msg.slice(jsonStart, jsonEnd + 1));
          const dupList = Array.isArray(json?.duplicate_invoices)
            ? json.duplicate_invoices.map((d) => String(d))
            : [];
          setDuplicateList(dupList);
          setError(json?.message || "Upload failed.");
          setToastMessage(null);
          return;
        } catch (_) {
          // fall through to generic handling
        }
      }
      setToastMessage(null);
      setError("Error submitting forms. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="p-6 animate-fadeIn">
      {/* Enhanced Header with Progress */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent dark:from-brand-400 dark:to-brand-300">
              Batch Upload - {title}
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Upload and process multiple documents at once
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="mt-6 flex items-center justify-center">
          <div className="flex items-center gap-4 w-full max-w-md">
            {/* Step 1 */}
            <div className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all duration-300 ${
                  step === 1
                    ? "bg-brand-500 text-white shadow-lg scale-110"
                    : "bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400"
                }`}
              >
                {step > 1 ? "✓" : "1"}
              </div>
              <div className="ml-3 hidden sm:block">
                <p
                  className={`text-sm font-medium ${
                    step === 1
                      ? "text-brand-600 dark:text-brand-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  Upload Files
                </p>
              </div>
            </div>

            {/* Connector */}
            <div
              className={`h-1 flex-1 rounded transition-all duration-500 ${
                step === 2 ? "bg-brand-500" : "bg-gray-200 dark:bg-gray-700"
              }`}
            />

            {/* Step 2 */}
            <div className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all duration-300 ${
                  step === 2
                    ? "bg-brand-500 text-white shadow-lg scale-110"
                    : "bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                }`}
              >
                2
              </div>
              <div className="ml-3 hidden sm:block">
                <p
                  className={`text-sm font-medium ${
                    step === 2
                      ? "text-brand-600 dark:text-brand-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  Review & Submit
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toastMessage && toastType === "success" && (
        <Toast
          type={toastType}
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      <div className="max-w-5xl mx-auto">
        {step === 1 ? (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
            <div className="bg-gradient-to-r from-brand-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 border-b border-gray-200 px-6 py-5 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-500 rounded-lg">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                    Upload Your Files
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    Select up to 50 files to process
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <BatchUpload
                onFilesSelected={handleFilesSelected}
                maxFiles={50}
              />

              {error && (
                <div className="mt-6 rounded-xl p-4 flex items-start gap-3 bg-red-50 border-l-4 border-red-500 text-red-800 dark:bg-red-900/20 dark:text-red-300 animate-slideIn">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <p className="font-semibold text-sm">Error</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </div>
              )}

              {uploadedFiles.length > 0 && (
                <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200 dark:bg-green-900/10 dark:border-green-800 animate-slideIn">
                  <p className="text-sm text-green-800 dark:text-green-300">
                    ✓ {uploadedFiles.length} file
                    {uploadedFiles.length > 1 ? "s" : ""} selected and ready to
                    process
                  </p>
                </div>
              )}

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/${resourceName}`)}
                  className="px-6 py-3 rounded-xl border-2 border-gray-300 font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:border-gray-500 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleParse}
                  disabled={isLoading || uploadedFiles.length === 0}
                  className="group px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 font-medium text-white shadow-lg hover:shadow-xl hover:from-brand-700 hover:to-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      Parse & Continue
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 overflow-hidden animate-slideIn">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800 border-b border-gray-200 px-6 py-5 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                      Review & Confirm
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      {formData.length} record{formData.length > 1 ? "s" : ""}{" "}
                      parsed successfully
                    </p>
                  </div>
                </div>
                <div className="px-4 py-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                  <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                    {formData.length} / {formData.length}
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="mx-6 mt-4 rounded-xl p-4 flex items-start gap-3 bg-red-50 border-l-4 border-red-500 text-red-800 dark:bg-red-900/20 dark:text-red-300 animate-slideIn">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <p className="font-semibold text-sm">Error</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            <div className="p-8">
              <div className="space-y-5 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {formData.map((form, idx) =>
                  (() => {
                    const recordNumber =
                      resourceName === "creditnotes"
                        ? form.cn_no
                        : resourceName === "debitnotes"
                        ? form.dn_no
                        : null;
                    const isDuplicate = recordNumber
                      ? duplicateList.includes(String(recordNumber))
                      : false;
                    return (
                      <div
                        key={idx}
                        className={`group rounded-xl border-2 p-6 hover:shadow-lg transition-all duration-300 animate-fadeIn ${
                          isDuplicate
                            ? "border-red-400 bg-red-50/60 dark:border-red-700 dark:bg-red-900/20"
                            : "border-gray-200 hover:border-brand-300 dark:border-gray-700 dark:hover:border-brand-600"
                        }`}
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="flex items-center justify-between mb-5">
                          <h4 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 text-sm font-bold">
                              {idx + 1}
                            </span>
                            Record {idx + 1}
                          </h4>
                          <div className="flex items-center gap-2">
                            {isDuplicate ? (
                              <div className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium">
                                Duplicate invoice: {recordNumber}
                              </div>
                            ) : (
                              <div className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                                Ready
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveRecord(idx)}
                              className="text-xs font-semibold px-3 py-1 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800 transition"
                            >
                              Clear record
                            </button>
                          </div>
                        </div>
                        {isDuplicate && (
                          <div className="mb-4 text-sm text-red-700 dark:text-red-300">
                            This record matches a duplicate invoice returned by
                            the server. Clear it or adjust the number before
                            re-submitting.
                          </div>
                        )}
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                          {resourceName === "creditnotes" ? (
                            <>
                              {/* Company (searchable) */}
                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  Company Name
                                </label>
                                <SearchableSelect
                                  id={`company-${idx}`}
                                  options={companyOptions}
                                  value={form.user_id || null}
                                  onChange={(v) =>
                                    handleFormChange(idx, "user_id", v)
                                  }
                                  placeholder="Select a company..."
                                />
                              </div>
                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  Customer No.
                                </label>
                                <input
                                  type="text"
                                  value={form.customer_no ?? ""}
                                  onChange={(e) =>
                                    handleFormChange(
                                      idx,
                                      "customer_no",
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500"
                                />
                              </div>
                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  Amount (MYR)
                                </label>
                                <input
                                  type="number"
                                  value={form.amount ?? ""}
                                  onChange={(e) =>
                                    handleFormChange(
                                      idx,
                                      "amount",
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500"
                                />
                              </div>
                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  Customer PO No.
                                </label>
                                <input
                                  type="text"
                                  value={form.po_no ?? ""}
                                  onChange={(e) =>
                                    handleFormChange(
                                      idx,
                                      "po_no",
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500"
                                />
                              </div>
                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  Reference No.
                                </label>
                                <input
                                  type="text"
                                  value={form.ref_no ?? ""}
                                  onChange={(e) =>
                                    handleFormChange(
                                      idx,
                                      "ref_no",
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500"
                                />
                              </div>
                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  CN No.
                                </label>
                                <input
                                  type="text"
                                  value={form.cn_no ?? ""}
                                  onChange={(e) =>
                                    handleFormChange(
                                      idx,
                                      "cn_no",
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500"
                                />
                              </div>
                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  CN Date
                                </label>
                                <input
                                  type="date"
                                  value={form.cn_date ?? ""}
                                  onChange={(e) =>
                                    handleFormChange(
                                      idx,
                                      "cn_date",
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500"
                                />
                              </div>
                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  CN Document
                                </label>
                                <input
                                  type="text"
                                  value={form.cn_doc ?? ""}
                                  onChange={(e) =>
                                    handleFormChange(
                                      idx,
                                      "cn_doc",
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 dark:border-gray-600 dark:bg-gray-700/40 dark:text-white"
                                  placeholder="Auto from parsed file"
                                />
                              </div>
                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  Due Date
                                </label>
                                <input
                                  type="date"
                                  value={form.payment_term ?? ""}
                                  onChange={(e) =>
                                    handleFormChange(
                                      idx,
                                      "payment_term",
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500"
                                />
                              </div>
                              <div className="relative md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  Remarks
                                </label>
                                <textarea
                                  value={form.remarks ?? ""}
                                  onChange={(e) =>
                                    handleFormChange(
                                      idx,
                                      "remarks",
                                      e.target.value
                                    )
                                  }
                                  rows={3}
                                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500"
                                />
                              </div>
                            </>
                          ) : resourceName === "debitnotes" ? (
                            <>
                              {/* Company (searchable) */}
                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  Company Name
                                </label>
                                <SearchableSelect
                                  id={`company-${idx}`}
                                  options={companyOptions}
                                  value={form.user_id || null}
                                  onChange={(v) =>
                                    handleFormChange(idx, "user_id", v)
                                  }
                                  placeholder="Select a company..."
                                />
                              </div>
                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  Customer No.
                                </label>
                                <input
                                  type="text"
                                  value={form.customer_no ?? ""}
                                  onChange={(e) =>
                                    handleFormChange(
                                      idx,
                                      "customer_no",
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500"
                                />
                              </div>
                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  Amount (MYR)
                                </label>
                                <input
                                  type="number"
                                  value={form.amount ?? ""}
                                  onChange={(e) =>
                                    handleFormChange(
                                      idx,
                                      "amount",
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500"
                                />
                              </div>
                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  Customer PO No.
                                </label>
                                <input
                                  type="text"
                                  value={form.po_no ?? ""}
                                  onChange={(e) =>
                                    handleFormChange(
                                      idx,
                                      "po_no",
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500"
                                />
                              </div>
                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  Reference No.
                                </label>
                                <input
                                  type="text"
                                  value={form.ref_no ?? ""}
                                  onChange={(e) =>
                                    handleFormChange(
                                      idx,
                                      "ref_no",
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500"
                                />
                              </div>
                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  DN No.
                                </label>
                                <input
                                  type="text"
                                  value={form.dn_no ?? ""}
                                  onChange={(e) =>
                                    handleFormChange(
                                      idx,
                                      "dn_no",
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500"
                                />
                              </div>
                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  DN Date
                                </label>
                                <input
                                  type="date"
                                  value={form.dn_date ?? ""}
                                  onChange={(e) =>
                                    handleFormChange(
                                      idx,
                                      "dn_date",
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500"
                                />
                              </div>
                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  DN Document
                                </label>
                                <input
                                  type="text"
                                  value={form.dn_doc ?? ""}
                                  onChange={(e) =>
                                    handleFormChange(
                                      idx,
                                      "dn_doc",
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 dark:border-gray-600 dark:bg-gray-700/40 dark:text-white"
                                  placeholder="Auto from parsed file"
                                />
                              </div>
                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  Due Date
                                </label>
                                <input
                                  type="date"
                                  value={form.payment_term ?? ""}
                                  onChange={(e) =>
                                    handleFormChange(
                                      idx,
                                      "payment_term",
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500"
                                />
                              </div>
                              <div className="relative md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  Remarks
                                </label>
                                <textarea
                                  value={form.remarks ?? ""}
                                  onChange={(e) =>
                                    handleFormChange(
                                      idx,
                                      "remarks",
                                      e.target.value
                                    )
                                  }
                                  rows={3}
                                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500"
                                />
                              </div>
                            </>
                          ) : (
                            // Default: render all parsed keys as text inputs
                            Object.entries(form)
                              .filter(
                                ([key]) => key !== "index" && key !== "folder"
                              )
                              .map(([key, value]) => (
                                <div key={`${idx}-${key}`} className="relative">
                                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                    {key.replace(/_/g, " ")}
                                  </label>
                                  <input
                                    type="text"
                                    value={value ?? ""}
                                    onChange={(e) =>
                                      handleFormChange(idx, key, e.target.value)
                                    }
                                    className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500"
                                    placeholder={`Enter ${key.replace(
                                      /_/g,
                                      " "
                                    )}`}
                                  />
                                </div>
                              ))
                          )}
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setUploadedFiles([]);
                    setParsedData(null);
                    setFormData([]);
                  }}
                  className="px-6 py-3 rounded-xl border-2 border-gray-300 font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:border-gray-500 transition-all duration-200 flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitLoading}
                  className="group px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 font-semibold text-white shadow-lg hover:shadow-xl hover:from-green-700 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                >
                  {submitLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Uploading {formData.length} records...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      Submit All ({formData.length})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
