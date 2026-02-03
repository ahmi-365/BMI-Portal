import {
  Activity,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Database,
  FileText,
  Filter,
  Search,
  User,
  XCircle
} from "lucide-react";
import { useEffect, useState } from "react";
// Adjust these imports to match your actual file structure
import Loader from "../../components/common/Loader";
import { formatDate } from "../../lib/dateUtils";
import { adminAPI } from "../../services/api";

export default function SystemLogsViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [expandedLogs, setExpandedLogs] = useState({});
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [date_from, setdate_from] = useState("");
  const [date_to, setdate_to] = useState("");
  
  // Applied filters
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    date_from: "",
    date_to: "",
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilters]);

  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage, appliedFilters]);

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      setError("");
      
      const params = { ...appliedFilters };
      const res = await adminAPI.logs(page, params);
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

  const handleApplyFilters = () => {
    setAppliedFilters({ search: searchQuery, date_from, date_to });
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setdate_from("");
    setdate_to("");
    setAppliedFilters({ search: "", date_from: "", date_to: "" });
  };

  // --- Date Logic Helpers ---
  
  // formats date as YYYY-MM-DD using local time
  const formatLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleQuickDate = (range) => {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);

    switch (range) {
        case 'today':
            // start/end are already now
            break;
        case 'yesterday':
            start.setDate(now.getDate() - 1);
            end.setDate(now.getDate() - 1);
            break;
        case '7d':
            start.setDate(now.getDate() - 7);
            break;
        case '30d':
            start.setDate(now.getDate() - 30);
            break;
        case 'thisMonth':
            start.setDate(1); // 1st of current month
            break;
        case 'lastMonth':
            start.setMonth(start.getMonth() - 1);
            start.setDate(1); // 1st of previous month
            
            end.setDate(0); // 0th of current month is last day of previous month
            break;
        default:
            return;
    }

    setdate_from(formatLocal(start));
    setdate_to(formatLocal(end));
  };

  const dateShortcuts = [
      { label: 'Today', value: 'today' },
      { label: 'Yesterday', value: 'yesterday' },
      { label: 'Last 7 Days', value: '7d' },
      { label: 'Last 30 Days', value: '30d' },
      { label: 'This Month', value: 'thisMonth' },
      { label: 'Last Month', value: 'lastMonth' },
  ];

  const toggleExpanded = (id) => {
    setExpandedLogs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatJSON = (data) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  // Helper: Extract clean model name for the badge
  const getModelLabel = (modelPath) => {
    if (!modelPath) return "SYSTEM";
    const name = modelPath.split('\\').pop();
    return name.replace(/([A-Z])/g, ' $1').trim();
  };

  // --- Extended Pagination Logic ---
  const getPaginationGroup = () => {
    if (lastPage <= 15) {
      return Array.from({ length: lastPage }, (_, i) => i + 1);
    }
    const pages = new Set();
    for (let i = 1; i <= 5; i++) pages.add(i);
    for (let i = 0; i < 5; i++) pages.add(lastPage - i);
    pages.add(currentPage);
    pages.add(currentPage - 1);
    pages.add(currentPage + 1);
    const sortedPages = Array.from(pages)
      .filter(p => p >= 1 && p <= lastPage)
      .sort((a, b) => a - b);

    const rangeWithDots = [];
    let l;
    for (const p of sortedPages) {
      if (l) {
        if (p - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (p - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(p);
      l = p;
    }
    return rangeWithDots;
  };

  const getActionStyle = (action) => {
    const act = action?.toLowerCase() || "";
    if (act.includes("delete") || act.includes("destroy") || act.includes("error") || act.includes("remove")) {
      return {
        badge: "bg-red-50 text-red-700 ring-1 ring-red-600/20 dark:bg-red-900/20 dark:text-red-300 dark:ring-red-400/30",
        icon: "text-red-500",
        border: "border-l-4 border-l-red-500"
      };
    }
    if (act.includes("create") || act.includes("store") || act.includes("add") || act.includes("success")) {
      return {
        badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-400/30",
        icon: "text-emerald-500",
        border: "border-l-4 border-l-emerald-500"
      };
    }
    return {
      badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 dark:bg-blue-900/20 dark:text-blue-300 dark:ring-blue-400/30",
      icon: "text-blue-500",
      border: "border-l-4 border-l-blue-500"
    };
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8  transition-colors duration-200 font-sans text-slate-900 dark:text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              System Audit Logs
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Track and analyze system modifications and user activity.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-1 overflow-hidden">
          <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
            <div className="md:col-span-4 space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                Search Query
              </label>
              <div className="relative group">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Filter by action, ID, or user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:text-white"
                />
              </div>
            </div>

            <div className="md:col-span-7 space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-2">
                 <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Date Range
                </label>
                {/* Quick Date Buttons */}
                <div className="flex gap-1 flex-wrap">
                    {dateShortcuts.map((btn) => (
                        <button
                            key={btn.value}
                            onClick={() => handleQuickDate(btn.value)}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors border border-transparent hover:border-indigo-200"
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={date_from}
                  onChange={(e) => setdate_from(e.target.value)}
                  onClick={(e) => e.target.showPicker?.()}
                  className="flex-1 w-full pl-3 pr-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
                />
                <span className="text-slate-400 text-sm font-medium">to</span>
                <input
                  type="date"
                  value={date_to}
                  onChange={(e) => setdate_to(e.target.value)}
                  onClick={(e) => e.target.showPicker?.()}
                  className="flex-1 w-full pl-3 pr-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
            </div>

            <div className="md:col-span-1 flex justify-end pb-0.5">
              <div className="flex items-center gap-2">
                 {(date_from || date_to || searchQuery) && (
                      <button
                        onClick={handleResetFilters}
                        title="Clear Filters"
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                 )}
                <button
                  onClick={handleApplyFilters}
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
             {error}
          </div>
        )}

        {/* List */}
        <div className={`relative transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          {!loading && logs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-full mb-4 ring-1 ring-slate-200 dark:ring-slate-700">
                <CalendarDays className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No logs found</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                Try clearing filters or selecting a wider date range.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {logs.map((log) => {
              const isExpanded = Boolean(expandedLogs[log.id]);
              const style = getActionStyle(log.action);
              const modelLabel = getModelLabel(log.model_type);
              
              return (
                <div
                  key={log.id}
                  className={`bg-white dark:bg-slate-900 rounded-xl border transition-all duration-200 overflow-hidden ${
                    isExpanded 
                      ? `shadow-lg border-indigo-200 dark:border-indigo-900 ring-1 ring-indigo-500/10` 
                      : `shadow-sm border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900`
                  }`}
                >
                  <div 
                    onClick={() => toggleExpanded(log.id)}
                    className={`flex flex-col md:flex-row md:items-center gap-4 p-4 cursor-pointer relative ${style.border}`}
                  >
                    <div className="flex items-center gap-3 min-w-[240px]">
                      {/* Icon */}
                      <div className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700`}>
                        <FileText className={`w-4 h-4 ${style.icon}`} />
                      </div>
                      
                      {/* Badge and Title */}
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            {/* Model Name Badge + ID */}
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${style.badge}`}>
                                {modelLabel} {log.model_id ? ` #${log.model_id}` : ''}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                             <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
                                {log.action}
                             </span>
                             <span className="font-mono text-xs text-slate-400">#{log.id}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <Database className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-mono text-xs tracking-tight">
                                {log.model_type}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{log.user?.name || "System"}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 min-w-[160px] pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 mt-2 md:mt-0">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDate(log.created_at)}
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-indigo-500" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <CodeIcon />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Payload Details</span>
                      </div>
                      <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner bg-[#1e1e1e]">
                        <div className="flex items-center justify-between px-4 py-1.5 bg-[#252526] border-b border-[#333]">
                           <span className="text-[10px] text-slate-400 font-mono">json</span>
                           <span className="text-[10px] text-slate-500">{log.new_values ? Object.keys(log.new_values).length : 0} keys</span>
                        </div>
                        <div className="p-4 overflow-x-auto">
                            <pre className="text-xs font-mono text-blue-100 leading-relaxed">
                                {log.new_values ? (
                                    <span dangerouslySetInnerHTML={{ 
                                        __html: formatJSON(log.new_values)
                                            .replace(/"([^"]+)":/g, '<span class="text-sky-300">"$1"</span>:')
                                            .replace(/: "([^"]+)"/g, ': <span class="text-emerald-300">"$1"</span>')
                                            .replace(/: ([0-9]+)/g, ': <span class="text-orange-300">$1</span>')
                                            .replace(/: (true|false)/g, ': <span class="text-purple-300">$1</span>')
                                            .replace(/: (null)/g, ': <span class="text-slate-500">$1</span>')
                                    }} />
                                ) : <span className="text-slate-500 italic">// No payload data available</span>}
                            </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 gap-4">
              
              <div className="text-sm text-slate-500 dark:text-slate-400 order-2 sm:order-1">
                Showing page <span className="font-semibold text-slate-900 dark:text-white">{currentPage}</span> of <span className="font-semibold text-slate-900 dark:text-white">{lastPage}</span>
              </div>

              <div className="flex items-center gap-1 order-1 sm:order-2 select-none">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 mr-1 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1 flex-wrap justify-center sm:justify-end">
                  {getPaginationGroup().map((item, index) => {
                    if (item === '...') {
                      return (
                        <span key={`dots-${index}`} className="px-2 text-slate-400 dark:text-slate-500 text-sm">
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={item}
                        onClick={() => setCurrentPage(item)}
                        className={`min-w-[32px] h-8 px-2 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                          currentPage === item
                            ? "bg-indigo-600 text-white border border-indigo-600 shadow-sm"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(lastPage, currentPage + 1))}
                  disabled={currentPage === lastPage}
                  className="p-2 ml-1 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CodeIcon() {
    return (
        <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
        </svg>
    );
}