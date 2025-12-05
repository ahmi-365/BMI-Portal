import { ResourceForm } from "../../components/common/ResourceForm";
import { customersAPI } from "../../services/api";

const FIELDS = [
  { name: "customerNo", label: "Customer No.", type: "text", required: true },
  {
    name: "company",
    label: "Company/Business Name",
    type: "text",
    required: true,
  },
  { name: "name", label: "Contact Name", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  {
    name: "businessContactNumber",
    label: "Business Contact Number",
    type: "text",
  },
  { name: "paymentTerm", label: "Payment Term", type: "text" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "Pending", label: "Pending" },
      { value: "Approved", label: "Approved" },
    ],
    required: true,
  },
];

export default function CustomersAdd() {
  const handleSubmit = async (data) => {
    return await customersAPI.create(data);
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
