import { ResourceForm } from "../../components/common/ResourceForm";
import { useState, useEffect } from "react";
import { statementsAPI, companiesAPI } from "../../services/api";

export default function AccountStatementsEdit() {
  const [companyOptions, setCompanyOptions] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await companiesAPI.list();
        const list = res?.data ?? res ?? [];
        const opts = Array.isArray(list)
          ? list.map((c) => ({ value: c.id, label: c.company || c.name }))
          : [];
        setCompanyOptions(opts);
      } catch (err) {
        console.error(err);
        setCompanyOptions([]);
      }
    };
    load();
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
    },
    {
      name: "statement_date",
      label: "Statement Date",
      type: "date",
      required: true,
    },
  ];

  const handleSubmit = async (formData) => {
    // Build FormData for file upload (statements API expects multipart)
    const fd = new FormData();
    Object.keys(formData).forEach((key) => {
      const val = formData[key];
      if (val instanceof File) {
        fd.append(key, val, val.name);
      } else if (val !== undefined && val !== null) {
        fd.append(key, String(val));
      }
    });
    // id will be in the URL handled by ResourceForm when calling onSubmit
    return await statementsAPI.update(/* id filled by caller */ null, fd);
  };

  return (
    <ResourceForm
      resourceName="statements"
      fields={FIELDS}
      title="Edit Account Statement"
      mode="edit"
      onSubmit={async (formData) => {
        // ResourceForm provides id via params; we need to get id from URL inside ResourceForm's onSubmit caller.
        // To keep things simple, ResourceForm calls our onSubmit with formData; it does not pass id.
        // So we call statementsAPI.update via endpoint that expects /statements/update/:id from ResourceForm's update flow
        // But ResourceForm will call this onSubmit instead of its default update; to ensure server gets the ID, we will
        // read the id from the formData if present (some forms include id), otherwise rely on ResourceForm's default update.
        if (formData.id) {
          const fd = new FormData();
          Object.keys(formData).forEach((key) => {
            const val = formData[key];
            if (val instanceof File) fd.append(key, val, val.name);
            else if (val !== undefined && val !== null)
              fd.append(key, String(val));
          });
          return statementsAPI.update(formData.id, fd);
        }
        // If no id present, fallback to letting ResourceForm use its default update (which sends JSON)
        return null;
      }}
    />
  );
}
