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
} from "lucide-react"; 
import { useSidebar } from "../context/SidebarContext";

type SubItem = {
  name: string;
  path: string;
  new?: boolean;
};

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: SubItem[];
};

const navItems: NavItem[] = [
  {
    icon: <LayoutDashboard />,
    name: "Dashboard",
       path: "/",

  },
  {
    icon: <Calendar />,
    name: "Payment Records",
    subItems: [
      { name: "View Payment Records", path: "/payment-records/view" },
      { name: "Add Payment Records", path: "/payment-records/add" },
      { name: "Batch Upload", path: "/payment-records/batch-upload" },
    ],
  },
  {
    name: "Invoices",
    icon: <List />,
    subItems: [
      { name: "View Invoices", path: "/invoices/view" },
      { name: "Add Invoices", path: "/invoices/add" },
      { name: "Batch Upload", path: "/invoices/batch-upload" },
    ],
  },
  {
    name: "Delivery Orders",
    icon: <Table />,
    subItems: [
      { name: "View Delivery Orders", path: "/delivery-orders/view" },
      { name: "Add Delivery Orders", path: "/delivery-orders/add" },
      { name: "Batch Upload", path: "/delivery-orders/batch-upload" },
    ],
  },
  {
    name: "Debit Notes",
    icon: <Box />,
    subItems: [
      { name: "View Debit Notes", path: "/debit-notes/view" },
      { name: "Add Debit Notes", path: "/debit-notes/add" },
      { name: "Batch Upload", path: "/debit-notes/batch-upload" },
    ],
  },
];

const othersItems: NavItem[] = [
  {
    name: "Credit Notes",
    icon: <Table />,
    subItems: [
      { name: "View Credit Notes", path: "/credit-notes/view" },
      { name: "Add Credit Notes", path: "/credit-notes/add" },
      { name: "Batch Upload", path: "/credit-notes/batch-upload" },
    ],
  },
  {
    name: "Account Statements",
    icon: <FileText />,
    subItems: [
      { name: "View Account Statements", path: "/account-statements/view" },
      { name: "Add Account Statements", path: "/account-statements/add" },
      { name: "Batch Upload", path: "/account-statements/batch-upload" },
    ],
  },
  {
    name: "Customers",
    icon: <User />,
    subItems: [
      { name: "View Customers", path: "/customers/view" },
      { name: "Add Customers", path: "/customers/add" },
      { name: "Batch Upload", path: "/customers/batch-upload" },
    ],
  },
  {
    name: "Admin Users",
    icon: <Users />,
    subItems: [
      { name: "View Admin Users", path: "/admin-users/view" },
      { name: "Add Admin Users", path: "/admin-users/add" },
      { name: "Batch Upload", path: "/admin-users/batch-upload" },
    ],
  },
  {
    name: "Administration",
    icon: <MoreHorizontal />,
    subItems: [
      { name: "View Administration", path: "/administration/view" },
      { name: "Add Administration", path: "/administration/add" },
      { name: "Batch Upload", path: "/administration/batch-upload" },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
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
                type: menuType as "main" | "others",
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

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
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
  
  const getSubItemIcon = (name: string): React.ReactNode => {
    if (name.startsWith("View")) {
      return <Eye />;
    }
    if (name.startsWith("Add")) {
      return <Plus />;
    }
    if (name === "Batch Upload") {
      return <Upload />;
    }
    return null; 
  };
  

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size  ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDown 
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
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
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item group ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      <span
                        className={`w-4 h-4 transition-colors duration-150 mr-1 ${
                          isActive(subItem.path) 
                            ? "text-white" 
                            : "text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                        }`}
                      >
                        {getSubItemIcon(subItem.name)}
                      </span>
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                      </span>
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
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Business Management"
                ) : (
                  <MoreHorizontal className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "User & Financial"
                ) : (
                  <MoreHorizontal className="size-6" />
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