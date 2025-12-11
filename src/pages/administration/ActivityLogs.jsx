import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import Loader from "../../components/common/Loader";

export default function SystemLogsViewer() {
  const { isDarkMode } = useTheme();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedLogs, setExpandedLogs] = useState({});
  const logsPerPage = 10;

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/system-logs");

      if (!response.ok) {
        throw new Error("Failed to fetch logs");
      }

      const data = await response.json();
      setLogs(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setError(err.message || "An error occurred while fetching logs.");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (logIndex) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [logIndex]: !prev[logIndex],
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

  // Pagination
  const totalPages = Math.ceil(logs.length / logsPerPage);
  const startIndex = (currentPage - 1) * logsPerPage;
  const paginatedLogs = logs.slice(startIndex, startIndex + logsPerPage);

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <Loader />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-6 ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className={`text-3xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            System Logs
          </h1>
          <p
            className={`text-sm mt-2 ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            View and monitor system activity logs.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded bg-red-100 border border-red-400 text-red-700">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && logs.length === 0 && (
          <div
            className={`text-center py-12 rounded-lg ${
              isDarkMode
                ? "bg-gray-800 text-gray-400"
                : "bg-white text-gray-600"
            }`}
          >
            <p className="text-lg">No system logs available.</p>
          </div>
        )}

        {/* Logs */}
        {logs.length > 0 && (
          <>
            <div className="space-y-4">
              {paginatedLogs.map((log, index) => {
                const logNumber = logs.length - (startIndex + index);
                const isExpanded = expandedLogs[startIndex + index];

                return (
                  <div
                    key={startIndex + index}
                    className={`rounded-lg border ${
                      isDarkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    } overflow-hidden`}
                  >
                    {/* Log Header */}
                    <button
                      onClick={() => toggleExpanded(startIndex + index)}
                      className={`w-full p-4 flex items-center justify-between hover:${
                        isDarkMode ? "bg-gray-700" : "bg-gray-50"
                      } transition`}
                    >
                      <div className="flex items-center flex-1 text-left">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                            isDarkMode
                              ? "bg-blue-900 text-blue-300"
                              : "bg-blue-100 text-blue-600"
                          } font-semibold text-sm`}
                        >
                          #{logNumber}
                        </div>
                        <div>
                          <p
                            className={`font-medium ${
                              isDarkMode ? "text-white" : "text-gray-800"
                            }`}
                          >
                            {log.description || "System Activity"}
                          </p>
                          <p
                            className={`text-xs ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {log.tableName && `Table: ${log.tableName}`}
                            {log.createdBy && ` • By: ${log.createdBy}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {formatDate(log.createdAt)}
                        </span>
                        {isExpanded ? (
                          <ChevronUp
                            className={`w-5 h-5 ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          />
                        ) : (
                          <ChevronDown
                            className={`w-5 h-5 ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          />
                        )}
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div
                        className={`border-t ${
                          isDarkMode ? "border-gray-700" : "border-gray-200"
                        } p-4 space-y-4`}
                      >
                        {/* Old Data */}
                        {(log.oldData || log.old) && (
                          <div>
                            <h4
                              className={`text-sm font-semibold mb-2 ${
                                isDarkMode ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              OLD Data
                            </h4>
                            <pre
                              className={`p-3 rounded text-xs overflow-auto max-h-48 ${
                                isDarkMode
                                  ? "bg-gray-900 text-gray-300 border border-gray-700"
                                  : "bg-gray-100 text-gray-800 border border-gray-300"
                              }`}
                            >
                              {formatJSON(log.oldData || log.old)}
                            </pre>
                          </div>
                        )}

                        {/* New Data */}
                        {(log.newData || log.new) && (
                          <div>
                            <h4
                              className={`text-sm font-semibold mb-2 ${
                                isDarkMode ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              NEW Data
                            </h4>
                            <pre
                              className={`p-3 rounded text-xs overflow-auto max-h-48 ${
                                isDarkMode
                                  ? "bg-gray-900 text-gray-300 border border-gray-700"
                                  : "bg-gray-100 text-gray-800 border border-gray-300"
                              }`}
                            >
                              {formatJSON(log.newData || log.new)}
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
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded border ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  } disabled:opacity-50 disabled:cursor-not-allowed transition`}
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded border transition ${
                        currentPage === page
                          ? isDarkMode
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "bg-blue-500 border-blue-500 text-white"
                          : isDarkMode
                          ? "bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded border ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  } disabled:opacity-50 disabled:cursor-not-allowed transition`}
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
