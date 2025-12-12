import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { ResourceForm } from "../../components/common/ResourceForm";
import { deliveryOrdersAPI, invoicesAPI } from "../../services/api";

export default function DeliveryOrdersAdd() {
  const { id } = useParams();
  const isEditMode = !!id;
  const [invoiceOptions, setInvoiceOptions] = useState([]);
  const [invoiceData, setInvoiceData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // Load invoices with optional search query
  const loadInvoices = useCallback(async (search = "") => {
    try {
      const res = await invoicesAPI.allInvoices(search);
      const list = res?.data ?? res ?? [];

      // Store full invoice data for auto-fill
      const dataMap = {};
      const opts = Array.isArray(list)
        ? list.map((inv) => {
            dataMap[inv.id] = inv;
            return {
              value: inv.id,
              label: inv.do_no || `DO #${inv.id}`,
            };
          })
        : [];

      setInvoiceData(dataMap);
      setInvoiceOptions(opts);
    } catch (e) {
      console.error("Error loading invoices:", e);
      setInvoiceOptions([]);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        loadInvoices(searchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, loadInvoices]);

  const FORM_FIELDS = [
    {
      name: "invoice_id",
      label: "DO No.",
      type: "select",
      searchable: true,
      options: invoiceOptions,
      onSearch: setSearchQuery,
      onChange: (value, setFormData) => {
        const invoice = invoiceData[value];
        if (invoice && setFormData) {
          setFormData((prev) => ({
            ...prev,
            invoice_id: value,
            invoice_no: invoice.invoiceId || "",
            do_no: invoice.invoiceId || "",
          }));
        }
      },
    },
    {
      name: "do_no",
      label: "Invoice Id",
      type: "text",
      readOnly: true,
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
    if (isEditMode) {
      return await deliveryOrdersAPI.update(id, fd);
    }
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
