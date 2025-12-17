import { ResourceForm } from "../../components/common/ResourceForm";
import { creditNotesAPI, companiesAPI } from "../../services/api";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function CreditNotesAdd() {
  const { id } = useParams();
  const isEditMode = !!id;

  const [companyOptions, setCompanyOptions] = useState([]);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const res = await companiesAPI.list();
        const list = res?.data ?? res ?? [];
        const opts = Array.isArray(list)
          ? list.map((c) => ({ value: c.id, label: c.company || c.name }))
          : [];
        setCompanyOptions(opts);
      } catch (err) {
        console.error("Error loading companies:", err);
        setCompanyOptions([]);
      }
    };
    loadCompanies();
  }, []);

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
    { name: "cn_no", label: "CN No.", type: "text", required: true },
    { name: "ref_no", label: "Reference No.", type: "text", required: true },
    { name: "file", label: "CN Document", type: "file", required: true },
    { name: "cn_date", label: "CN Date", type: "date", required: true },
    { name: "payment_term", label: "Due Date", type: "date", required: true },
    { name: "remarks", label: "Remarks", type: "textarea" },
  ];

  // Get list of field names defined in FIELDS
  const fieldNames = new Set(FIELDS.map((f) => f.name));

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
      return await creditNotesAPI.update(id, fd);
    }
    return await creditNotesAPI.create(fd);
  };

  return (
    <ResourceForm
      resourceName="creditnotes"
      fields={FIELDS}
      title={isEditMode ? "Edit Credit Note" : "New Credit Note"}
      onSubmit={handleSubmit}
    />
  );
}
