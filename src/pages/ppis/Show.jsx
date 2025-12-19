import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import Toast from "../../components/common/Toast";
import { ppisAPI } from "../../services/api";

export default function PpisShow() {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await ppisAPI.show(id);
        setRecord(res?.data || res);
      } catch (err) {
        setError(err.message || "Failed to load record");
      }
    };
    load();
  }, [id]);

  if (error) {
    return (
      <div>
        <Toast message={error} type="error" onClose={() => setError(null)} />
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!record) return null;

  return (
    <div className="space-y-4">
      <PageMeta
        title={`CN PPI ${record.ppi_no || "Details"}`}
        description="CN PPI details"
      />
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-3">
        {[
          ["PPI No", record.ppi_no],
          ["Customer No", record.customer_no],
          ["PO No", record.po_no],
          ["Ref No", record.ref_no],
          ["Amount", record.amount],
          ["Remarks", record.remarks],
          ["PPI Date", record.ppi_date],
          ["Payment Term", record.payment_term],
          ["PPI %", record.ppi_percentage],
          ["PPI Doc", record.ppi_doc],
          ["Created At", record.created_at],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">{label}</span>
            <span className="text-gray-900 dark:text-white">
              {value || "-"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
