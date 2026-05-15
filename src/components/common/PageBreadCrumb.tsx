import { Link } from "react-router";

interface BreadcrumbRoute {
  label: string;
  path?: string; // if missing → treated as current page
}

interface BreadcrumbProps {
  pageTitle: string;
  routes?: BreadcrumbRoute[];
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({
  pageTitle,
  routes,
}) => {
  // fallback breadcrumb if routes not provided
  const breadcrumbRoutes: BreadcrumbRoute[] =
    routes && routes.length > 0
      ? routes
      : [
          { label: "Home", path: "/" },
          { label: pageTitle },
        ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <nav>
        <ol className="flex items-center gap-1.5">
          {breadcrumbRoutes.map((route, index) => {
            const isLast = index === breadcrumbRoutes.length - 1;

            return (
              <li key={index} className="flex items-center gap-1.5">
                {route.path && !isLast ? (
                  <Link
                    to={route.path}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    {route.label}
                    <svg
                      className="stroke-current"
                      width="17"
                      height="16"
                      viewBox="0 0 17 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                ) : (
                  <span className="text-sm text-gray-800 dark:text-white/90">
                    {route.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};

export default PageBreadcrumb;
