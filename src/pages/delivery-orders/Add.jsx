import { ResourceForm } from "../../components/common/ResourceForm";
import { deliveryOrdersAPI } from "../../services/api";

const FORM_FIELDS = [
  {
    name: "do_nos",
    label: "Invoice No",
    type: "text",
  },

  {
    name: "do_no",
    label: "DO No.",
    type: "text",
  },
  {
    name: "remarks",
    label: "Remarks",
    type: "textarea",
  },

  {
    name: "file",
    label: "DO Document",
    type: "file",
  },
];

export default function DeliveryOrdersAdd() {
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
    return await deliveryOrdersAPI.create(fd);
  };

  return (
    <ResourceForm
      resourceName="deliveryorders"
      fields={FORM_FIELDS}
      title="New Delivery Order"
      onSubmit={handleSubmit}
    />
  );
}
