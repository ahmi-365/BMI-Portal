import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ResourceForm } from "../../components/common/ResourceForm";
import { deliveryOrdersAPI, invoicesAPI } from "../../services/api";

export default function DeliveryOrdersAdd() {
  const { id } = useParams();
  const isEditMode = !!id;
  const [invoiceOptions, setInvoiceOptions] = useState([]);
  const [invoiceData, setInvoiceData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Load invoices with optional search query
  const loadInvoices = useCallback(async (search = "") => {
    try {
      const res = await invoicesAPI.allInvoices(search);
      const list = res?.data ?? res ?? [];

      // Store full invoice data for auto-fill
      const dataMap = {};
      const opts = Array.isArray(list)
        ? list.map((inv) => {
          dataMap[inv.do_no] = inv; // Key by do_no instead of id
          return {
            value: inv.do_no, // Send do_no to backend
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
      name: "do_no",
      label: "DO No.",
      required: true,
      type: "select",
      searchable: true,
      options: invoiceOptions,
      onSearch: setSearchQuery,
      onChange: (value, setFormData) => {
        const invoice = invoiceData[value];
        if (invoice && setFormData) {
          setSelectedInvoice(invoice);
          setFormData((prev) => ({
            ...prev,
            do_no: value, // Send do_no to backend
            invoice_id: invoice.invoice_no || invoice.invoiceId || "", // Store complete invoice number for display
          }));
        }
      },
    },
    {
      name: "invoice_id",
      label: "Invoice Number",
      type: "text",
      disabled: true, // Read-only display field
    },
    {
      name: "remarks",
      label: "Remarks",
      type: "textarea",
    },
    {
      name: "do_doc",
      label: "DO Document",
      type: "file",
      required: true,
    },
  ];

  const handleSubmit = async (formData) => {
    const fd = new FormData();


    if (formData.do_no) fd.append("do_no", formData.do_no);
    if (formData.remarks) fd.append("remarks", formData.remarks);

    // Handle file upload
    if (formData.do_doc instanceof File) {
      fd.append("file", formData.do_doc, formData.do_doc.name);
    }

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
