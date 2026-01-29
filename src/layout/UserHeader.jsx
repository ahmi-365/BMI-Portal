import { Bell, ChartBar, LogOut, User } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
import { useSidebar } from "../context/SidebarContext";
import { userNotificationsAPI } from "../services/api";
import { userAuth } from "../services/auth";

const UserHeader = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  // Refs
  const profileDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);

  // --- Notification Routing Logic ---
  const NOTIFICATION_ROUTES = {
    'App\\Notifications\\NewInvoiceAdded': '/user/invoices',
    'App\\Notifications\\NewCreditNoteAdded': '/user/credit-notes',
    'App\\Notifications\\NewPpiAdded': '/user/ppi',
    'App\\Notifications\\NewDeliveryOrderAdded': '/user/delivery-orders',
    'App\\Notifications\\PaymentApproved': '/user/payments',
    // Mapped based on standard naming conventions if they arise later:
    'App\\Notifications\\NewDebitNoteAdded': '/user/debit-notes', 
    'App\\Notifications\\NewStatementAdded': '/user/statements',
  };

  const handleNotificationClick = (notification) => {
    // 1. Mark as read immediately if unread
    if (!notification.read_at) {
      handleMarkAsRead(notification.id);
    }

    // 2. Check if we have a mapped route for this notification type
    const targetPath = NOTIFICATION_ROUTES[notification.type];

    if (targetPath) {
      navigate(targetPath);
      setIsNotificationDropdownOpen(false);
      return;
    }

    // 3. Fallback: Use the API provided action_url if type isn't mapped
    if (notification.data?.action_url) {
      try {
        let urlStr = notification.data.action_url;
        // If it's an absolute URL (e.g. includes domain), strip it to keep SPA navigation
        if (urlStr.startsWith('http')) {
          const url = new URL(urlStr);
          urlStr = url.pathname + url.search + url.hash;
        }
        
        // Ensure path starts with /
        if (!urlStr.startsWith('/')) {
            urlStr = '/' + urlStr;
        }

        navigate(urlStr);
        setIsNotificationDropdownOpen(false);
      } catch (e) {
        console.error("Invalid Notification URL", e);
        // Fallback to dashboard if URL parsing fails
        navigate('/user/dashboard');
        setIsNotificationDropdownOpen(false);
      }
    }
  };
  // ----------------------------------

  // Define user pages
  const pages = useMemo(
    () => [
      { name: "Dashboard", path: "/user/dashboard", category: "Dashboard" },
      { name: "Profile", path: "/user/profile", category: "User" },
      { name: "Edit Profile", path: "/user/profile/edit", category: "User" },
      { name: "Invoices", path: "/user/invoices", category: "Documents" },
      {
        name: "Delivery Orders",
        path: "/user/delivery-orders",
        category: "Documents",
      },
      { name: "Debit Notes", path: "/user/debit-notes", category: "Documents" },
      {
        name: "Credit Notes",
        path: "/user/credit-notes",
        category: "Documents",
      },
      {
        name: "Account Statements",
        path: "/user/statements",
        category: "Documents",
      },
      {
        name: "Payments",
        path: "/user/payments",
        category: "Documents",
      },
      {
        name: "Add Payment",
        path: "/user/payments/add",
        category: "Documents",
      },
      {
        name: "PPI",
        path: "/user/ppi",
        category: "Documents",
      },
    ],
    []
  );

  // Filter pages based on search query
  const filteredPages = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return pages.filter(
      (page) =>
        page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, pages]);

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const handleLogout = () => {
    try {
      userAuth.clear();
      navigate("/user/login", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

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

  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target)
      ) {
        setIsNotificationDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await userNotificationsAPI.list();
        const data = response?.data || response;
        setNotifications(data?.notifications || []);
        setUnreadCount(data?.unread_notifications?.length || 0);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await userNotificationsAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await userNotificationsAPI.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Refs for search
  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setShowSearchResults(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click Outside Logic for search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 flex w-full bg-white/80 backdrop-blur-xl border-b border-gray-200 z-50 dark:border-gray-800 dark:bg-gray-900/80 shadow-sm">
      <div className="flex items-center justify-between w-full px-4 lg:px-6 py-3">
        {/* Left Section: Toggle + Search */}
        <div className="flex items-center gap-4 flex-1">
          {/* Sidebar Toggle Button */}
          <button
            className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-all duration-200 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
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
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
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
            )}
          </button>

          {/* Mobile Logo */}
          <Link to="/user/dashboard" className="flex items-center gap-2 lg:hidden">
            <ChartBar className="h-8 w-8 p-1 bg-gradient-to-br from-brand-600 to-brand-500 text-white rounded-lg shadow-md" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              BMI
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:block flex-1 max-w-xl">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="relative" ref={searchContainerRef}>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className="fill-gray-400 dark:fill-gray-500"
                    width="18"
                    height="18"
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
                </span>

                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search pages..."
                  className="h-10 w-full rounded-xl border-2 border-gray-200 bg-white/70 py-2 pl-10 pr-20 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-800/70 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-600"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setShowSearchResults(true)}
                />

                {showSearchResults && filteredPages.length > 0 && (
                  <div className="absolute z-50 top-full left-0 w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl mt-2 shadow-xl max-h-96 overflow-y-auto animate-slideIn">
                    <ul className="py-2">
                      {filteredPages.map((page) => (
                        <li key={page.path}>
                          <Link
                            to={page.path}
                            className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700 dark:text-gray-200 dark:hover:bg-brand-900/20 dark:hover:text-brand-200 transition-all duration-150"
                            onClick={() => {
                              setShowSearchResults(false);
                              setSearchQuery("");
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-brand-500"></div>
                              {page.name}
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-lg border border-gray-300 bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400">
                  <span>⌘</span>
                  <span>K</span>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggleButton />

          {/* Notifications Dropdown */}
          <div className="relative " ref={notificationDropdownRef}>
            <button
              onClick={() =>
                setIsNotificationDropdownOpen(!isNotificationDropdownOpen)
              }
              className="relative inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 bg-white text-gray-600 hover:text-gray-900 transition-all duration-200 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1  -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Menu */}
            {isNotificationDropdownOpen && (
              <div className=" absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50">
                <div className="sticky top-0  bg-white dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="py-1 ">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center ">
                      <Bell className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No notifications
                      </p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                          !notification.read_at
                            ? "bg-blue-50/50 dark:bg-blue-900/10"
                            : ""
                        }`}
                      >
                        <div className="flex items-start gap-3 overflow-hidden">
                          {!notification.read_at && (
                            <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0"></div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.data?.message || "Notification"}
                            </p>
                            <div
                              className="text-xs text-gray-500 dark:text-gray-400 mt-1"
                              dangerouslySetInnerHTML={{
                                __html:
                                  notification.data?.description ||
                                  notification.data?.message ||
                                  "",
                              }}
                            />
                            {notification.created_at && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                {new Date(
                                  notification.created_at
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="inline-flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-all duration-200 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">My Account</span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  isProfileDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50">
                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate("/user/profile");
                      setIsProfileDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-700"></div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsProfileDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default UserHeader;