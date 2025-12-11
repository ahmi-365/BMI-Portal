import { ResourceForm } from "../../components/common/ResourceForm";
import { creditNotesAPI, companiesAPI } from "../../services/api";
import { useState, useEffect } from "react";

export default function CreditNotesAdd() {
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
    { name: "do_doc", label: "CN Document", type: "file" },
    { name: "cn_date", label: "CN Date", type: "date", required: true },
    { name: "due_date", label: "Due Date", type: "date", required: true },
    { name: "remarks", label: "Remarks", type: "textarea" },
  ];

  const handleSubmit = async (formData) => {
    const fd = new FormData();
    Object.keys(formData).forEach((key) => {
      const val = formData[key];
      if (val instanceof File) {
        fd.append(key, val, val.name);
      } else if (val !== undefined && val !== null && val !== "") {
        fd.append(key, String(val));
      }
    });
    return await creditNotesAPI.create(fd);
  };

  return (
    <ResourceForm
      resourceName="creditnotes"
      fields={FIELDS}
      title="New Credit Note"
      mode="add"
      onSubmit={handleSubmit}
    />
  );
}
