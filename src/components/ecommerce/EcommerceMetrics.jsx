import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";

export default function EcommerceMetrics() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 animate-fadeIn">
      {/* <!-- Metric Item Start --> */}
      <div className="group relative rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 dark:border-gray-800 dark:from-gray-900 dark:to-gray-900/50 md:p-6 hover:shadow-2xl hover:border-brand-300 dark:hover:border-brand-600 transition-all duration-300 cursor-pointer overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/0 to-brand-500/0 group-hover:from-brand-500/5 group-hover:to-transparent transition-all duration-500"></div>
        <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-brand-100 to-brand-50 rounded-xl dark:from-brand-900/30 dark:to-brand-800/20 group-hover:scale-110 transition-transform duration-300">
          <GroupIcon className="text-brand-600 size-6 dark:text-brand-400 group-hover:scale-110 transition-transform duration-300" />
        </div>

        <div className="relative flex items-end justify-between mt-5">
          <div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Customers
            </span>
            <h4 className="mt-2 font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent text-title-sm group-hover:scale-105 transition-transform duration-300 inline-block">
              3,782
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            11.01%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="group relative rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 dark:border-gray-800 dark:from-gray-900 dark:to-gray-900/50 md:p-6 hover:shadow-2xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 cursor-pointer overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-transparent transition-all duration-500"></div>
        <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl dark:from-blue-900/30 dark:to-blue-800/20 group-hover:scale-110 transition-transform duration-300">
          <BoxIconLine className="text-blue-600 size-6 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
        </div>
        <div className="relative flex items-end justify-between mt-5">
          <div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Orders
            </span>
            <h4 className="mt-2 font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent text-title-sm group-hover:scale-105 transition-transform duration-300 inline-block">
              5,359
            </h4>
          </div>

          <Badge color="error">
            <ArrowDownIcon />
            9.05%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
}
