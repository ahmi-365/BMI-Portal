import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const PageBreadcrumb = ({ pageTitle, breadcrumbs }) => {
  // breadcrumbs is optional array of {label, path}
  const items = breadcrumbs || [];

  return (
    <div className="mb-6 flex flex-col gap-4">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2">
        <ol className="flex items-center gap-1 text-sm">
          <li>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
            >
              <Home className="w-4 h-4" />
              <span className="font-medium">Home</span>
            </Link>
          </li>
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-1">
              <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-600" />
              {item.path ? (
                <Link
                  to={item.path}
                  className="inline-flex px-3 py-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="inline-flex px-3 py-1.5 rounded-lg text-gray-900 font-medium dark:text-white">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Page Title */}
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
        {pageTitle}
      </h2>
    </div>
  );
};

export default PageBreadcrumb;
