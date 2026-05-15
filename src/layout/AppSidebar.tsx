import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

import {
  BoxCubeIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  UserCircleIcon,
  PaymentIcon,
  OrderIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: any[];
  allowedRoles?: string[];
};

/* ---------------------------------- MENU DATA ---------------------------------- */

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    icon: <GridIcon />,
    allowedRoles: [
      "admin",
      "customer manager",
      "order manager",
      "finance manager",
      "product manager",
    ],
    subItems: [
      {
        name: "Main Dashboard",
        path: "/",
        allowedRoles: [
          "admin",
          "customer manager",
          "order manager",
          "finance manager",
          "product manager",
        ],
      },
      {
        name: "Customers Dashboard",
        path: "/customers-dashboard",
        allowedRoles: ["admin", "customer manager"],
      },
      {
        name: "Orders Dashboard",
        path: "/orders-dashboard",
        allowedRoles: ["admin", "order manager"],
      },
      {
        name: "Products Dashboard",
        path: "/products-dashboard",
        allowedRoles: ["admin", "product manager"],
      },
      {
        name: "Billing Dashboard",
        path: "/billing-dashboard",
        allowedRoles: ["admin", "finance manager"],
      },
    ],
  },

  {
    name: "Customer Management",
    icon: <UserCircleIcon />,
    allowedRoles: ["admin", "customer manager"],
    subItems: [
      {
        name: "Customers",
        path: "/customers",
        allowedRoles: ["admin", "customer manager"],
      },
      {
        name: "Complaints",
        path: "/complaints",
        allowedRoles: ["admin", "customer manager"],
      },
      {
        name: "Defaulters",
        path: "/defaulters",
        allowedRoles: ["admin", "customer manager"],
      },
      {
        name: "Rent History",
        path: "/rent-history",
        allowedRoles: ["admin", "customer manager"],
      },
    ],
  },

  {
    name: "Order Management",
    icon: <OrderIcon />,
    allowedRoles: ["admin", "order manager"],
    subItems: [
      {
        name: "Orders",
        path: "/orders",
        allowedRoles: ["admin", "order manager"],
      },
      {
        name: "Subscriptions",
        path: "/subscriptions",
        allowedRoles: ["admin", "order manager"],
      },
      {
        name: "Refunds",
        path: "/refunds",
        allowedRoles: ["admin", "order manager"],
      },
      {
        name: "Repair",
        path: "/repair",
        allowedRoles: ["admin", "order manager"],
      },
    ],
  },

  {
    name: "Products & Inventory",
    icon: <BoxCubeIcon />,
    allowedRoles: ["admin", "product manager"],
    subItems: [
      {
        name: "Products",
        path: "/products",
        allowedRoles: ["admin", "product manager"],
      },
      {
        name: "Product Status Update",
        path: "/allproducts",
        allowedRoles: ["admin", "product manager"],
      },
      {
        name: "Packages",
        path: "/packages",
        allowedRoles: ["admin", "product manager"],
      },
      {
        name: "Barcode",
        path: "/barcode",
        allowedRoles: ["admin", "product manager"],
      },
      {
        name: "Track",
        path: "/track",
        allowedRoles: ["admin", "product manager"],
      },
    ],
  },

  {
    name: "Billing & Finance",
    icon: <PaymentIcon />,
    allowedRoles: ["admin", "finance manager"],
    subItems: [
      {
        name: "Payments",
        path: "/payments",
        allowedRoles: ["admin", "finance manager"],
      },
      {
        name: "Invoice",
        path: "/invoice",
        allowedRoles: ["admin", "finance manager"],
      },
      {
        name: "Documents",
        path: "/documents",
        allowedRoles: ["admin", "finance manager"],
      },
    ],
  },
];

const othersItems: NavItem[] = [];

/* ---------------------------------- SIDEBAR ---------------------------------- */

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered } = useSidebar();
  const location = useLocation();

  /* 🔥 Role state moved inside component now works on login/logout instantly */
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    setUserRole(u?.role?.toLowerCase() || "");
  }, []);

  useEffect(() => {
    const syncRole = () => {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      setUserRole(u?.role?.toLowerCase() || "");
    };
    window.addEventListener("storage", syncRole);
    return () => window.removeEventListener("storage", syncRole);
  }, []);

  const canAccess = (roles?: string[]) =>
    !roles || roles.includes(userRole) || userRole === "admin";

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (p: string) => location.pathname === p,
    [location.pathname]
  );

  useEffect(() => {
    let match = false;
    ["main", "others"].forEach((type) => {
      const list = type === "main" ? navItems : othersItems;
      list.forEach((nav, idx) => {
        if (nav.subItems) {
          nav.subItems.forEach((s: any) => {
            if (isActive(s.path)) {
              setOpenSubmenu({ type: type as "main" | "others", index: idx });
              match = true;
            }
          });
        }
      });
    });
    if (!match) setOpenSubmenu(null);
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((p) => ({
          ...p,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const toggle = (i: number, t: "main" | "others") =>
    setOpenSubmenu((prev) =>
      prev && prev.index === i && prev.type === t ? null : { type: t, index: i }
    );

  const renderMenuItems = (items: NavItem[], type: "main" | "others") => (
    <ul className="flex flex-col gap-3">
      {items
        .filter((n) => canAccess(n.allowedRoles))
        .map((nav, index) => (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => toggle(index, type)}
                className={`menu-item group ${openSubmenu?.type === type && openSubmenu?.index === index
                    ? "menu-item-active"
                    : "menu-item-inactive"
                  } cursor-pointer ${!isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                  }`}
              >
                <span
                  className={`menu-item-icon-size ${openSubmenu?.type === type && openSubmenu?.index === index
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
                  <ChevronDownIcon
                    className={`ml-auto h-5 w-5 duration-200 ${openSubmenu?.type === type && openSubmenu?.index === index
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
                  className={`menu-item group ${isActive(nav.path)
                      ? "menu-item-active"
                      : "menu-item-inactive"
                    }`}
                >
                  <span
                    className={`menu-item-icon-size ${isActive(nav.path)
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
                  subMenuRefs.current[`${type}-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height:
                    openSubmenu?.type === type && openSubmenu?.index === index
                      ? `${subMenuHeight[`${type}-${index}`]}px`
                      : "0px",
                }}
              >
                <ul className="mt-2 ml-9 space-y-1">
                  {nav.subItems
                    .filter((s) => canAccess(s.allowedRoles))
                    .map((s: any) => (
                      <li key={s.name}>
                        <Link
                          to={s.path}
                          className={`menu-dropdown-item ${isActive(s.path)
                              ? "menu-dropdown-item-active"
                              : "menu-dropdown-item-inactive"
                            }`}
                        >
                          {s.name}
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
      className={`fixed top-0 left-0 z-50 mt-16 flex h-screen flex-col px-5 border-r border-slate-300
      bg-gradient-to-b from-white/80 via-white/70 to-white/40 dark:border-white/10 dark:from-slate-950/90 dark:via-slate-950/80 dark:to-slate-900/70
      transition-all duration-300 text-slate-900 dark:text-slate-100
      ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
      ${isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:mt-0`}
    >
      <div
        className={`flex py-8 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <h1 className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-transparent dark:text-white bg-clip-text text-2xl font-bold tracking-[0.18em]">
              RENTBUDDY
            </h1>
          ) : (
            <h1 className="text-2xl font-bold tracking-[0.18em] text-slate-900 dark:text-slate-50 text-center">
              RB
            </h1>
          )}
        </Link>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto no-scrollbar pb-6 pr-1">
        <nav className="mb-6">
          <div className="flex flex-col gap-5">
            <div>
              <h2
                className={`mb-3 flex text-xs uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 ${!isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
