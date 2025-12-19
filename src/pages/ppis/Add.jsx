import { ResourceForm } from "../../components/common/ResourceForm";
import { ppisAPI } from "../../services/api";
import { useNavigate, useParams } from "react-router-dom";
import { useMemo } from "react";

export default function PpisAdd() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const FIELDS = useMemo(
    () => [
      { name: "user_id", label: "User ID", type: "number", required: true },
      { name: "admin_id", label: "Admin ID", type: "number", required: false },
      { name: "ppi_no", label: "PPI No.", type: "text", required: true },
      { name: "customer_no", label: "Customer No.", type: "text" },
      { name: "po_no", label: "PO No.", type: "text" },
      { name: "ref_no", label: "Reference No.", type: "text" },
      { name: "amount", label: "Amount", type: "number" },
      { name: "remarks", label: "Remarks", type: "textarea" },
      { name: "ppi_date", label: "PPI Date", type: "date" },
      { name: "payment_term", label: "Payment Term", type: "text" },
      { name: "ppi_percentage", label: "PPI Percentage", type: "text" },
      { name: "ppi_doc", label: "PPI Document", type: "file" },
    ],
    []
  );

  const fieldNames = useMemo(
    () => new Set(FIELDS.map((f) => f.name)),
    [FIELDS]
  );

  const handleSubmit = async (formData) => {
    const fd = new FormData();
    Object.keys(formData).forEach((key) => {
      if (!fieldNames.has(key)) return;
      const val = formData[key];
      if (val === undefined || val === null || val === "") return;
      if (val instanceof File) {
        fd.append(key, val, val.name);
      } else {
        fd.append(key, String(val));
      }
    });

    fd.append("resourceName", "ppis");

    if (isEditMode) {
      return await ppisAPI.update(id, fd);
    }
    return await ppisAPI.create(fd);
  };

  return (
    <ResourceForm
      resourceName="ppis"
      fields={FIELDS}
      title={isEditMode ? "Edit CN PPI" : "New CN PPI"}
      onSubmit={handleSubmit}
      onSubmitSuccess={() => navigate("/ppis")}
      fetchInitial={isEditMode ? () => ppisAPI.show(id) : undefined}
    />
  );
}
