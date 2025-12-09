import { ResourceForm } from "../../components/common/ResourceForm";
import { statementsAPI, companiesAPI } from "../../services/api";
import { useState, useEffect } from "react";

export default function AccountStatementsAdd() {
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
    { name: "customer_no", label: "Customer No", type: "text", required: true },
    {
      name: "user_id",
      label: "Company",
      type: "select",
      searchable: true,
      required: true,
      options: companyOptions,
      placeholder: "Select a company...",
    },
    {
      name: "statement_doc",
      label: "Statement Document",
      type: "file",
      required: true,
    },
    {
      name: "statement_date",
      label: "Statement Date",
      type: "date",
      required: true,
    },
  ];

  const handleSubmit = async (formData) => {
    const fd = new FormData();
    Object.keys(formData).forEach((key) => {
      const val = formData[key];
      if (val instanceof File) fd.append(key, val, val.name);
      else if (val !== undefined && val !== null) fd.append(key, String(val));
    });
    return await statementsAPI.create(fd);
  };

  return (
    <ResourceForm
      resourceName="statements"
      fields={FIELDS}
      title="New Account Statement"
      mode="add"
      onSubmit={handleSubmit}
    />
  );
}
