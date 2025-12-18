import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ResourceForm } from "../../components/common/ResourceForm";
import { apiCallFormData, invoicesAPI, companiesAPI } from "../../services/api";

export default function InvoicesAdd() {
  const { id } = useParams();
  const navigate = useNavigate();
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
      name: "customer_no",
      label: "Customer No.",
      type: "text",
      required: true,
    },
    {
      name: "po_no",
      label: "Customer PO No.",
      type: "text",
      required: true,
    },
    {
      name: "invoiceId",
      label: "Invoice No.",
      type: "text",
      required: true,
    },
    {
      name: "do_no",
      label: "Delivery Order No.",
      type: "text",
      placeholder: "DO-5511, DO-5512",
    },
    {
      name: "invoice_date",
      label: "Invoice Date",
      type: "date",
      required: true,
    },
    {
      name: "date",
      label: "Due Date",
      type: "date",
      required: true,
    },
    {
      name: "file",
      label: "Invoice Document",
      type: "file",
      required: true,
    },
    {
      name: "amount",
      label: "Amount (MYR)",
      type: "number",
      required: true,
      step: "0.01",
    },
    {
      name: "remarks",
      label: "Remarks",
      type: "textarea",
    },
  ];

  // Get list of field names defined in FORM_FIELDS
  const fieldNames = new Set(FORM_FIELDS.map((f) => f.name));

  // ---------------------------
  // Submit Handler
  // ---------------------------
  const handleSubmit = async (formData) => {
    const fd = new FormData();

    // Only include fields that are defined in FORM_FIELDS array
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

    // Add resourceName for backend
    fd.append("resourceName", "invoices");

    if (isEditMode) {
      return await apiCallFormData(`/invoices/update/${id}`, fd, "POST");
    }
    return await apiCallFormData("/invoices/create", fd, "POST");
  };

  return (
    <ResourceForm
      resourceName="invoices"
      fields={FORM_FIELDS}
      title={isEditMode ? "Edit Invoice" : "New Invoice"}
      onSubmit={handleSubmit}
      onSubmitSuccess={() => navigate('/invoices/view')}
    />
  );
}
