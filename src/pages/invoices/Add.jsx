import { ResourceForm } from "../../components/common/ResourceForm";
import { invoicesAPI, companiesAPI } from "../../services/api";
import { useState, useEffect } from "react";

export default function InvoicesAdd() {
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

  const FORM_FIELDS = [
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
      name: "invoice_date",
      label: "Invoice Date",
      type: "date",
      required: true,
    },
    {
      name: "invoiceId",
      label: "Invoice No.",
      type: "text",
      required: true,
    },
    {
      name: "customer_no",
      label: "Customer No.",
      type: "text",
      required: true,
    },
    {
      name: "amount",
      label: "Amount (MYR)",
      type: "number",
      required: true,
    },
    {
      name: "do_no",
      label: "Delivery Order No. (Can add multiple comma separated DO No's)",
      type: "text",
      placeholder: "DO123, DO124",
    },
    {
      name: "remarks",
      label: "Remarks",
      type: "textarea",
    },
    {
      name: "po_no",
      label: "Customer PO No.",
      type: "text",
      required: true,
    },
    {
      name: "file",
      label: "Invoice Document",
      type: "file",
      required: true,
    },
    {
      name: "due_date",
      label: "Due Date",
      type: "date",
      required: true,
    },
  ];

  const handleSubmit = async (formData) => {
    const fd = new FormData();
    Object.keys(formData).forEach((key) => {
      // Skip invoice_doc field - only send file
      if (key === "invoice_doc") return;

      const val = formData[key];
      if (val instanceof File) {
        fd.append(key, val, val.name);
      } else if (val !== undefined && val !== null && val !== "") {
        fd.append(key, String(val));
      }
    });
    return await invoicesAPI.create(fd);
  };

  return (
    <ResourceForm
      resourceName="invoices"
      fields={FORM_FIELDS}
      title="New Invoice"
      mode="add"
      onSubmit={handleSubmit}
    />
  );
}
