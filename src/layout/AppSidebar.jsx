import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  List,
  Table,
  Box,
  FileText,
  User,
  Users,
  MoreHorizontal,
  ChevronDown,
  Eye,
  Plus,
  Upload,
  ChartBar,
} from "lucide-react";
import { useSidebar } from "../context/SidebarContext";

const navItems = [
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: <Calendar className="w-5 h-5" />,
    name: "Payment Records",
    path: "/payment-records",
  },
  { name: "Invoices", icon: <List className="w-5 h-5" />, path: "/invoices" },
  {
    name: "Delivery Orders",
    icon: <Table className="w-5 h-5" />,
    path: "/delivery-orders",
  },
  {
    name: "Debit Notes",
    icon: <Box className="w-5 h-5" />,
    path: "/debit-notes",
  },
];

const othersItems = [
  {
    name: "Credit Notes",
    icon: <Table className="w-5 h-5" />,
    path: "/credit-notes",
  },
  {
    name: "Account Statements",
    icon: <FileText className="w-5 h-5" />,
    path: "/account-statements",
  },
  { name: "Customers", icon: <User className="w-5 h-5" />, path: "/customers" },
  {
    name: "Admin Users",
    icon: <Users className="w-5 h-5" />,
    path: "/admin-users",
  },
  {
    name: "Administration",
    icon: <MoreHorizontal className="w-5 h-5" />,
    path: "/administration",
  },
];

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [subMenuHeight, setSubMenuHeight] = useState({});
  const subMenuRefs = useRef({});

  const isActive = useCallback(
    (path) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType,
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        const timeout = setTimeout(() => {
          setSubMenuHeight((prevHeights) => ({
            ...prevHeights,
            [key]: subMenuRefs.current[key]?.scrollHeight || 0,
          }));
        }, 0);
        return () => clearTimeout(timeout);
      }
    }
    if (openSubmenu === null) {
      setSubMenuHeight({});
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index, menuType) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const getSubItemIcon = (name) => {
    if (name.startsWith("View")) {
      return <Eye className="w-4 h-4" />;
    }
    if (name.startsWith("Add")) {
      return <Plus className="w-4 h-4" />;
    }
    if (name === "Batch Upload") {
      return <Upload className="w-4 h-4" />;
    }
    return null;
  };

  const renderMenuItems = (items, menuType) => (
    <ul className="flex flex-col gap-2">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`
                w-full group relative flex items-center gap-2.5 rounded-lg px-3 py-2.5 font-medium duration-300 ease-in-out
                ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                }
                ${!isExpanded && !isHovered ? "justify-center" : "justify-start"
                }
              `}
            >
              <span className={`flex-shrink-0`}>{nav.icon}</span>

              {(isExpanded || isHovered || isMobileOpen) && (
                <>
                  <span className="flex-grow text-left text-sm">
                    {nav.name}
                  </span>
                  <ChevronDown
                    className={`flex-shrink-0 w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType &&
                        openSubmenu?.index === index
                        ? "rotate-180 text-brand-600 dark:text-brand-400"
                        : ""
                      }`}
                  />
                </>
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`
                  group relative flex items-center gap-2.5 rounded-lg px-3 py-2.5 font-medium duration-300 ease-in-out
                  ${isActive(nav.path)
                    ? "bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                  }
                  ${!isExpanded && !isHovered
                    ? "justify-center"
                    : "justify-start"
                  }
                `}
              >
                <span className="flex-shrink-0">{nav.icon}</span>

                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="text-left text-sm">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-5 border-l border-gray-200 dark:border-gray-700">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`
                        group relative flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium duration-300 ease-in-out
                        ${isActive(subItem.path)
                          ? "text-brand-500 bg-brand-50 dark:bg-brand-500/10 dark:text-brand-400"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                        }
                      `}
                    >
                      <span
                        className={`flex-shrink-0 transition-colors duration-150 ${isActive(subItem.path)
                            ? "text-brand-500 dark:text-brand-400"
                            : "text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                          }`}
                      >
                        {getSubItemIcon(subItem.name)}
                      </span>
                      <span className="truncate">{subItem.name}</span>

                      {subItem.new && (
                        <span className="ml-auto rounded bg-brand-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                          new
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[250px]"
          : isHovered
            ? "w-[250px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${!isExpanded && !isHovered ? "justify-center" : "justify-start"
          }`}
      >
        <Link
          to="/"
          className={`flex items-center ${isExpanded || isHovered || isMobileOpen ? "gap-2" : "justify-center"
            }`}
        >
          {/* Icon */}
          <ChartBar className="h-8 w-8 p-1 bg-blue-600 text-white dark:text-black rounded" />

          {/* Text - Only visible when open or hovered */}
          {(isExpanded || isHovered || isMobileOpen) && (
            <span className="text-xl font-bold text-gray-900 dark:text-white truncate">
              BMI{" "}
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                – Modern Roofing Tech
              </span>
            </span>
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs font-semibold uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "justify-center" : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Business Management"
                ) : (
                  <MoreHorizontal className="w-6 h-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
            <div className="">
              <h2
                className={`mb-4 text-xs font-semibold uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "justify-center" : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "User & Financial"
                ) : (
                  <MoreHorizontal className="w-6 h-6" />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
