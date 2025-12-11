import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ResourceForm } from "../../components/common/ResourceForm";
import { apiCallFormData, debitNotesAPI } from "../../services/api";
import { companiesAPI } from "../../services/api";

export default function DebitNotesAdd() {
  const { id } = useParams();
  const isEditMode = !!id;

  const [companyOptions, setCompanyOptions] = useState([]);

  // ---------------------------
  // Load company dropdown data
  // ---------------------------
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const res = await companiesAPI.list();
        const list = res?.data ?? res ?? [];

        const opts = Array.isArray(list)
          ? list.map((c) => ({
              value: c.id,
              label: c.company || c.name,
            }))
          : [];

        setCompanyOptions(opts);
      } catch (err) {
        console.error("Error loading companies:", err);
        setCompanyOptions([]);
      }
    };

    loadCompanies();
  }, []);

  // ---------------------------
  // Form Fields
  // ---------------------------
  const FIELDS = [
    {
      name: "user_id",
      label: "Company Name",
      type: "select",
      searchable: true,
      required: true,
      options: companyOptions,
      placeholder: "Select a company...",
    },
    {
      name: "customer_no",
      label: "Customer No.",
      type: "text",
      required: true,
    },
    { name: "po_no", label: "Customer PO No.", type: "text", required: true },
    { name: "amount", label: "Amount (MYR)", type: "number", required: true },
    { name: "ref_no", label: "Reference No.", type: "text", required: true },
    { name: "dn_no", label: "DN No.", type: "text" },
    { name: "dn_doc", label: "DN Document", type: "file" },
    { name: "dn_date", label: "DN Date", type: "date" },
    { name: "payment_term", label: "Due Date", type: "date" },
    { name: "remarks", label: "Remarks", type: "textarea" },
  ];

  // Get list of field names defined in FIELDS
  const fieldNames = new Set(FIELDS.map((f) => f.name));

  // ---------------------------
  // Submit Handler
  // ---------------------------
  const handleSubmit = async (formData) => {
    const fd = new FormData();

    // Only include fields that are defined in FIELDS array
    Object.keys(formData).forEach((key) => {
      if (fieldNames.has(key)) {
        const val = formData[key];
        if (val instanceof File) {
          fd.append(key, val, val.name);
        } else if (val !== undefined && val !== null && val !== "") {
          fd.append(key, String(val));
        }
      }
    });

    if (isEditMode) {
      return await apiCallFormData(`/debitnotes/update/${id}`, fd, "POST");
    }
    return await apiCallFormData("/debitnotes/create", fd, "POST");
  };

  return (
    <ResourceForm
      resourceName="debitnotes"
      fields={FIELDS}
      title={isEditMode ? "Edit Debit Note" : "New Debit Note"}
      onSubmit={handleSubmit}
    />
  );
}
