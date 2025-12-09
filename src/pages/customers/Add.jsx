import { ResourceForm } from "../../components/common/ResourceForm";
import { customersAPI } from "../../services/api";

const FIELDS = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "company", label: "Company", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "password", label: "Password", type: "password", required: true },
  {
    name: "password_confirmation",
    label: "Repeat Password",
    type: "password",
    required: true,
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: [
      { value: "1", label: "Active" },
      { value: "0", label: "Pending" },
    ],
  },
  { name: "customer_no", label: "Customer No.", type: "text" },
  { name: "phone", label: "Phone", type: "text" },
  { name: "address", label: "Address", type: "textarea" },
  { name: "email2", label: "Email 2", type: "email" },
  { name: "email3", label: "Email 3", type: "email" },
  { name: "payment_term", label: "Payment Term", type: "text" },
  { name: "cc1", label: "Upload Credit Application Form (CC1)", type: "file" },
  { name: "form_24", label: "Upload Form 24", type: "file" },
  { name: "form_9", label: "Upload Form 9", type: "file" },
  {
    name: "financial_statement",
    label: "Upload Financial Statements",
    type: "file",
  },
  { name: "pdpa", label: "Upload PDPA", type: "file" },
];

export default function CustomersAdd() {
  const handleSubmit = async (formData) => {
    // Build FormData for file uploads
    const fd = new FormData();
    Object.keys(formData).forEach((key) => {
      const val = formData[key];
      if (val instanceof File) fd.append(key, val, val.name);
      else if (val !== undefined && val !== null) fd.append(key, String(val));
    });
    return await customersAPI.create(fd);
  };

  return (
    <ResourceForm
      resourceName="customers"
      fields={FIELDS}
      title="New Customer"
      mode="add"
      onSubmit={handleSubmit}
    />
  );
}
