import { ResourceForm } from "../../components/common/ResourceForm";
import { companiesAPI, ppisAPI } from "../../services/api";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

export default function PpisAdd() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [companyOptions, setCompanyOptions] = useState([]);
  const [companyMap, setCompanyMap] = useState({});
  const [creditNoteOptions, setCreditNoteOptions] = useState([]);
  const [creditNoteMap, setCreditNoteMap] = useState({});
  const [key, setKey] = useState(0);

  // Load credit notes for CN No. dropdown
  useEffect(() => {
    const loadCreditNotes = async (search = "") => {
      try {
        const res = await ppisAPI.allCreditnotes(search);
        const list = res?.data ?? res ?? [];

        // FIX: Use cn_no (string) as the value to match backend data
        const opts = Array.isArray(list)
          ? list.map((c) => ({
              value: c.cn_no, 
              label: c.cn_no ? String(c.cn_no) : `CN #${c.id}`,
            }))
          : [];
        setCreditNoteOptions(opts);

        // Map by cn_no string for easy lookup
        const map = {};
        if (Array.isArray(list)) {
          list.forEach((c) => {
            if (c.cn_no) {
              map[c.cn_no] = c;
            }
          });
        }
        setCreditNoteMap(map);
      } catch (err) {
        setCreditNoteOptions([]);
        setCreditNoteMap({});
      }
    };
    loadCreditNotes();
  }, []);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const res = await companiesAPI.list();
        const list = res?.data ?? res ?? [];
        const opts = Array.isArray(list)
          ? list.map((c) => ({ value: c.id, label: c.company || c.name }))
          : [];
        setCompanyOptions(opts);
        const map = {};
        if (Array.isArray(list)) {
          list.forEach((c) => {
            map[c.id] = c;
          });
        }
        setCompanyMap(map);
      } catch (err) {
        console.error("Error loading companies:", err);
        setCompanyOptions([]);
        setCompanyMap({});
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
        onChange: (selectedId, setFormData) => {
          const company = companyMap[selectedId];
          setFormData((prev) => ({
            ...prev,
            user_id: selectedId,
            customer_no:
              company && company.customer_no ? company.customer_no : "",
          }));
        },
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
        type: "select",
        searchable: true,
        required: true,
        options: creditNoteOptions,
        placeholder: "Select a credit note...",
        onSearch: (query) => {
          const loadCreditNotes = async () => {
            try {
              const res = await ppisAPI.allCreditnotes(query);
              const list = res?.data ?? res ?? [];

              const opts = Array.isArray(list)
                ? list.map((c) => ({
                    value: c.cn_no,
                    label: c.cn_no ? String(c.cn_no) : `CN #${c.id}`,
                  }))
                : [];
              setCreditNoteOptions(opts);

              const map = {};
              if (Array.isArray(list)) {
                list.forEach((c) => {
                  if (c.cn_no) {
                    map[c.cn_no] = c;
                  }
                });
              }
              setCreditNoteMap(map);
            } catch (err) {
              setCreditNoteOptions([]);
              setCreditNoteMap({});
            }
          };
          loadCreditNotes();
        },
        onChange: (selectedCnNo, setFormData) => {
          // Look up by the string key (cn_no)
          const creditNote = creditNoteMap[selectedCnNo];
          setFormData((prev) => ({
            ...prev,
            cn_no: creditNote && creditNote.cn_no ? creditNote.cn_no : "",
          }));
        },
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
    [companyOptions, companyMap, creditNoteOptions, creditNoteMap]
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
      // Skip null/undefined/empty strings to avoid sending bad data
      if (val === undefined || val === null || val === "") return;
      
      if (val instanceof File) {
        fd.append(key, val, val.name);
      } else {
        fd.append(key, String(val));
      }
    });

    // NOTE: resourceName is NOT appended here based on your request

    if (isEditMode) {
      return await ppisAPI.update(id, fd);
    }
    return await ppisAPI.create(fd);
  };

  const handleSuccess = () => {
    if (!isEditMode) {
      setKey((prev) => prev + 1);
    } else {
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