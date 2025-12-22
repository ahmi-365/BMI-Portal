import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Loader from "../../components/common/Loader";
import { adminAPI } from "../../services/api";

export default function SystemLogsViewer() {
  // Removed useTheme hook as we are now using native Tailwind dark classes
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [expandedLogs, setExpandedLogs] = useState({});

  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage]);

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      setError("");
      const res = await adminAPI.logs(page);

      // Backend returns envelope { status: true, data: { data: [...], current_page, last_page, total, links } }
      const envelope = res?.data || res || {};
      const items = Array.isArray(envelope.data) ? envelope.data : [];
      setLogs(items);
      setLastPage(envelope.last_page || envelope.lastPage || 1);
    } catch (err) {
      setError(err.message || "An error occurred while fetching logs.");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (id) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatJSON = (data) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Activity Logs
          </h1>
          <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
            View and monitor system activity logs.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && logs.length === 0 && (
          <div className="text-center py-12 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
            <p className="text-lg">No activity logs available.</p>
          </div>
        )}

        {/* Logs */}
        {logs.length > 0 && (
          <>
            <div className="space-y-4">
              {logs.map((log) => {
                const isExpanded = Boolean(expandedLogs[log.id]);

                return (
                  <div
                    key={log.id}
                    className="rounded-lg border overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm"
                  >
                    {/* Log Header */}
                    <button
                      onClick={() => toggleExpanded(log.id)}
                      className="w-full p-4 flex items-center justify-between transition hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-center flex-1 text-left">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center mr-4 font-semibold text-sm bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                          #{log.id}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">
                            {log.action} — {log.model_type}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {log.model_id
                              ? `Model ID: ${log.model_id}`
                              : "No Model"}
                            {log.user && ` • By: ${log.user.name}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {formatDate(log.created_at)}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        )}
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border-t p-4 space-y-4 border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                        {/* Old Values */}
                        {log.old_values && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                              OLD Values
                            </h4>
                            <pre className="p-3 rounded text-xs overflow-auto max-h-48 bg-gray-100 text-gray-800 border border-gray-300 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700">
                              {formatJSON(log.old_values)}
                            </pre>
                          </div>
                        )}

                        {/* New Values */}
                        {log.new_values && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                              NEW Values
                            </h4>
                            <pre className="p-3 rounded text-xs overflow-auto max-h-48 bg-gray-100 text-gray-800 border border-gray-300 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700">
                              {formatJSON(log.new_values)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded border bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>

                {Array.from({ length: lastPage }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded border transition ${
                        currentPage === page
                          ? "bg-blue-500 border-blue-500 text-white dark:bg-blue-600 dark:border-blue-600"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(lastPage, currentPage + 1))
                  }
                  disabled={currentPage === lastPage}
                  className="px-4 py-2 rounded border bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}