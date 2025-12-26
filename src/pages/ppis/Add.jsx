import { ResourceForm } from "../../components/common/ResourceForm";
import { companiesAPI, ppisAPI } from "../../services/api";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

export default function PpisAdd() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [companyOptions, setCompanyOptions] = useState([]);
  const [key, setKey] = useState(0);

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

  const FIELDS = useMemo(
  () => [
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
      disabled: true, 
    },

    {
      name: "ppi_date", 
      label: "PPI Date",
      type: "date",
      required: true,
    },

    {
      name: "payment_term", 
      label: "Payment Term",
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
      name: "cn_no",
      label: "CN No.",
      type: "number",
      required: true,
    },

    {
      name: "ppi_percentage", 
      label: "PPI Percentage (%)",
      type: "number",
      min: 0,
      max: 100,
    },

    {
      name: "remarks",
      label: "Remarks",
      type: "textarea",
    },

    {
      name: "file",
      label: "PPI Document",
      type: "file",
    },
  ],
  [companyOptions]
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

  const handleSuccess = () => {
    if (!isEditMode) {
      // Reset form by changing key to force remount
      setKey((prev) => prev + 1);
    } else {
      // In edit mode, navigate back to list
      navigate("/ppis");
    }
  };

  return (
    <ResourceForm
      key={key}
      resourceName="ppis"
      fields={FIELDS}
      title={isEditMode ? "Edit PPI" : "New PPI"}
      onSubmit={handleSubmit}
      onSubmitSuccess={handleSuccess}
      fetchInitial={isEditMode ? () => ppisAPI.show(id) : undefined}
    />
  );
}
