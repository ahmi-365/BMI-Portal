import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminNotificationsAPI } from "../../services/api";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const hasUnread = unreadCount > 0;

  // Normalizes data to ensure every notification has a boolean 'read' status
  const hydrateNotifications = (data) => {
    const unreadIds = (data?.unread_notifications || []).map((n) => n.id);
    const list = data?.notifications || [];
    return list.map((n) => ({
      ...n,
      read: n.read_at !== null || !unreadIds.includes(n.id),
    }));
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminNotificationsAPI.list();
      const data = res?.data || res;
      const normalized = hydrateNotifications(data);
      const unreadIds = (data?.unread_notifications || []).map((n) => n.id);
      
      setNotifications(normalized);
      setUnreadCount(unreadIds.length);
    } catch (err) {
      console.error("Error fetching notifications", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

const handleNotificationClick = async (notification) => {
    // 1. Mark as read logic (API Call)
    if (!notification.read) {
      try {
        await adminNotificationsAPI.markAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Error marking notification as read", err);
      }
    }

    // 2. UI Actions
    closeDropdown();

    // 3. Specific Redirection to Payments page
    navigate("/payments"); 
  };

  const handleMarkAllAsRead = async () => {
    const ids = notifications.filter((n) => !n.read).map((n) => n.id);
    if (ids.length === 0) return;
    try {
      await adminNotificationsAPI.markAllAsRead(ids);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read", err);
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={toggleDropdown}
      >
        {hasUnread && (
          <span className="absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 flex">
            <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
          </span>
        )}
        <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20">
          <path d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z" fill="currentColor"/>
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex max-h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Notifications</h5>
          <div className="flex items-center gap-2">
            {hasUnread && (
              <button onClick={handleMarkAllAsRead} className="text-sm text-brand-600 dark:text-brand-400 hover:underline">
                Mark all as read
              </button>
            )}
            <button onClick={closeDropdown} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
              <svg width="24" height="24" viewBox="0 0 24 24"><path fillRule="evenodd" d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z" fill="currentColor"/></svg>
            </button>
          </div>
        </div>

        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {!loading && error && (
            <li className="px-4 py-6 text-sm text-red-600 text-center">{error}</li>
          )}
          {!loading && !error && notifications.length === 0 && (
            <li className="px-4 py-6 text-sm text-gray-500 text-center">No notifications</li>
          )}
          {!loading && !error && notifications.map((notification) => (
            <li key={notification.id}>
              <DropdownItem
                onItemClick={() => handleNotificationClick(notification)}
                className={`flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 ${
                  notification.read
                    ? "opacity-60"
                    : "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-brand-500"
                }`}
              >
                <span className="block flex-1">
                  <span className={`mb-1 block text-theme-sm ${notification.read ? "text-gray-600 font-normal" : "text-gray-900 font-semibold dark:text-white"}`}>
                    {notification.data?.message || "New Notification"}
                  </span>
                  <span
                    className={`block text-sm ${notification.read ? "text-gray-400" : "text-gray-600 dark:text-gray-300"}`}
                    dangerouslySetInnerHTML={{ __html: notification.data?.description || "" }}
                  />
                  {notification.created_at && (
                    <span className="block text-xs text-gray-400 mt-1">
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                  )}
                </span>
                {!notification.read && (
                  <span className="w-2.5 h-2.5 mt-1 rounded-full bg-brand-500 flex-shrink-0 animate-pulse"></span>
                )}
              </DropdownItem>
            </li>
          ))}
        </ul>
      </Dropdown>
    </div>
  );
}