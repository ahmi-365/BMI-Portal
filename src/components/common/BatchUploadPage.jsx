import { AlertCircle, ChevronRight, Upload } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { BatchUpload } from "../../components/common/BatchUpload";
import {
  companiesAPI,
  creditNotesAPI,
  debitNotesAPI,
  deliveryOrdersAPI,
  invoicesAPI,
  ppisAPI,
  statementsAPI,
} from "../../services/api";
import { extractDoNoFromPdf } from "../../services/ocrService";
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

// Extract numeric amount from mixed text (e.g., "Total Amount Malaysian Ringgit 86.58")
const extractAmount = (raw) => {
  if (raw === undefined || raw === null) return "";
  if (typeof raw === "number") return String(raw);
  const str = String(raw);
  const match = str.match(/([0-9]+(?:[.,][0-9]+)?)/);
  if (!match) return str.trim();
  const num = match[1].replace(",", "");
  return num;
};

const getAPI = (resourceName) => {
  switch (resourceName) {
    case "debitnotes":
      return debitNotesAPI;
    case "creditnotes":
      return creditNotesAPI;
    case "invoices":
      return invoicesAPI;
    case "deliveryorders":
      return deliveryOrdersAPI;
    case "statements":
      return statementsAPI;
    case "ppis":
      return ppisAPI;
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
  const [companyMapByCustomer, setCompanyMapByCustomer] = useState({});
  const [duplicateList, setDuplicateList] = useState([]);
  const [invoiceOptions, setInvoiceOptions] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const resetValidation = () => {
    setSubmitted(false);
    setValidationErrors({});
  };

  const isFieldEmpty = (value) => {
    if (value === 0) return false;
    if (value === false) return false;
    return value === undefined || value === null || String(value).trim() === "";
  };

  const fieldHasError = (index, field) =>
    submitted && Array.isArray(validationErrors[index])
      ? validationErrors[index].includes(field)
      : false;

  const errorClass = (index, field) =>
    fieldHasError(index, field)
      ? "border-red-500 focus:border-red-500 focus:ring-red-100 dark:border-red-500 dark:focus:border-red-400 dark:focus:ring-red-800/40"
      : "";

  // Load companies for credit/debit notes/statements dropdowns
  useEffect(() => {
    const shouldLoadCompanies =
      resourceName === "creditnotes" ||
      resourceName === "debitnotes" ||
      resourceName === "statements" ||
      resourceName === "invoices" ||
      resourceName === "ppis";
    if (!shouldLoadCompanies) return;
    const load = async () => {
      try {
        console.debug("BatchUploadPage: attempting to load companies for", resourceName);
        const res = await companiesAPI.list();
        console.debug("BatchUploadPage: companiesAPI.list() response:", res);
        const list = res?.data ?? res ?? [];
        const opts = Array.isArray(list)
          ? list.map((c) => ({ value: c.id, label: c.company || c.name }))
          : [];
        setCompanyOptions(opts);
        // Build map from normalized customer_no -> company id for auto-selection
        const map = {};
        if (Array.isArray(list)) {
          list.forEach((c) => {
            const key = c?.customer_no;
            if (key !== undefined && key !== null && String(key).trim() !== "") {
              map[String(key).trim().toLowerCase()] = c.id;
            }
          });
        }
        setCompanyMapByCustomer(map);
      } catch (e) {
        console.error("Error loading companies:", e);
        // Log responseData if available to help debugging network vs parse errors
        try {
          console.debug("Company load error responseData:", e?.responseData || e?.response || null);
        } catch (_) {}
        setCompanyOptions([]);
      }
    };
    load();
  }, [resourceName]);

  // When we have parsed formData and company map, auto-fill user_id for records
  useEffect(() => {
    try {
      if (
        !companyMapByCustomer ||
        Object.keys(companyMapByCustomer).length === 0 ||
        !Array.isArray(formData) ||
        formData.length === 0
      ) {
        return;
      }

      let changed = false;
      const next = formData.map((f) => {
        const cust = f?.customer_no;
        if (!cust) return f;
        const key = String(cust ?? "").trim().toLowerCase();
        const matched = companyMapByCustomer[key];
        if (matched && (!f.user_id || f.user_id === "")) {
          changed = true;
          console.debug(
            "BatchUploadPage: auto-matching customer_no",
            cust,
            "-> company id",
            matched
          );
          return { ...f, user_id: matched };
        }
        return f;
      });

      if (changed) {
        setFormData(next);
      }
    } catch (err) {
      console.error("Auto-fill company by customer_no error:", err);
    }
  }, [companyMapByCustomer, formData]);

  // Load invoices for delivery orders dropdown
  const [invoiceData, setInvoiceData] = useState({});
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState("");

  const loadInvoices = useCallback(async (search = "") => {
    try {
      const res = await invoicesAPI.allInvoices(search);
      const list = res?.data ?? res ?? [];
      const dataMap = {};
      const opts = Array.isArray(list)
        ? list.map((inv) => {
            dataMap[inv.id] = inv;
            return {
              value: inv.id,
              label: inv.do_no || `DO #${inv.id}`,
            };
          })
        : [];
      setInvoiceData(dataMap);
      setInvoiceOptions(opts);
    } catch (e) {
      console.error("Error loading invoices:", e);
      setInvoiceOptions([]);
      setInvoiceData({});
    }
  }, []);

  useEffect(() => {
    if (resourceName !== "deliveryorders") return;
    loadInvoices();
  }, [resourceName, loadInvoices]);

  // Debounced invoice search
  useEffect(() => {
    if (resourceName !== "deliveryorders") return;
    const timeout = setTimeout(() => {
      loadInvoices(invoiceSearchQuery);
    }, 300);
    return () => clearTimeout(timeout);
  }, [invoiceSearchQuery, resourceName, loadInvoices]);

  const handleFilesSelected = (files) => {
    setUploadedFiles(files);
    setError(null);
    resetValidation();
  };

  const handleParse = async () => {
    if (uploadedFiles.length === 0) {
      setError("Please select files to upload");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
    // ... inside handleParse ...

      // Delivery orders: Run OCR and Search API for Invoice
      if (resourceName === "deliveryorders") {
        setIsLoading(true);
        console.log("Starting OCR & API Search...");

        const manualForms = await Promise.all(
          uploadedFiles.map(async (fileObj, idx) => {
            const file = fileObj.file || fileObj;
            let extractedDoNo = "";
            let matchedInvoiceId = "";
            let matchedInvoiceNo = "";
            let remarkText = "";

            // 1. Run OCR if PDF
            if (file.type === "application/pdf") {
              try {
                console.log(`[File ${idx + 1}] Running OCR...`);
                extractedDoNo = await extractDoNoFromPdf(file);
              } catch (e) {
                console.error("OCR Error:", e);
              }
            }

            // 2. If OCR found a number, Ask the API to find the invoice
            if (extractedDoNo) {
              const cleanDoNo = String(extractedDoNo).trim();
              console.log(`[File ${idx + 1}] Searching API for DO: ${cleanDoNo}`);

              try {
                // Call API explicitly for this DO number to bypass pagination issues
                const res = await invoicesAPI.allInvoices(cleanDoNo);
                const results = res?.data ?? res ?? [];

                // Find exact match in results
                const foundInvoice = results.find(inv => 
                  String(inv.do_no || "").trim() === cleanDoNo
                );

                if (foundInvoice) {
                  console.log(`[File ${idx + 1}]   Match Found: Invoice #${foundInvoice.invoice_no}`);
                  matchedInvoiceId = foundInvoice.id;
                  matchedInvoiceNo = foundInvoice.invoiceId || foundInvoice.invoice_no;
                  remarkText = "Auto-matched via OCR";

                  // OPTIONAL: Add this invoice to your local list so the dropdown shows it correctly
                  setInvoiceOptions(prev => {
                    const exists = prev.some(opt => opt.value === foundInvoice.id);
                    if (exists) return prev;
                    return [...prev, { value: foundInvoice.id, label: foundInvoice.do_no || foundInvoice.invoice_no }];
                  });
                  setInvoiceData(prev => ({ ...prev, [foundInvoice.id]: foundInvoice }));

                } else {
                  remarkText = ``;
                }
              } catch (err) {
                console.error("API Search Error:", err);
                remarkText = `OCR found DO# ${cleanDoNo} (Search failed)`;
              }
            }

            return {
              index: idx,
              invoice_id: matchedInvoiceId, 
              invoice_no: matchedInvoiceNo, 
              do_no: extractedDoNo || "", 
              do_doc: file.name,
              remarks: remarkText,
              _file: file 
            };
          })
        );

        setFormData(manualForms);
        setStep(2);
        setIsLoading(false);
        return;
      }
      const api = getAPI(resourceName);
      console.log("ResourceName:", resourceName, "API:", api);
      if (!api) throw new Error(`Invalid resource: ${resourceName}`);
      if (typeof api.bulkParse !== "function") {
        setIsLoading(false);
        setError(`Bulk upload is not supported for resource: ${resourceName}`);
        return;
      }

      const fd = new FormData();
      uploadedFiles.forEach((fileObj) => {
        fd.append("file[]", fileObj.file, fileObj.name);
      });

      const result = await api.bulkParse(fd);
      console.log("Bulk Parse Result:", result);

      // Extract data from result - handle both {data: {...}} and direct {...} formats
      // Prefer the envelope object when result.data is just the file array
      let parseData = result?.data ?? result;
      const hasEnvelopeProps =
        result &&
        typeof result === "object" &&
        !Array.isArray(result) &&
        (result.folderNames ||
          result.prev_files ||
          result.dn_no ||
          result.customer_no ||
          result.po_no);
      if (Array.isArray(parseData) && hasEnvelopeProps) {
        parseData = result;
      }
      if (!parseData) throw new Error("No data returned from parse");

      setParsedData(parseData);
      // Initialize form data array with parsed values
      const fileCount =
        typeof parseData.files === "number"
          ? parseData.files
          : Array.isArray(parseData.files)
          ? parseData.files.length
          : uploadedFiles.length;
      console.log("File count:", fileCount, "ParseData:", parseData);

      const initialForms = Array(fileCount)
        .fill(null)
        .map((_, idx) => {
          const form = { index: idx };

          // Map parsed data into each form; allow both array and scalar shapes from backend
          Object.keys(parseData).forEach((key) => {
            if (key === "folderNames" || key === "prev_files" || key === "data")
              return;

            const source = parseData[key];
            if (Array.isArray(source)) {
              form[key] = source[idx] ?? "";
            } else if (source !== undefined && source !== null) {
              form[key] = source;
            }
          });

          // Set folder if available
          if (Array.isArray(parseData.folderNames)) {
            form.folder = parseData.folderNames[idx] ?? "";
          }

          // Determine the doc field name based on resource
          if (resourceName === "debitnotes") {
            form.file = parseData.prev_files?.[idx] ?? "";
          } else if (resourceName === "creditnotes") {
            form.cn_doc = parseData.prev_files?.[idx] ?? "";
          } else if (resourceName === "deliveryorders") {
            form.do_doc = parseData.prev_files?.[idx] ?? "";
          } else if (resourceName === "statements") {
            form.as_doc =
              parseData.prev_files?.[idx] ?? parseData.data?.[idx] ?? "";
          } else if (resourceName === "invoices") {
            form.file =
              parseData.files?.[idx] ?? parseData.prev_files?.[idx] ?? "";
          } else if (resourceName === "ppis") {
            form.ppi_doc =
              parseData.prev_files?.[idx] ??
              parseData.files?.[idx] ??
              parseData.data?.[idx] ??
              "";
          }

          // Ensure expected fields exist for credit/debit notes
          if (resourceName === "creditnotes") {
            form.user_id = form.user_id ?? ""; // company dropdown value
            form.customer_no = form.customer_no ?? "";
            form.amount = extractAmount(form.amount ?? "");
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
          if (resourceName === "ppis") {
            // Always allow company selection (user_id)
            form.user_id = form.user_id ?? "";
            form.customer_no = parseData.customer_no?.[idx] ?? "";
            form.amount = extractAmount(parseData.amount?.[idx] ?? "");
            form.cn_no = parseData.cn_no?.[idx] ?? "";
            // Map cn_date from backend to ppi_date for the form (as yyyy-mm-dd)
            form.ppi_date = toISODate(
              parseData.ppi_date?.[idx] ?? parseData.cn_date?.[idx] ?? ""
            );
            form.payment_term = parseData.payment_term?.[idx] ?? "";
            // Show only the numeric part of ppi_percentage, remove percent sign and whitespace
            let rawPpiPercentage = parseData.ppi_percentage?.[idx] ?? "";
            rawPpiPercentage = String(rawPpiPercentage)
              .replace(/\s*%\s*$/, "")
              .trim();
            const matchPpi = rawPpiPercentage.match(/([0-9]+(?:\.[0-9]+)?)/);
            form.ppi_percentage = matchPpi ? matchPpi[1] : "";
            form.remarks = form.remarks ?? "";
            form.ppi_doc =
              parseData.ppi_doc?.[idx] ?? parseData.data?.[idx] ?? "";
            form.folder = parseData.folderNames?.[idx] ?? "";
          }
          if (resourceName === "debitnotes") {
            console.log(
              "Debit note form BEFORE mapping:",
              JSON.stringify(form, null, 2)
            );

            const pickValue = (key) => {
              const val = parseData?.[key];
              if (Array.isArray(val)) return val[idx] ?? "";
              return val ?? "";
            };

            const pickValueStrict = (key, fallback) => {
              const val = parseData?.[key];
              if (Array.isArray(val)) {
                const v = val[idx];
                return v === undefined || v === null ? fallback : v;
              }
              return val === undefined || val === null ? fallback : val;
            };

            const parsedDoc =
              pickValue("prev_files") ||
              pickValue("data") ||
              form.file ||
              form.dn_doc ||
              "";

            form.user_id = pickValueStrict("user_id", form.user_id ?? ""); // company dropdown value
            form.customer_no = pickValueStrict(
              "customer_no",
              form.customer_no ?? ""
            );
            const rawAmount = pickValueStrict("amount", form.amount ?? "");
            form.amount = extractAmount(rawAmount);
            form.po_no = pickValueStrict("po_no", form.po_no ?? "");
            form.ref_no = pickValueStrict("ref_no", form.ref_no ?? "");
            form.dn_no = pickValueStrict("dn_no", form.dn_no ?? "");
            const rawDnDate = pickValueStrict("dn_date", form.dn_date ?? "");
            form.dn_date = toISODate(rawDnDate) || rawDnDate || "";
            const rawTerm = pickValueStrict(
              "payment_term",
              form.payment_term ?? ""
            );
            const dueFromTermDN = dueDateFromTerm(rawTerm);
            form.payment_term = dueFromTermDN || toISODate(rawTerm) || "";
            form.remarks = pickValueStrict("remarks", form.remarks ?? "");
            form.file = parsedDoc || "";
            form.dn_doc = parsedDoc || "";
            console.log(
              "Debit note form AFTER mapping:",
              JSON.stringify(form, null, 2)
            );
          }
          if (resourceName === "invoices") {
            // Map invoice_no from backend to invoiceId for frontend
            form.invoiceId = form.invoice_no ?? form.invoiceId ?? "";
            form.user_id = form.user_id ?? "";
            form.customer_no = form.customer_no ?? "";
            form.po_no = form.po_no ?? "";
            form.do_no = form.do_no ?? "";
            form.date = dueDateFromTerm(form.payment_terms, new Date());
            form.invoice_date =
              toISODate(form.invoice_date) || form.invoice_date || "";
            form.amount = extractAmount(String(form.amount ?? ""));
            form.remarks = form.remarks ?? "";
            form.folder = form.folder ?? "";
            form.file = form.file ?? "";
          }
          if (resourceName === "statements") {
            form.user_id = form.user_id ?? ""; // company dropdown value
            form.customer_no = form.customer_no ?? "";
            form.as_doc =
              form.as_doc ??
              parseData.data?.[idx] ??
              parseData.prev_files?.[idx] ??
              "";
            const stmtDate = form.as_date || form.statement_date;
            form.as_date = toISODate(stmtDate) || stmtDate || "";
            form.remarks = form.remarks ?? "";
          }

          console.log("Form at index", idx, ":", form);
          return form;
        });

      console.log("Initial forms:", initialForms);
      setFormData(initialForms);
      resetValidation();
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

    // Clear validation error for this field when it becomes non-empty
    setValidationErrors((prev) => {
      if (!submitted) return prev;
      const next = { ...prev };
      if (!isFieldEmpty(value)) {
        const remaining = (next[index] || []).filter((f) => f !== field);
        if (remaining.length) next[index] = remaining;
        else delete next[index];
      }
      return next;
    });
  };

  // When user blurs the Extracted DO No input, try to find matching invoice
  const handleDoNoBlur = async (index, value) => {
    try {
      const clean = String(value ?? "").trim();
      if (!clean) {
        // Clear invoice match if user cleared the DO No
        handleFormChange(index, "invoice_id", "");
        handleFormChange(index, "invoice_no", "");
        handleFormChange(index, "remarks", "No invoice found for this DO No");
        return;
      }
      // Try API search; be flexible matching on do_no, invoice_no or invoiceId
      const res = await invoicesAPI.allInvoices(clean);
      const list = res?.data ?? res ?? [];

      const normalize = (v) => (v === undefined || v === null ? "" : String(v).trim());
      const found = Array.isArray(list)
        ? list.find((inv) => {
            const d = normalize(inv.do_no);
            const ino = normalize(inv.invoice_no || inv.invoiceId);
            // exact match first
            if (d === clean || ino === clean) return true;
            // partial contains fallback
            if (d.includes(clean) || ino.includes(clean) || clean.includes(d) || clean.includes(ino)) return true;
            return false;
          })
        : null;

      if (found) {
        handleFormChange(index, "invoice_id", found.id);
        handleFormChange(index, "invoice_no", found.invoiceId || found.invoice_no || "");
        handleFormChange(index, "remarks", "");
        // Ensure this invoice is present in local invoiceData/options
        setInvoiceData((prev) => ({ ...prev, [found.id]: found }));
        setInvoiceOptions((prev) => {
          const exists = prev.some((p) => p.value === found.id);
          if (exists) return prev;
          return [...prev, { value: found.id, label: found.do_no || found.invoice_no || `#${found.id}` }];
        });
      } else {
        handleFormChange(index, "invoice_id", "");
        handleFormChange(index, "invoice_no", "");
        handleFormChange(index, "remarks", "No invoice found for this DO No");
      }
    } catch (err) {
      console.error("DO No blur search failed:", err);
      handleFormChange(index, "invoice_id", "");
      handleFormChange(index, "invoice_no", "");
      handleFormChange(index, "remarks", "No invoice found for this DO No");
    }
  };

  // Normalize backend validation messages for delivery orders
  const normalizeDoErrorMessage = (msg) => {
    if (!msg) return "";
    const cleaned = String(msg).replace(/delivery_orders\.\d+\.do_no/gi, "DO number");
    if (/The given data was invalid\.?/i.test(cleaned)) {
      return "The selected DO number is invalid.";
    }
    return cleaned;
  };

  // Parse validation errors into per-row field map so we can highlight the record card
  const parseValidationErrors = (errorsObj) => {
    const validationMap = {};
    const messages = [];

    if (!errorsObj || typeof errorsObj !== "object") {
      return { validationMap, messages };
    }

    Object.entries(errorsObj).forEach(([field, msgs]) => {
      const match = field.match(/delivery_orders\.(\d+)\.(.+)/);
      if (match) {
        const idx = parseInt(match[1], 10);
        const fieldName = match[2];
        if (!Number.isNaN(idx)) {
          validationMap[idx] = validationMap[idx] || [];
          validationMap[idx].push(fieldName);
        }
      } else {
        const baseField = field.split(".")[0];
        if (baseField) {
          validationMap[0] = validationMap[0] || [];
          validationMap[0].push(baseField);
        }
      }

      if (Array.isArray(msgs)) {
        msgs.forEach((m) => messages.push(normalizeDoErrorMessage(m)));
      } else if (typeof msgs === "string") {
        messages.push(normalizeDoErrorMessage(msgs));
      }
    });

    return { validationMap, messages };
  };

  const handleRemoveRecord = (index) => {
    setFormData((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    setSubmitLoading(true);
    setError(null);
    setToastMessage(null);

    // Validate required fields
    const errors = {};
    formData.forEach((form, idx) => {
      let missing = [];
      if (resourceName === "ppis") {
        const required = [
          "user_id",
          "cn_no", // ADDED: Required by backend validator
          "ppi_date",
          "payment_term",
          "amount",
          "ppi_percentage", // ADDED: Required by backend validator
          "ppi_doc", // ADDED: Required by backend validator
          "folder", // ADDED: Required by backend validator
        ];
        missing = required.filter((f) => isFieldEmpty(form[f]));
      } else if (resourceName === "deliveryorders") {
        // Delivery orders must have a DO number and document; invoice match is handled server-side
        const required = ["do_no", "do_doc"];
        missing = required.filter((f) => isFieldEmpty(form[f]));
      } else {
        missing = Object.entries(form).reduce((acc, [key, value]) => {
          if (key === "index" || key === "folder" || key === "remarks")
            return acc;
          if (isFieldEmpty(value)) acc.push(key);
          return acc;
        }, []);
      }
      if (missing.length) errors[idx] = missing;
    });

    if (Object.keys(errors).length) {
      setValidationErrors(errors);
      setSubmitLoading(false);
      setError("Please fill in all required fields.");
      return;
    }

    setValidationErrors({});

    try {
      const api = getAPI(resourceName);
      if (!api) throw new Error("Invalid resource");
      // Delivery Orders: build multipart FormData with delivery_orders array of objects
      if (resourceName === "deliveryorders") {
        const fd = new FormData();
        // Include `do_no` in payload but do NOT send invoice_id or invoice_no to backend.
        // Send delivery order document and remarks as before.
        for (let idx = 0; idx < formData.length; idx++) {
          const form = formData[idx];
          try {
            // do_no (send extracted/edited DO number)
            fd.append(
              `delivery_orders[${idx}][do_no]`,
              String(form.do_no || "")
            );
            // remarks
            fd.append(
              `delivery_orders[${idx}][remarks]`,
              String(form.remarks || "")
            );
            // do_doc file: use original uploaded file if available
            const fileObj = form._file || uploadedFiles[idx]?.file || uploadedFiles[idx];
            if (fileObj instanceof File) {
              fd.append(`delivery_orders[${idx}][do_doc]`, fileObj, fileObj.name);
            } else {
              fd.append(`delivery_orders[${idx}][do_doc]`, String(form.do_doc || ""));
            }
          } catch (err) {
            console.error(`Error preparing delivery order row ${idx}:`, err);
          }
        }
        

        // Log FormData contents for debugging before sending
        try {
          console.log("Sending deliveryorders FormData:");
          for (const pair of fd.entries()) {
            const [key, value] = pair;
            if (value instanceof File) {
              console.log(key, "= File", value.name, value.type, value.size);
            } else {
              console.log(key, "=", value);
            }
          }
        } catch (e) {
          console.log("Failed to enumerate FormData for logging:", e);
        }

        const result = await api.bulkUpload(fd);

        const status = result?.status?.toLowerCase?.();
        if (status === "error" || status === "fail") {
          // Parse validation errors for delivery orders
          const { validationMap, messages: normalizedMessages } =
            parseValidationErrors(result?.errors);

          // Set validation errors to highlight the correct record card and fields
          if (Object.keys(validationMap).length > 0) {
            setValidationErrors(validationMap);
            setSubmitted(true);
          }

          // Build friendly error message
          const messageList = normalizedMessages.filter(Boolean);
          if (!messageList.length && result?.errors) {
            messageList.push("The selected DO number is invalid.");
          }
          const normalizedText = messageList.length
            ? Array.from(new Set(messageList)).join("\n")
            : "";
          const backendMessage = result?.message || "Upload failed.";
          const fullErrorMessage = normalizedText
            ? normalizedText
            : /The given data was invalid\.?/i.test(backendMessage)
            ? "The selected DO number is invalid."
            : backendMessage;

          setError(fullErrorMessage);
          setToastMessage(null);
          return;
        }

        if (result) {
          setDuplicateList([]);
          setUploadedFiles([]);
          setParsedData(null);
          setFormData([]);
          setError(null);
          setStep(1);
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: `Successfully uploaded ${formData.length} record(s)`,
            timer: 2000,
            showConfirmButton: false,
          }).then(() => {
            navigate(`/${resourceName}`);
          });
        }
        return;
      }

      // Build payload as arrays (default for other resources)
      const payload = {};
      const fieldNames = new Set();

      // Collect all field names from all forms
      formData.forEach((form) => {
        Object.keys(form).forEach((key) => {
          if (key === "index") return;
          // For delivery orders, only send invoice_id, do_doc, and remarks
          if (
            resourceName === "deliveryorders" &&
            !["invoice_id", "do_doc", "remarks"].includes(key)
          ) {
            return;
          }
          fieldNames.add(key);
        });
      });

      // Build arrays for each field
      fieldNames.forEach((field) => {
        // Skip as_date for statements bulk upload
        if (resourceName === "statements" && field === "as_date") return;

        // Map as_doc -> statement_doc for statements payload
        const targetField =
          resourceName === "statements" && field === "as_doc"
            ? "statement_doc"
            : field;

        payload[targetField] = formData.map((form) => {
          const value = form[field];
          return value === undefined || value === null ? "" : value;
        });
      });

      // Log JSON payload before sending (non-deliveryorders)
      try {
        console.log("Sending payload for", resourceName, payload);
      } catch (e) {
        console.log("Failed to log payload:", e);
      }

      const result = await api.bulkUpload(payload);
      console.log("API Result:", result); // ADD THIS LINE
      console.log("Result Status:", result?.status); // ADD THIS LINE
      console.log("Result Duplicates:", result?.duplicates); // ADD THIS LINE
      // Handle backend-declared errors (e.g., duplicate invoices)
      const status = result?.status?.toLowerCase?.();
      const duplicateInvoices = result?.duplicate_invoices;
      const duplicateCN = result?.duplicate_cn;
      const duplicates = result?.duplicates;
      if (status === "error" || status === "fail" || status === "false") {
        const dupList = Array.isArray(duplicateInvoices)
          ? duplicateInvoices.map((d) => String(d))
          : Array.isArray(duplicateCN)
          ? duplicateCN.map((d) => String(d))
          : Array.isArray(duplicates)
          ? duplicates.map((d) => String(d))
          : [];

        // Parse validation errors from the errors object and extract index
        const { validationMap, messages: normalizedMessages } =
          parseValidationErrors(result?.errors);

        // Set validation errors to highlight the correct record card and fields
        if (Object.keys(validationMap).length > 0) {
          setValidationErrors(validationMap);
          setSubmitted(true);
        }

        // Prefer normalized validation messages; fall back to backend message
        const messageList = normalizedMessages.filter(Boolean);
        if (!messageList.length && result?.errors) {
          messageList.push("The selected DO number is invalid.");
        }
        const normalizedText = messageList.length
          ? Array.from(new Set(messageList)).join("\n")
          : "";
        const backendMessage = result?.message || "Upload failed.";
        const fullErrorMessage = normalizedText
          ? normalizedText
          : /The given data was invalid\.?/i.test(backendMessage)
          ? "The selected DO number is invalid."
          : backendMessage;
        const messageWithDup = dupList.length
          ? `${fullErrorMessage} (${dupList.join(", ")})`
          : fullErrorMessage;

        console.log("Duplicate List:", dupList);
        console.log("Error Message:", messageWithDup);
        console.log("Error Index:", errorIndex);
        console.log("Error Fields:", errorFields);

        setDuplicateList(dupList);
        setError(messageWithDup);
        setToastMessage(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      if (result) {
        setDuplicateList([]);
        setUploadedFiles([]);
        setParsedData(null);
        setFormData([]);
        setError(null);
        setStep(1);
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `Successfully uploaded ${formData.length} record(s)`,
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          navigate(`/${resourceName}`);
        });
      }
    } catch (err) {
      console.error("Error submitting forms:", err);
      console.log("Error Response Data:", err?.responseData);

      // Try to extract error from the attached responseData
      let errorData = err?.responseData || err?.response?.data;

      // If still no data, try parsing the message
      if (!errorData && err?.message) {
        const msg = String(err.message);

        // Try to parse the entire message as JSON
        try {
          errorData = JSON.parse(msg);
        } catch (_) {
          // If that fails, try to extract JSON from within the message
          const jsonStart = msg.indexOf("{");
          const jsonEnd = msg.lastIndexOf("}");
          if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            try {
              errorData = JSON.parse(msg.slice(jsonStart, jsonEnd + 1));
            } catch (_) {
              // Parsing failed, will use generic error
            }
          }
        }
      }

      if (errorData) {
        const dupList = Array.isArray(errorData?.duplicate_invoices)
          ? errorData.duplicate_invoices.map((d) => String(d))
          : Array.isArray(errorData?.duplicate_cn)
          ? errorData.duplicate_cn.map((d) => String(d))
          : Array.isArray(errorData?.duplicates)
          ? errorData.duplicates.map((d) => String(d))
          : [];

        // Parse validation errors from the errors object and extract index
        const { validationMap, messages: normalizedMessages } =
          parseValidationErrors(errorData?.errors);

        // Set validation errors to highlight the correct record card and fields
        if (Object.keys(validationMap).length > 0) {
          setValidationErrors(validationMap);
          setSubmitted(true);
        }

        const messageList = normalizedMessages.filter(Boolean);
        if (!messageList.length && errorData?.errors) {
          messageList.push("The selected DO number is invalid.");
        }
        const normalizedText = messageList.length
          ? Array.from(new Set(messageList)).join("\n")
          : "";
        const backendMessage = errorData?.message || "Upload failed.";
        const fullErrorMessage = normalizedText
          ? normalizedText
          : /The given data was invalid\.?/i.test(backendMessage)
          ? "The selected DO number is invalid."
          : backendMessage;
        const messageWithDup = dupList.length
          ? `${fullErrorMessage} (${dupList.join(", ")})`
          : fullErrorMessage;

        console.log("Final Duplicate List:", dupList);
        console.log("Final Error Message:", fullErrorMessage);
        console.log("Error Fields Map:", validationMap);

        setDuplicateList(dupList);
        setError(messageWithDup);
        setToastMessage(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      setToastMessage(null);
      setError(err?.message || "Error submitting forms. Please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
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
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Error</p>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{error}</p>
                    {duplicateList.length > 0 && (
                      <div className="mt-3 p-3 rounded-lg bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-800">
                        <p className="text-xs font-semibold text-red-900 dark:text-red-200 mb-2">
                          Duplicate Files Found:
                        </p>
                        <p className="text-sm font-mono text-red-800 dark:text-red-300">
                          {duplicateList.join(", ")}
                        </p>
                      </div>
                    )}
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
                      Paste & Continue
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
                  <p className="text-sm mt-1 whitespace-pre-wrap">{error}</p>
                  {duplicateList.length > 0 && (
                    <div className="mt-2 text-xs text-red-700 dark:text-red-300">
                      Duplicates: {duplicateList.join(", ")}
                    </div>
                  )}
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

                    // Check for duplicates by record number or document filename
                    const docName =
                      form.cn_doc ||
                      form.dn_doc ||
                      form.as_doc ||
                      form.file ||
                      form.do_doc ||
                      "";
                    const isDuplicate =
                      (recordNumber &&
                        duplicateList.includes(String(recordNumber))) ||
                      duplicateList.some(
                        (dup) => docName.includes(dup) || dup.includes(docName)
                      );
                    return (
                      <div
                        key={idx}
                        className={`group rounded-xl border-2 p-6 hover:shadow-lg transition-all duration-300 animate-fadeIn ${
                          validationErrors[idx]
                            ? "border-red-500 bg-red-50/60 dark:border-red-600 dark:bg-red-900/20"
                            : isDuplicate
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
                                Duplicate {recordNumber || "document"}
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
                            This record is a duplicate. Please remove it or
                            modify the document before re-submitting.
                          </div>
                        )}
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                          {resourceName === "ppis" ? (
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
                                  required
                                  error={fieldHasError(idx, "user_id")}
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
                                  required
                                  className={`w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500 ${errorClass(
                                    idx,
                                    "cn_no"
                                  )}`}
                                />
                              </div>

                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  PPI Date
                                </label>
                                <input
                                  type="date"
                                  value={form.ppi_date ?? ""}
                                  onChange={(e) =>
                                    handleFormChange(
                                      idx,
                                      "ppi_date",
                                      e.target.value
                                    )
                                  }
                                  required
                                  className={`w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500 ${errorClass(
                                    idx,
                                    "ppi_date"
                                  )}`}
                                />
                              </div>

                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  Payment Term
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
                                  required
                                  className={`w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500 ${errorClass(
                                    idx,
                                    "payment_term"
                                  )}`}
                                />
                              </div>

                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  Amount (MYR)
                                </label>
                                <input
                                  type="text"
                                  value={form.amount ?? ""}
                                  onChange={(e) =>
                                    handleFormChange(
                                      idx,
                                      "amount",
                                      e.target.value
                                    )
                                  }
                                  required
                                  className={`w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500 ${errorClass(
                                    idx,
                                    "amount"
                                  )}`}
                                />
                              </div>

                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  PPI Percentage (%)
                                </label>
                                <input
                                  type="text"
                                  value={form.ppi_percentage ?? ""}
                                  onChange={(e) =>
                                    handleFormChange(
                                      idx,
                                      "ppi_percentage",
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500"
                                />
                              </div>

                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  Customer No.
                                </label>
                                <input
                                  type="text"
                                  value={form.customer_no ?? ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    handleFormChange(idx, "customer_no", val);
                                    const matched = companyMapByCustomer[String(
                                      val ?? ""
                                    )
                                      .trim()
                                      .toLowerCase()];
                                    if (matched) {
                                      handleFormChange(idx, "user_id", matched);
                                    }
                                  }}
                                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500"
                                />
                              </div>

                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  PPI Document
                                </label>
                                <input
                                  type="text"
                                  value={form.ppi_doc ?? ""}
                                  onChange={(e) =>
                                    handleFormChange(
                                      idx,
                                      "ppi_doc",
                                      e.target.value
                                    )
                                  }
                                  required
                                  className={`w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 dark:border-gray-600 dark:bg-gray-700/40 dark:text-white ${errorClass(
                                    idx,
                                    "ppi_doc"
                                  )}`}
                                  placeholder="Auto from parsed file"
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
                          ) : resourceName === "creditnotes" ? (
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
                                  required
                                  error={fieldHasError(idx, "user_id")}
                                />
                              </div>
                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  Customer No.
                                </label>
                                <input
                                  type="text"
                                  value={form.customer_no ?? ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    handleFormChange(idx, "customer_no", val);
                                    const matched = companyMapByCustomer[String(
                                      val ?? ""
                                    )
                                      .trim()
                                      .toLowerCase()];
                                    if (matched) {
                                      handleFormChange(idx, "user_id", matched);
                                    }
                                  }}
                                  required
                                  className={`w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500 ${errorClass(
                                    idx,
                                    "customer_no"
                                  )}`}
                                />
                              </div>
                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  Amount (MYR)
                                </label>
                                <input
                                  type="text"
                                  value={form.amount ?? ""}
                                  onChange={(e) =>
                                    handleFormChange(
                                      idx,
                                      "amount",
                                      e.target.value
                                    )
                                  }
                                  required
                                  className={`w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500 ${errorClass(
                                    idx,
                                    "amount"
                                  )}`}
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
                                  required
                                  className={`w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500 ${errorClass(
                                    idx,
                                    "po_no"
                                  )}`}
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
                                  required
                                  className={`w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500 ${errorClass(
                                    idx,
                                    "ref_no"
                                  )}`}
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
                                  required
                                  className={`w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500 ${errorClass(
                                    idx,
                                    "cn_no"
                                  )}`}
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
                                  required
                                  className={`w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500 ${errorClass(
                                    idx,
                                    "cn_date"
                                  )}`}
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
                                  required
                                  className={`w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 dark:border-gray-600 dark:bg-gray-700/40 dark:text-white ${errorClass(
                                    idx,
                                    "cn_doc"
                                  )}`}
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
                                  required
                                  className={`w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500 ${errorClass(
                                    idx,
                                    "payment_term"
                                  )}`}
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
                                  required
                                  error={fieldHasError(idx, "user_id")}
                                />
                              </div>
                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  Customer No.
                                </label>
                                <input
                                  type="text"
                                  value={form.customer_no ?? ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    handleFormChange(idx, "customer_no", val);
                                    const matched = companyMapByCustomer[String(
                                      val ?? ""
                                    )
                                      .trim()
                                      .toLowerCase()];
                                    if (matched) {
                                      handleFormChange(idx, "user_id", matched);
                                    }
                                  }}
                                  required
                                  className={`w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500 ${errorClass(
                                    idx,
                                    "customer_no"
                                  )}`}
                                />
                              </div>
                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  Amount (MYR)
                                </label>
                                <input
                                  type="text"
                                  value={form.amount ?? ""}
                                  onChange={(e) =>
                                    handleFormChange(
                                      idx,
                                      "amount",
                                      e.target.value
                                    )
                                  }
                                  required
                                  className={`w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500 ${errorClass(
                                    idx,
                                    "amount"
                                  )}`}
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
                                  required
                                  className={`w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500 ${errorClass(
                                    idx,
                                    "po_no"
                                  )}`}
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
                                  required
                                  className={`w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500 ${errorClass(
                                    idx,
                                    "ref_no"
                                  )}`}
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
                                  required
                                  className={`w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500 ${errorClass(
                                    idx,
                                    "dn_no"
                                  )}`}
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
                                  required
                                  className={`w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500 ${errorClass(
                                    idx,
                                    "dn_date"
                                  )}`}
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
                                  required
                                  className={`w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 dark:border-gray-600 dark:bg-gray-700/40 dark:text-white ${errorClass(
                                    idx,
                                    "dn_doc"
                                  )}`}
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
                                  required
                                  className={`w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500 ${errorClass(
                                    idx,
                                    "payment_term"
                                  )}`}
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
                          ) : resourceName === "statements" ? (
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
                                  required
                                  error={fieldHasError(idx, "user_id")}
                                />
                              </div>
                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  Customer No.
                                </label>
                                <input
                                  type="text"
                                  value={form.customer_no ?? ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    handleFormChange(idx, "customer_no", val);
                                    const matched = companyMapByCustomer[String(
                                      val ?? ""
                                    )
                                      .trim()
                                      .toLowerCase()];
                                    if (matched) {
                                      handleFormChange(idx, "user_id", matched);
                                    }
                                  }}
                                  required
                                  className={`w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500 ${errorClass(
                                    idx,
                                    "customer_no"
                                  )}`}
                                />
                              </div>
                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  Statement Doc
                                </label>
                                <input
                                  type="text"
                                  value={form.as_doc ?? ""}
                                  onChange={(e) =>
                                    handleFormChange(
                                      idx,
                                      "as_doc",
                                      e.target.value
                                    )
                                  }
                                  required
                                  className={`w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 dark:border-gray-600 dark:bg-gray-700/40 dark:text-white ${errorClass(
                                    idx,
                                    "as_doc"
                                  )}`}
                                  placeholder="Auto from parsed file"
                                />
                              </div>
                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  Statement Date
                                </label>
                                <input
                                  type="date"
                                  value={form.as_date ?? ""}
                                  onChange={(e) =>
                                    handleFormChange(
                                      idx,
                                      "as_date",
                                      e.target.value
                                    )
                                  }
                                  required
                                  className={`w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500 ${errorClass(
                                    idx,
                                    "as_date"
                                  )}`}
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
                          ) : resourceName === "invoices" ? (
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
                                  required
                                  error={fieldHasError(idx, "user_id")}
                                />
                              </div>
                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  Customer No.
                                </label>
                                <input
                                
                                  type="text"
                                  value={form.customer_no ?? ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    handleFormChange(idx, "customer_no", val);
                                    const matched = companyMapByCustomer[String(
                                      val ?? ""
                                    )
                                      .trim()
                                      .toLowerCase()];
                                    if (matched) {
                                      handleFormChange(idx, "user_id", matched);
                                    }
                                  }}
                                  required
                                  className={`w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500 ${errorClass(
                                    idx,
                                    "customer_no"
                                  )}`}
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
                                  required
                                  className={`w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500 ${errorClass(
                                    idx,
                                    "po_no"
                                  )}`}
                                />
                              </div>
                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  Invoice Number
                                </label>
                                <input
                                  type="text"
                                  value={form.invoice_no ?? ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    handleFormChange(idx, "invoice_no", val);
                                    try {
                                      const found = Object.values(invoiceData).find(
                                        (inv) =>
                                          String(inv?.invoiceId || inv?.invoice_no) ===
                                          String(val)
                                      );
                                      if (found) {
                                        handleFormChange(idx, "invoice_id", found.id);
                                      } else {
                                        handleFormChange(idx, "invoice_id", "");
                                      }
                                    } catch (err) {
                                      // ignore
                                    }
                                  }}
                                  required
                                  className={`w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500 ${errorClass(
                                    idx,
                                    "invoice_no"
                                  )}`}
                                  placeholder="Auto-filled from invoice (editable)"
                                />
                              </div>
                                   
                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  Invoice Date
                                </label>
                                <input
                                  type="date"
                                  value={form.invoice_date ?? ""}
                                  onChange={(e) =>
                                    handleFormChange(
                                      idx,
                                      "invoice_date",
                                      e.target.value
                                    )
                                  }
                                  required
                                  className={`w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500 ${errorClass(
                                    idx,
                                    "invoice_date"
                                  )}`}
                                />
                              </div>
                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  Delivery Order No.
                                </label>
                                <input
                                  type="text"
                                  value={form.do_no ?? ""}
                                  onChange={(e) =>
                                    handleFormChange(
                                      idx,
                                      "do_no",
                                      e.target.value
                                    )
                                  }
                                  required
                                  className={`w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500 ${errorClass(
                                    idx,
                                    "do_no"
                                  )}`}
                                />
                              </div>
                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                   Date
                                </label>
                                <input
                                  type="date"
                                  value={form.date ?? ""}
                                  onChange={(e) =>
                                    handleFormChange(
                                      idx,
                                      "date",
                                      e.target.value
                                    )
                                  }
                                  required
                                  className={`w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500 ${errorClass(
                                    idx,
                                    "date"
                                  )}`}
                                />
                              </div>
                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  Amount (MYR)
                                </label>
                                <input
                                  type="text"
                                  value={form.amount ?? ""}
                                  onChange={(e) =>
                                    handleFormChange(
                                      idx,
                                      "amount",
                                      e.target.value
                                    )
                                  }
                                  required
                                  className={`w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500 ${errorClass(
                                    idx,
                                    "amount"
                                  )}`}
                                />
                              </div>
                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  Invoice Document
                                </label>
                                <input
                                  type="text"
                                  value={form.file ?? ""}
                                  readOnly
                                  required
                                  className={`w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 dark:border-gray-600 dark:bg-gray-700/40 dark:text-white ${errorClass(
                                    idx,
                                    "file"
                                  )}`}
                                  placeholder="Parsed file name"
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
                          ) : resourceName === "deliveryorders" ? (
                            <>
                              {/* Extracted DO Number (from OCR) - display/editable text field */}
                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                   DO No.
                                </label>
                                <input
                                  type="text"
                                  value={form.do_no ?? ""}
                                  onChange={(e) =>
                                    handleFormChange(idx, "do_no", e.target.value)
                                  }
                                  required
                                  className={`w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${errorClass(
                                    idx,
                                    "do_no"
                                  )}`}
                                  placeholder="Auto-extracted DO No."
                                />
                              </div>
                              <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  Invoice Number
                                </label>
                                <input
                                  type="text"
                                  value={form.invoice_no ?? ""}
                                  readOnly
                                  disabled
                                  className={`w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${errorClass(
                                    idx,
                                    "invoice_no"
                                  )}`}
                                  placeholder="Invoice number (read-only)"
                                />
                              </div>
                              {/* <div className="relative">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  DO No
                                </label>
                                <input
                                  type="text"
                                  value={form.do_no ?? ""}
                                  readOnly
                                  required
                                  className={`w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 dark:border-gray-600 dark:bg-gray-700/40 dark:text-white read-only:cursor-not-allowed ${errorClass(idx, "do_no")}`}
                                  placeholder="Auto-filled from invoice"
                                />
                              </div> */}
                              <div className="relative md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  DO Document
                                </label>
                                <input
                                  type="text"
                                  value={form.do_doc ?? ""}
                                  readOnly
                                  required
                                  className={`w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 dark:border-gray-600 dark:bg-gray-700/40 dark:text-white ${errorClass(
                                    idx,
                                    "do_doc"
                                  )}`}
                                  placeholder="Uploaded document"
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
