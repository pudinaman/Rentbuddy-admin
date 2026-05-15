import React from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import RefundsTable from "../../components/tables/RefundsTable";

interface RefundsProps {
    allowedRoles?: string[];
}

const Refunds: React.FC<RefundsProps> = ({ allowedRoles }) => {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/80 via-white/60 to-white/30 p-5 shadow-[0_18px_35px_rgba(15,23,42,0.35)] backdrop-blur-2xl dark:from-slate-950/80 dark:via-slate-950/70 dark:to-slate-900/60 dark:border-white/5">
            <PageBreadcrumb pageTitle="Processed Payments & Refunds" />
            <div className="mt-4">
                <RefundsTable allowedRoles={allowedRoles} />
            </div>
        </div>
    );
};

export default Refunds;