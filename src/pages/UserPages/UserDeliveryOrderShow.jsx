import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Download, ArrowLeft } from "lucide-react";
import UserLayout from "../../layout/UserLayout";
import Loader from "../../components/common/Loader";
import { userDeliveryOrdersAPI } from "../../services/api";

export default function UserDeliveryOrderShow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const result = await userDeliveryOrdersAPI.show(id);
      setData(result);
    } catch (error) {
      console.error("Error loading delivery order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const blob = await userDeliveryOrdersAPI.download(id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `delivery-order-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download delivery order");
    }
  };

  if (isLoading) {
    return (
      <UserLayout>
        <div className="flex justify-center items-center h-96">
          <Loader />
        </div>
      </UserLayout>
    );
  }

  if (!data) {
    return (
      <UserLayout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <p className="text-gray-500">Delivery order not found</p>
          <button
            onClick={() => navigate("/user/delivery-orders")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Delivery Orders
          </button>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate("/user/delivery-orders")}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-700 mb-6"
        >
          <ArrowLeft size={18} />
          Back to Delivery Orders
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Delivery Order Details
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Order #{data.do_no}
              </p>
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              <Download size={18} />
              Download
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Order No
              </label>
              <p className="text-gray-900 dark:text-white">
                {data.do_no || "-"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <p className="text-gray-900 dark:text-white">
                {data.do_date || "-"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Amount
              </label>
              <p className="text-gray-900 dark:text-white">
                {data.amount || "-"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <p className="text-gray-900 dark:text-white">
                {data.status || "-"}
              </p>
            </div>
          </div>

          {data.description && (
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <p className="text-gray-900 dark:text-white">
                {data.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
