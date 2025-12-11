import { ResourceForm } from "../../components/common/ResourceForm";
import { apiCallFormData, companiesAPI } from "../../services/api";
import { useState, useEffect } from "react";

export default function DebitNotesAdd() {
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
    { name: "ref_no", label: "Reference No.", type: "text", required: true },
    { name: "dn_no", label: "DN No.", type: "text" },
    { name: "file", label: "DN Document", type: "file" },
    { name: "dn_date", label: "DN Date", type: "date" },
    { name: "due_date", label: "Due Date", type: "date" },
    { name: "remarks", label: "Remarks", type: "textarea" },
  ];

  const handleSubmit = async (formData) => {
    // Build FormData from the form object
    const fd = new FormData();
    Object.keys(formData).forEach((key) => {
      const val = formData[key];
      if (val instanceof File) {
        fd.append(key, val, val.name);
      } else if (val !== undefined && val !== null && val !== "") {
        fd.append(key, String(val));
      }
    });
    return await apiCallFormData("/debitnotes/create", fd, "POST");
  };

  return (
    <ResourceForm
      resourceName="debitnotes"
      fields={FIELDS}
      title="New Debit Note"
      mode="add"
      onSubmit={handleSubmit}
    />
  );
}
