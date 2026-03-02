import CustomerTableOne from "../../components/tables/CustomerTableOne";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

interface CustomersProps {
  allowedRoles?: string[];
}

const Customers: React.FC<CustomersProps> = ({ allowedRoles }) => {
  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/80 via-white/60 to-white/30 p-5 shadow-[0_18px_35px_rgba(15,23,42,0.35)] backdrop-blur-2xl dark:from-slate-950/80 dark:via-slate-950/70 dark:to-slate-900/60 dark:border-white/5">
        {/* Ambient glow accents */}

        <PageBreadcrumb pageTitle="Customer" />
        <CustomerTableOne allowedRoles={allowedRoles} />
      </div>
    </>
  );
};

export default Customers;
