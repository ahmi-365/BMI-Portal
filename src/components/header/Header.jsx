import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { canAccess } from "../../lib/permissionHelper";
import { ThemeToggleButton } from "../common/ThemeToggleButton";
import NotificationDropdown from "./NotificationDropdown";
import UserDropdown from "./UserDropdown";

const Header = ({ onClick, onToggle }) => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const navigate = useNavigate();
  // Define all available pages
  const pages = useMemo(
    () => [
      {
        name: "Dashboard",
        path: "/",
        category: "Dashboard",
        permission: "view-dashboard",
      },
      { name: "Profile", path: "/profile", category: "User" },

      // Admin Users
      {
        name: "Admin Users View",
        path: "/admin-users/view",
        category: "Admin",
        permission: "list-admins",
      },
      {
        name: "Admin Users Add",
        path: "/admin-users/add",
        category: "Admin",
        permission: "create-admins",
      },
      {
        name: "Admin Users Batch Upload",
        path: "/admin-users/batch-upload",
        category: "Admin",
        permission: "create-admins",
      },

      // Payment Records (routes use /payments)
      {
        name: "Payment Records View",
        path: "/payments/view",
        category: "Payment",
        permission: "list-payments",
      },
      {
        name: "Payment Records Add",
        path: "/payments/add",
        category: "Payment",
        permission: "create-payments",
      },
      {
        name: "Payment Records Batch Upload",
        path: "/payments/batch-upload",
        category: "Payment",
        permission: "create-payments",
      },

      // Invoices
      {
        name: "Invoices View",
        path: "/invoices/view",
        category: "Invoices",
        permission: "list-invoices",
      },
      {
        name: "Invoices Add",
        path: "/invoices/add",
        category: "Invoices",
        permission: "create-invoices",
      },
      {
        name: "Invoices Batch Upload",
        path: "/invoices/batch-upload",
        category: "Invoices",
        permission: "create-invoices",
      },

      // Delivery Orders (routes use /deliveryorders)
      {
        name: "Delivery Orders View",
        path: "/deliveryorders/view",
        category: "Delivery",
        permission: "list-delivery-orders",
      },
      {
        name: "Delivery Orders Add",
        path: "/deliveryorders/add",
        category: "Delivery",
        permission: "create-delivery-orders",
      },
      {
        name: "Delivery Orders Batch Upload",
        path: "/deliveryorders/batch-upload",
        category: "Delivery",
        permission: "create-delivery-orders",
      },

      // Debit Notes (routes use /debitnotes)
      {
        name: "Debit Notes View",
        path: "/debitnotes/view",
        category: "Debit Notes",
        permission: "list-debit-notes",
      },
      {
        name: "Debit Notes Add",
        path: "/debitnotes/add",
        category: "Debit Notes",
        permission: "create-debit-notes",
      },
      {
        name: "Debit Notes Batch Upload",
        path: "/debitnotes/batch-upload",
        category: "Debit Notes",
        permission: "create-debit-notes",
      },

      // Credit Notes (routes use /creditnotes)
      {
        name: "Credit Notes View",
        path: "/creditnotes/view",
        category: "Credit Notes",
        permission: "list-credit-notes",
      },
      {
        name: "Credit Notes Add",
        path: "/creditnotes/add",
        category: "Credit Notes",
        permission: "create-credit-notes",
      },
      {
        name: "Credit Notes Batch Upload",
        path: "/creditnotes/batch-upload",
        category: "Credit Notes",
        permission: "create-credit-notes",
      },

      // Account Statements (routes use both /account-statements and /statements)
      {
        name: "Account Statements View",
        path: "/account-statements/view",
        category: "Statements",
        permission: "list-statements",
      },
      {
        name: "Account Statements Add",
        path: "/account-statements/add",
        category: "Statements",
        permission: "create-statements",
      },
      {
        name: "Account Statements Batch Upload",
        path: "/account-statements/batch-upload",
        category: "Statements",
        permission: "create-statements",
      },

      // Customers
      {
        name: "Customers View",
        path: "/customers/view",
        category: "Customers",
        permission: "list-customers",
      },
      {
        name: "Customers Add",
        path: "/customers/add",
        category: "Customers",
        permission: "create-customers",
      },
      {
        name: "Customers Batch Upload",
        path: "/customers/batch-upload",
        category: "Customers",
        permission: "create-customers",
      },

      // Administration
      {
        name: "Administration View",
        path: "/administration/view",
        category: "Admin",
        permission: "list-roles",
      },
      {
        name: "Administration Add",
        path: "/administration/add",
        category: "Admin",
        permission: "create-roles",
      },
    ],
    [],
  );

  const availablePages = useMemo(
    () => pages.filter((page) => canAccess(page.permission)),
    [pages],
  );

  // Filter pages based on search query
  const filteredPages = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return availablePages.filter(
      (page) =>
        page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.category.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, availablePages]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchResults(value.trim() !== "");
  };

  const handlePageClick = (path) => {
    navigate(path);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  return (
    <header className="sticky top-0 flex w-full bg-white/80 backdrop-blur-xl border-gray-200 z-99999 dark:border-gray-800 dark:bg-gray-900/80 lg:border-b shadow-sm">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          <button
            className="block w-10 h-10 text-gray-500 lg:hidden dark:text-gray-400"
            onClick={onToggle}
          >
            {/* Hamburger Icon */}
            <svg
              className={`block`}
              width="16"
              height="12"
              viewBox="0 0 16 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
                fill="currentColor"
              />
            </svg>
            <svg
              className="hidden"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill="currentColor"
              />
            </svg>
            {/* Cross Icon */}
          </button>
          <button
            onClick={onClick}
            className="items-center justify-center hidden w-10 h-10 text-gray-500 border-gray-200 rounded-xl z-99999 dark:border-gray-800 lg:flex dark:text-gray-400 lg:h-11 lg:w-11 lg:border hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-brand-300 dark:hover:border-brand-600 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <svg
              className="hidden fill-current lg:block"
              width="16"
              height="12"
              viewBox="0 0 16 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
                fill=""
              />
            </svg>
          </button>

          <Link to="/" className="lg:hidden">
            <img
              className="dark:hidden"
              src="./images/logo/Logo.jpeg"
              alt="Logo"
            />
            <img
              className="hidden dark:block"
              src="./images./images/logo/Logo.jpeg"
              alt="Logo"
            />
          </Link>

          <button
            onClick={toggleApplicationMenu}
            className="flex items-center justify-center w-10 h-10 text-gray-700 rounded-xl z-99999 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.99902 10.4951C6.82745 10.4951 7.49902 11.1667 7.49902 11.9951V12.0051C7.49902 12.8335 6.82745 13.5051 5.99902 13.5051C5.1706 13.5051 4.49902 12.8335 4.49902 12.0051V11.9951C4.49902 11.1667 5.1706 10.4951 5.99902 10.4951ZM17.999 10.4951C18.8275 10.4951 19.499 11.1667 19.499 11.9951V12.0051C19.499 12.8335 18.8275 13.5051 17.999 13.5051C17.1706 13.5051 16.499 12.8335 16.499 12.0051V11.9951C16.499 11.1667 17.1706 10.4951 17.999 10.4951ZM13.499 11.9951C13.499 11.1667 12.8275 10.4951 11.999 10.4951C11.1706 10.4951 10.499 11.1667 10.499 11.9951V12.0051C10.499 12.8335 11.1706 13.5051 11.999 13.5051C12.8275 13.5051 13.499 12.8335 13.499 12.0051V11.9951Z"
                fill="currentColor"
              />
            </svg>
          </button>

          <div className="hidden lg:block">
            <div className="relative">
              <button className="absolute -translate-y-1/2 left-4 top-1/2">
                <svg
                  className="fill-gray-500 dark:fill-gray-400"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                    fill=""
                  />
                </svg>
              </button>
              <input
                type="text"
                placeholder="Search pages..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery && setShowSearchResults(true)}
                onBlur={() =>
                  setTimeout(() => setShowSearchResults(false), 200)
                }
                className="dark:bg-dark-900 h-11 w-full rounded-xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-brand-400 focus:outline-hidden focus:ring-4 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-500 dark:focus:ring-brand-900/30 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 xl:w-[430px]"
              />

              <button className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-gray-500 dark:border-gray-700 dark:from-gray-700 dark:to-gray-800 dark:text-gray-400 shadow-sm">
                <span> ⌘ </span>
                <span> K </span>
              </button>

              {/* Search Results Dropdown */}
              {showSearchResults && filteredPages.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl dark:bg-gray-900/95 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto animate-slideIn">
                  {filteredPages.map((page, index) => (
                    <button
                      key={index}
                      onClick={() => handlePageClick(page.path)}
                      className="w-full px-5 py-3.5 text-left hover:bg-gradient-to-r hover:from-brand-50 hover:to-transparent dark:hover:from-brand-900/20 dark:hover:to-transparent border-b border-gray-100 dark:border-gray-800 last:border-b-0 transition-all duration-200 first:rounded-t-2xl last:rounded-b-2xl group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                            {page.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {page.category}
                          </p>
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-brand-500 dark:group-hover:text-brand-400 group-hover:translate-x-1 transition-all duration-200"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* No Results Message */}
              {showSearchResults &&
                filteredPages.length === 0 &&
                searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl dark:bg-gray-900/95 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl z-50 p-6 text-center animate-slideIn">
                    <svg
                      className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No pages found for "{searchQuery}"
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>
        <div
          className={`${
            isApplicationMenuOpen ? "flex" : "hidden"
          } items-center justify-between w-full gap-4 px-5 py-4 lg:flex shadow-theme-md lg:justify-end lg:px-0 lg:shadow-none`}
        >
          <div className="flex items-center gap-2 2xsm:gap-3">
            {/* <!-- Dark Mode Toggler --> */}
            <ThemeToggleButton />
            {/* <!-- Dark Mode Toggler --> */}
            <NotificationDropdown />
            {/* <!-- Notification Menu Area --> */}
          </div>
          {/* <!-- User Area --> */}
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;
