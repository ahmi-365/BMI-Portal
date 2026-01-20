import { useParams } from "react-router-dom";
import { ResourceForm } from "../../components/common/ResourceForm";
import { customersAPI } from "../../services/api";
import { toast } from "react-toastify";

export default function CustomersAdd() {
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const FIELDS = [
    {
      name: "name",
      label: "Company/Business Name",
      type: "text",
      required: true,
    },
    {
      name: "company",
      label: "Business Contact Name ",
      type: "text",
      required: true,
    },
    {
      name: "email",
      label: "Business E-mail (Primary) ",
      type: "email",
      required: true,
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      required: !isEditMode,
    },
    {
      name: "password_confirmation",
      label: "Repeat Password",
      type: "password",
      required: !isEditMode,
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
    { name: "address", label: "Billing Address", type: "textarea" },
    { name: "email2", label: "Business E-mail 2", type: "email" },
    { name: "email3", label: "Business E-mail 3", type: "email" },
    { name: "payment_term", label: "Payment Term (EOM)", type: "text" },
    {
      name: "cc1",
      label: "Upload Credit Application Form (CC1)",
      type: "file",
    },
    { name: "form_24", label: "Upload Form 24", type: "file" },
    { name: "form_9", label: "Upload Form 9", type: "file" },
    {
      name: "financial_statement",
      label: "Upload Financial Statements",
      type: "file",
    },
    { name: "pdpa", label: "Upload PDPA", type: "file" },
  ];

  const handleSubmit = async (formData) => {
    // Build FormData for file uploads
    const fd = new FormData();
    Object.keys(formData).forEach((key) => {
      const val = formData[key];

      // Skip blank passwords during edit so backend keeps existing password
      if ((key === "password" || key === "password_confirmation") && !val) {
        return;
      }

      if (val instanceof File) fd.append(key, val, val.name);
      else if (val !== undefined && val !== null && val !== "")
        fd.append(key, String(val));
    });

    if (isEditMode) {
      return await customersAPI.update(id, fd);
    }
    return await customersAPI.create(fd);
  };

  return (
    <ResourceForm
      resourceName="customers"
      fields={FIELDS}
      title={isEditMode ? "Edit Customer" : "New Customer"}
      onSubmit={handleSubmit}
      // onSubmitSuccess={() => {
      //   toast.success(isEditMode ? "Customer updated successfully" : "Customer added successfully");
      // }}
    />
  );
}
