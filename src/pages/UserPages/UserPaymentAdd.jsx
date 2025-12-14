import { useNavigate } from "react-router-dom";
import UserLayout from "../../layout/UserLayout";
import { ResourceForm } from "../../components/common/ResourceForm";
import { userPaymentsAPI } from "../../services/api";

const FORM_FIELDS = [
  {
    name: "reference_id",
    label: "Reference ID",
    type: "text",
    required: true,
  },
  {
    name: "payment_date",
    label: "Payment Date",
    type: "date",
    required: true,
  },
  {
    name: "amount",
    label: "Amount",
    type: "number",
    required: true,
  },
  {
    name: "proof",
    label: "Proof Document",
    type: "file",
    required: true,
  },
];

export default function UserPaymentAdd() {
  const navigate = useNavigate();

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
    return await userPaymentsAPI.add(fd);
  };

  const handleSuccess = () => {
    navigate("/user/payments");
  };

  return (
      <ResourceForm
        resourceName="user/payments"
        fields={FORM_FIELDS}
        title="Add Payment"
        onSubmit={handleSubmit}
        onSubmitSuccess={handleSuccess}
      />
  );
}
