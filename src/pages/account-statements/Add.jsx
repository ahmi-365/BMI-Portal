import { ResourceForm } from "../../components/common/ResourceForm";
import { statementsAPI, companiesAPI } from "../../services/api";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function AccountStatementsAdd() {
  const { id } = useParams();
  const isEditMode = !!id;

  const [companyOptions, setCompanyOptions] = useState([]);
  const [companyMap, setCompanyMap] = useState({});

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const res = await companiesAPI.list();
        const list = res?.data ?? res ?? [];
        const opts = Array.isArray(list)
          ? list.map((c) => ({ value: c.id, label: c.company || c.name }))
          : [];
        const map = {};
        if (Array.isArray(list)) list.forEach((c) => (map[c.id] = c));
        setCompanyOptions(opts);
        setCompanyMap(map);
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
      onChange: (value, setFormData) => {
        const company = companyMap?.[value];
        setFormData((prev) => ({
          ...prev,
          user_id: value,
          customer_no: company?.customer_no || "",
        }));
      },
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

  // Get list of field names defined in FIELDS
  const fieldNames = new Set(FIELDS.map(f => f.name));

  const handleSubmit = async (formData) => {
    const fd = new FormData();
    
    // Only include fields that are defined in FIELDS array
    Object.keys(formData).forEach((key) => {
      if (fieldNames.has(key)) {
        const val = formData[key];
        if (val instanceof File) fd.append(key, val, val.name);
        else if (val !== undefined && val !== null) fd.append(key, String(val));
      }
    });

    if (isEditMode) {
      return await statementsAPI.update(id, fd);
    }
    return await statementsAPI.create(fd);
  };

  return (
    <ResourceForm
      resourceName="statements"
      fields={FIELDS}
      title={isEditMode ? "Edit Account Statement" : "New Account Statement"}
      onSubmit={handleSubmit}
    />
  );
}
