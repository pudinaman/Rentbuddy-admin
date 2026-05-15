import OrderTableOne from "../../components/tables/OrderTableOne";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Link } from "react-router";
import { Plus } from "lucide-react";

interface OrdersProps {
  allowedRoles?: string[];
}

const Orders: React.FC<OrdersProps> = ({ allowedRoles }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/80 via-white/60 to-white/30 p-5 shadow-[0_18px_35px_rgba(15,23,42,0.35)] backdrop-blur-2xl dark:from-slate-950/80 dark:via-slate-950/70 dark:to-slate-900/60 dark:border-white/5">
      {/* Ambient glow accents */}

      <div className="flex justify-between items-center mb-6">
        <div className="mt-6">
          <PageBreadcrumb pageTitle="Order" />
        </div>
        <Link
          to="/orders/create"
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Create Order
        </Link>
      </div>

      <OrderTableOne allowedRoles={allowedRoles} />
    </div>
  );
};

export default Orders;
