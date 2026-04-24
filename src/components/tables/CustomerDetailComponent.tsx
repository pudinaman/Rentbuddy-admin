import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { customerService } from "../../services/customerService";
import { invoiceService } from "../../services/invoiceService";
import { toast } from "react-toastify";
import Avatar from "../ui/avatar/Avatar";
import {
    User,
    ShoppingBag,
    FileText,
    History,
    Clock,
    MessageSquare,
    Wrench,
    CreditCard,
    ChevronRight,
    Calendar,
    Package,
    Activity,
    Eye
} from "lucide-react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import ModalWrapper from "../../layout/ModalWrapper";

const CustomerDetailComponent: React.FC<{ allowedRoles?: string[] }> = ({ allowedRoles }) => {
    const { customerId } = useParams<{ customerId: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("overview");
    const [loadingInvoiceId, setLoadingInvoiceId] = useState<string | null>(null);
    const [docTarget, setDocTarget] = useState<any | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const userRaw = localStorage.getItem("user");
    const currentUser = userRaw ? JSON.parse(userRaw) : null;
    const canViewDetails = !allowedRoles || allowedRoles.includes(currentUser?.role?.toLowerCase());

    // Fetch basic profile and summary (always loaded)
    const { data: profileData, isLoading: profileLoading, isError: profileError } = useQuery({
        queryKey: ["customer-profile", customerId],
        queryFn: () => customerService.getCustomerById(customerId!),
        enabled: !!customerId,
    });

    // Fetch orders (only when orders tab is active)
    const { data: ordersData, isLoading: ordersLoading } = useQuery({
        queryKey: ["customer-orders", customerId],
        queryFn: () => customerService.getCustomerOrders(customerId!),
        enabled: !!customerId && activeTab === "orders",
    });
    console.log(ordersData);
    // Fetch payments & subscription timelines (only when payments tab is active)
    const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
        queryKey: ["customer-payments", customerId],
        queryFn: () => customerService.getCustomerPayments(customerId!),
        enabled: !!customerId && (activeTab === "payments" || activeTab === "orders"),
    });

    const handleViewInvoice = async (invoiceId: string) => {
        if (loadingInvoiceId) return;

        try {
            setLoadingInvoiceId(invoiceId);
            // Pre-fetch to ensure it exists and is in React Query cache
            await invoiceService.getInvoiceById(invoiceId);
            navigate(`/invoice/${invoiceId}`);
        } catch (error) {
            console.error("Failed to pre-fetch invoice:", error);
            toast.error("Unable to load invoice details. Please try again.");
        } finally {
            setLoadingInvoiceId(null);
        }
    };
    // Fetch rentals (only when rentals tab is active)
    const { data: rentalsData, isLoading: rentalsLoading } = useQuery({
        queryKey: ["customer-rentals", customerId],
        queryFn: () => customerService.getCustomerRentals(customerId!),
        enabled: !!customerId && activeTab === "rentals",
    });

    // Fetch support & repairs (only when support tab is active)
    const { data: supportData, isLoading: supportLoading } = useQuery({
        queryKey: ["customer-support", customerId],
        queryFn: () => customerService.getCustomerSupport(customerId!),
        enabled: !!customerId && activeTab === "support",
    });

    if (profileLoading) {
        return (
            <div className="space-y-6">
                <div className="h-32 animate-pulse rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />
                <div className="h-96 animate-pulse rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />
            </div>
        );
    }

    if (profileError || !profileData?.success || !canViewDetails) {
        return (
            <div className="mt-4 rounded-2xl border border-rose-300/60 bg-rose-50/80 p-6 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-950/30 dark:text-rose-100">
                {!canViewDetails ? "Access Denied: You are not allowed to view these details." : "Unable to load customer details."}
            </div>
        );
    }

    const { profile, summary } = profileData.data;

    // Extract data from modular endpoints
    const orders = ordersData?.data || [];
    const { payments = [], invoices = [], subscriptionTimelines = [] } = paymentsData?.data || {};
    const { history: rentalHistory = [], active: rentalProducts = [] } = rentalsData?.data || {};
    const { queries = [], repairs = [] } = supportData?.data || {};

    const tabs = [
        { id: "overview", label: "Overview", icon: User },
        { id: "orders", label: "Orders & Invoices", icon: ShoppingBag },
        { id: "rentals", label: "Rentals & History", icon: History },
        { id: "payments", label: "Payment Timeline", icon: Clock },
        { id: "support", label: "Support", icon: MessageSquare },
    ];

    const StatCard = ({ label, value, icon: Icon }: any) => (
        <div className="relative overflow-hidden rounded-2xl border border-white/40 bg-white/60 p-4 shadow-sm backdrop-blur-md dark:border-white/5 dark:bg-slate-900/40">
            <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-opacity-10 dark:bg-opacity-20 transition-transform`}>
                    <Icon className={`h-5 w-5`} />
                </div>
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</p>
                    <p className="text-xl font-black text-slate-900 dark:text-slate-50">{value}</p>
                </div>
            </div>
        </div>
    );

  const renderPreview = () => {
    if (!preview) return null;
    const isPDF = preview.includes("/raw/") || preview.toLowerCase().endsWith(".pdf");
    if (isPDF) {
      const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(preview)}&embedded=true`;
      return <iframe src={viewerUrl} className="w-full h-[60vh] rounded-lg border" frameBorder="0" />;
    }
    return <img src={preview} alt="Document" className="w-full rounded-lg" />;
  };

  const TabLoadingState = () => (
    <div className="space-y-4">
      <div className="h-32 animate-pulse rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />
      <div className="h-48 animate-pulse rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />
      <div className="h-32 animate-pulse rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />
    </div>
  );

    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/80 via-white/60 to-white/30 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.35)] backdrop-blur-2xl dark:from-slate-950/80 dark:via-slate-950/70 dark:to-slate-900/60 dark:border-white/5">
            {/* Ambient glow accents */}
            <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-transparent blur-3xl" />
            <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-gradient-to-tr from-emerald-400/15 via-cyan-400/15 to-transparent blur-3xl" />

            <div className="mt-4 space-y-6">
                {/* Action Bar */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate("/customers")}
                        className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-white hover:-translate-y-[1px] dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-900"
                    >
                        <ChevronRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-1" />
                        <span>Back to Customers</span>
                    </button>
                </div>

                {/* Summary Header */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <StatCard label="Total Orders" value={summary.totalOrders} icon={ShoppingBag} />
                    <StatCard label="Total Payments" value={summary.totalPayments} icon={CreditCard} />
                    <StatCard label="Active Subs" value={summary.activeSubscriptions} icon={Activity} />
                    <StatCard label="Active Rentals" value={summary.activeRentals} icon={Package} />
                    <StatCard label="Total Queries" value={summary.totalQueries} icon={MessageSquare} />
                </div>

                {/* Profile Overview Card */}
                <div className="relative overflow-hidden rounded-[2.5rem] border border-white/20 bg-gradient-to-br from-white/95 via-white/80 to-white/50 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] backdrop-blur-3xl dark:from-slate-950/95 dark:via-slate-950/80 dark:to-slate-900/70 dark:border-white/5">
                    <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                        <div className="relative group">

                            <Avatar
                                src={profile.profilePic}
                                alt={profile.username}
                                nameForInitials={profile.username}
                                size={100}
                            />

                        </div>
                        <div className="flex-1 space-y-5">
                            <div className="text-center md:text-left">
                                <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-none mb-1">{profile.username}</h2>
                                <p className="text-xs font-bold text-blue-500/80 uppercase tracking-widest">Customer ID: <span className="font-mono">#{profile.customerId}</span></p>
                            </div>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                                <div className="group flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <span className="font-medium">{profile.email}</span>
                                </div>
                                <div className="group flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30">
                                        <Activity className="h-4 w-4" />
                                    </div>
                                    <span className="font-medium">{profile.phone || "No Phone"}</span>
                                </div>
                                <div className="group flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-900/30">
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    <span className="font-medium">Joined: {new Date(profile.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Tabs */}
                <div className="space-y-6">
                    <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 whitespace-nowrap rounded-2xl px-5 py-3 mt-4 mb-4 text-sm font-bold transition-all duration-300 ${activeTab === tab.id
                                        ? "bg-blue-600 text-white translate-y-[-2px]"
                                        : "bg-white/40 text-slate-500 hover:bg-white/80 hover:text-blue-600 dark:bg-slate-900/40 dark:text-slate-500 dark:hover:bg-slate-800"
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="min-h-[400px]">
                        {activeTab === "overview" && (
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <div className="rounded-[2rem] border border-white/20 bg-white/40 p-8 shadow-sm backdrop-blur-md dark:bg-slate-900/40">
                                    <h3 className="mb-6 flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
                                        <Activity className="h-5 w-5 text-blue-500" />
                                        Address Details
                                    </h3>
                                    <div className="space-y-4 text-sm">
                                        <p className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800"><span className="font-bold text-slate-400">City</span> <span className="font-black text-slate-800 dark:text-slate-200">{profile.city || "N/A"}</span></p>
                                        <p className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800"><span className="font-bold text-slate-400">Pincode</span> <span className="font-black text-slate-800 dark:text-slate-200">{profile.pincode || "N/A"}</span></p>
                                        <p className="pt-2"><span className="block mb-2 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Full Address</span> <span className="font-bold text-slate-800 dark:text-slate-200 leading-relaxed">{profile.address || "N/A"}</span></p>
                                    </div>
                                </div>
                                <div className="rounded-[2rem] border border-white/20 bg-white/40 p-8 shadow-sm backdrop-blur-md dark:bg-slate-900/40">
                                    <h3 className="mb-6 flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
                                        <Activity className="h-5 w-5 text-emerald-500" />
                                        Account Status
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between rounded-2xl bg-white/50 p-4 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-700">
                                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Subscription</span>
                                            <span className={`rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-wider border ${profile.isSubscribed ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                                                {profile.isSubscribed ? "Active" : "None"}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-2xl bg-white/50 p-4 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-700">
                                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Account Role</span>
                                            <span className="text-xs font-black capitalize text-slate-900 dark:text-white font-mono bg-blue-50 px-3 py-1 rounded-lg dark:bg-blue-900/30">{profile.role}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "orders" && (
                            ordersLoading ? <TabLoadingState /> : (
                                <div className="space-y-6">
                                    <div className="overflow-hidden rounded-[2rem] border border-white/20 bg-white/40 shadow-sm backdrop-blur-md dark:bg-slate-900/40">
                                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-5">
                                            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-white">
                                                <ShoppingBag className="h-4 w-4" />
                                                Order History
                                            </h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                        <TableRow className="border-b border-slate-100 bg-slate-50/50 dark:bg-slate-800/50 dark:border-slate-800">
                                                            <TableCell isHeader className="px-8 py-4">Order ID</TableCell>
                                                            <TableCell isHeader className="px-8 py-4">Items</TableCell>
                                                            <TableCell isHeader className="px-8 py-4">Docs</TableCell>
                                                            <TableCell isHeader className="px-8 py-4">Amount</TableCell>
                                                            <TableCell isHeader className="px-8 py-4">Status</TableCell>
                                                            <TableCell isHeader className="px-8 py-4">Date</TableCell>
                                                        </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {orders.map((order: any) => (
                                                        <TableRow key={order._id} className="hover:bg-white/60 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                                                            <TableCell className="px-8 py-4 font-mono text-xs font-black text-blue-600 underline decoration-blue-200 underline-offset-4">{order.orderId}</TableCell>
                                                            <TableCell className="px-8 py-4 max-w-[200px]">
                                                                <div className="flex flex-col gap-1">
                                                                    {order.items.map((item: any, idx: number) => (
                                                                        <span key={idx} className="truncate text-[10px] font-bold text-slate-600 dark:text-slate-400">{item.productName}</span>
                                                                    ))}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-8 py-4">
                                                                {order.documents && (
                                                                    <button
                                                                        onClick={() => setDocTarget(order)}
                                                                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                                        title="View Documents"
                                                                    >
                                                                        <Eye size={16} />
                                                                    </button>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="px-8 py-4 font-black text-slate-900 dark:text-white text-base">₹{order.totalAmount}</TableCell>
                                                            <TableCell className="px-8 py-4">
                                                                <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase border ${order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                                                    }`}>
                                                                    {order.status}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="px-8 py-4 text-[10px] font-bold text-slate-400">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                    {orders.length === 0 && (
                                                        <TableRow><TableCell colSpan={5} className="py-20 text-center text-slate-400 italic">No orders found</TableCell></TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 pl-4">Digital Invoices</h3>
                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                            {invoices.map((inv: any) => (
                                                <div
                                                    key={inv._id}
                                                    onClick={() => handleViewInvoice(inv._id)}
                                                    className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all hover:bg-slate-50/50 dark:border-white/5 dark:bg-slate-900/40"
                                                >
                                                    <div className="flex items-center justify-between relative mb-3">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{inv.invoice_number}</span>
                                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-500 dark:bg-slate-800">
                                                            {loadingInvoiceId === inv._id ? (
                                                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                                                            ) : (
                                                                <FileText className="h-3.5 w-3.5" />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-baseline justify-between">
                                                        <span className="text-xl font-black text-slate-900 dark:text-white">₹{inv.totalAmount}</span>
                                                        <span className="text-[10px] font-bold text-slate-400">{new Date(inv.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                                                    </div>
                                                    <div className={`mt-4 flex items-center justify-center gap-1.5 rounded-lg py-2 text-[9px] font-black uppercase tracking-wider transition-all ${loadingInvoiceId === inv._id
                                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                        : 'bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white'
                                                        }`}>
                                                        {loadingInvoiceId === inv._id ? 'LOADING...' : 'VIEW INVOICE'}
                                                        <ChevronRight className={`h-3 w-3 ${loadingInvoiceId === inv._id ? 'hidden' : ''}`} />
                                                    </div>
                                                </div>
                                            ))}
                                            {invoices.length === 0 && (
                                                <div className="col-span-full py-20 text-center text-slate-400 italic bg-white/30 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">No invoices listed</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        )}

                        {activeTab === "rentals" && (
                            rentalsLoading ? <TabLoadingState /> : (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                        {rentalProducts.map((rent: any) => (
                                            <div key={rent._id} className="group relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/60 p-8 shadow-sm backdrop-blur-md transition-all hover:bg-white hover:shadow-xl dark:bg-slate-900/40">
                                                <div className="absolute top-0 right-0 h-32 w-32 -translate-y-16 translate-x-16 rounded-full bg-blue-500/5 blur-3xl group-hover:bg-blue-500/10 transition-colors" />
                                                <div className="flex justify-between items-start mb-6">
                                                    <div>
                                                        <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{rent.productId?.productName || "Product Name"}</h4>
                                                        <p className="mt-1 text-[11px] text-slate-400 font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded inline-block">SERIAL: {rent.serialNumber || "N/A"}</p>
                                                    </div>
                                                    <span className={`rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-wider border shadow-sm ${rent.rentalStatus === 'active' ? 'bg-blue-50 text-blue-600 border-blue-100 text-shadow-blue' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                                        {rent.rentalStatus}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="rounded-[1.5rem] bg-slate-50/50 p-4 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/50">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Start Date</p>
                                                        <p className="text-sm font-black text-slate-800 dark:text-slate-200">{new Date(rent.rentedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                    </div>
                                                    <div className="rounded-[1.5rem] bg-slate-50/50 p-4 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/50">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">End Date</p>
                                                        <p className="text-sm font-black text-slate-800 dark:text-slate-200">{new Date(rent.rentedTill).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {rentalProducts.length === 0 && (
                                            <div className="col-span-full rounded-[2.5rem] border-2 border-dashed border-slate-200 p-20 text-center text-slate-400 dark:border-slate-800 bg-white/20">
                                                <History className="h-10 w-10 mx-auto mb-4 opacity-20" />
                                                <p className="text-sm font-bold uppercase tracking-widest">No active rentals for this customer</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 pl-4">Rental Archives</h3>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            {rentalHistory.map((hist: any) => (
                                                <div key={hist._id} className="group rounded-3xl border border-white/20 bg-white/40 p-5 shadow-sm transition-all hover:bg-white hover:shadow-lg dark:border-slate-800 dark:bg-slate-950/50">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 transition-transform group-hover:rotate-12">
                                                            <History className="h-5 w-5" />
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg">{hist.brID}</span>
                                                    </div>
                                                    <p className="text-sm font-black text-slate-800 dark:text-slate-200 mb-4">{hist.productID?.productName || "Product"}</p>
                                                    <div className="space-y-2 border-t border-slate-100 pt-4 dark:border-slate-900">
                                                        <div className="flex justify-between text-[11px] font-bold">
                                                            <span className="text-slate-400">RENTED</span>
                                                            <span className="text-slate-600 dark:text-slate-400">{new Date(hist.rentedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                                                        </div>
                                                        <div className="flex justify-between text-[11px] font-black">
                                                            <span className="text-slate-400">RETURNED</span>
                                                            <span className="text-emerald-500">{hist.returnDate ? new Date(hist.returnDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {rentalHistory.length === 0 && (
                                                <p className="col-span-full text-center text-[10px] font-black uppercase tracking-widest text-slate-300 py-10">Archive is empty</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        )}

                        {activeTab === "payments" && (
                            paymentsLoading ? <TabLoadingState /> : (
                                <div className="space-y-12">
                                    {/* Subscription Timeline Section */}
                                    {subscriptionTimelines && subscriptionTimelines.length > 0 && (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.3em] text-indigo-600 ml-4">
                                                    <Package className="h-5 w-5" />
                                                    Subscription Payment Schedules
                                                </h3>
                                                <div className="text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
                                                    {subscriptionTimelines.length} Active {subscriptionTimelines.length === 1 ? 'Subscription' : 'Subscriptions'}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-8">
                                                {subscriptionTimelines.map((subscription: any, subIdx: number) => {
                                                    const paidMonths = subscription.timeline?.filter((t: any) => t.status === 'Paid').length || 0;
                                                    const totalMonths = subscription.totalMonths || 0;
                                                    const progressPercent = totalMonths > 0 ? (paidMonths / totalMonths) * 100 : 0;
                                                    const nextPayment = subscription.timeline?.find((t: any) => t.status === 'Upcoming');

                                                    return (
                                                        <div key={subscription.rentalId || subIdx} className="group relative overflow-hidden rounded-[3rem] border border-white/20 bg-gradient-to-br from-white/95 via-white/80 to-white/60 p-8 shadow-lg backdrop-blur-xl transition-all hover:shadow-2xl dark:from-slate-950/95 dark:via-slate-950/80 dark:to-slate-900/70 dark:border-white/5">
                                                            {/* Decorative gradient */}
                                                            <div className="absolute top-0 right-0 h-64 w-64 -translate-y-32 translate-x-32 rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl" />

                                                            {/* Header */}
                                                            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between mb-8">
                                                                <div className="space-y-3">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30">
                                                                            <Package className="h-6 w-6" />
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{subscription.productName || "Rental Product"}</h4>
                                                                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-0.5">ID: {subscription.rentalId}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        <span className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border shadow-sm ${subscription.status === 'active'
                                                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                                            : 'bg-slate-100 text-slate-500 border-slate-200'
                                                                            }`}>
                                                                            <div className={`h-2 w-2 rounded-full ${subscription.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                                                                            {subscription.status}
                                                                        </span>
                                                                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1.5 text-[10px] font-black text-blue-600 uppercase tracking-wider border border-blue-100">
                                                                            {paidMonths} / {totalMonths} Months Paid
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                {/* Progress Circle */}
                                                                <div className="flex flex-col items-center gap-3">
                                                                    <div className="relative h-24 w-24">
                                                                        <svg className="h-24 w-24 -rotate-90 transform">
                                                                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-slate-100 dark:text-slate-800" />
                                                                            <circle
                                                                                cx="48"
                                                                                cy="48"
                                                                                r="40"
                                                                                stroke="currentColor"
                                                                                strokeWidth="8"
                                                                                fill="none"
                                                                                strokeDasharray={`${2 * Math.PI * 40}`}
                                                                                strokeDashoffset={`${2 * Math.PI * 40 * (1 - progressPercent / 100)}`}
                                                                                className="text-indigo-600 transition-all duration-1000"
                                                                                strokeLinecap="round"
                                                                            />
                                                                        </svg>
                                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                                            <span className="text-lg font-black text-slate-900 dark:text-white">{Math.round(progressPercent)}%</span>
                                                                        </div>
                                                                    </div>
                                                                    {nextPayment && (
                                                                        <div className="text-center">
                                                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Next Due</p>
                                                                            <p className="text-xs font-black text-indigo-600">{new Date(nextPayment.expectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Monthly Timeline Grid */}
                                                            <div className="relative">
                                                                <h5 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Payment Schedule</h5>
                                                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                                                                    {subscription.timeline?.map((month: any, monthIdx: number) => {
                                                                        const isPaid = month.status === 'Paid';
                                                                        const isUpcoming = month.status === 'Upcoming';
                                                                        const isOverdue = month.status === 'Overdue';

                                                                        return (
                                                                            <div
                                                                                key={monthIdx}
                                                                                className={`group/month relative overflow-hidden rounded-2xl border p-4 transition-all hover:scale-105 hover:shadow-lg ${isPaid
                                                                                    ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
                                                                                    : isOverdue
                                                                                        ? 'bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800'
                                                                                        : 'bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700'
                                                                                    }`}
                                                                            >
                                                                                <div className="flex items-start justify-between mb-2">
                                                                                    <span className="text-xs font-black text-slate-900 dark:text-white">Month {month.month}</span>
                                                                                    {isPaid && <span className="text-emerald-500">✓</span>}
                                                                                    {isOverdue && <span className="text-rose-500">⚠</span>}
                                                                                    {isUpcoming && <span className="text-blue-500">⏰</span>}
                                                                                </div>
                                                                                <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400">
                                                                                    {new Date(month.expectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                                                                                </p>
                                                                                <div className={`mt-2 rounded-lg px-2 py-1 text-[8px] font-black uppercase tracking-wider ${isPaid
                                                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                                                                                    : isOverdue
                                                                                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'
                                                                                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                                                                                    }`}>
                                                                                    {month.status}
                                                                                </div>
                                                                                {month.transactionId && (
                                                                                    <p className="mt-2 text-[8px] font-mono text-slate-400 truncate" title={month.transactionId}>
                                                                                        TXN: {month.transactionId.slice(-8)}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Payment Transaction Timeline */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.3em] text-blue-600 ml-4">
                                                <CreditCard className="h-5 w-5" />
                                                Transaction History
                                            </h3>
                                            <div className="text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
                                                {payments.length} {payments.length === 1 ? 'Transaction' : 'Transactions'}
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <div className="absolute left-8 top-0 h-full w-px bg-gradient-to-b from-blue-500 via-indigo-500 to-transparent opacity-20" />
                                            <div className="space-y-12 pl-16 py-4">
                                                {payments.map((pay: any, idx: number) => (
                                                    <div key={pay.id || idx} className="relative">
                                                        <div className={`absolute -left-[2.75rem] top-6 h-6 w-6 rounded-full border-4 border-white shadow-xl ring-4 ring-white/50 dark:border-slate-900 dark:ring-slate-900/50 ${pay.paymentStatus === 'Completed' || pay.paymentStatus === 'Success'
                                                            ? 'bg-emerald-500'
                                                            : pay.paymentStatus === 'Failed'
                                                                ? 'bg-rose-500'
                                                                : 'bg-amber-500'
                                                            }`} />
                                                        <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/60 p-10 shadow-lg backdrop-blur-md transition-all hover:bg-white hover:shadow-2xl dark:bg-slate-900/50 dark:border-white/5">
                                                            {/* Decorative gradient */}
                                                            <div className="absolute top-0 right-0 h-48 w-48 -translate-y-24 translate-x-24 rounded-full bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-transparent blur-3xl" />

                                                            <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
                                                                <div className="space-y-4 flex-1">
                                                                    <div className="flex items-center gap-4 flex-wrap">
                                                                        <span className="text-5xl font-black text-slate-900 dark:text-white">₹{pay.amount}</span>
                                                                        <span className={`rounded-2xl px-4 py-2 text-xs font-black uppercase tracking-wider border-2 shadow-md ${pay.status === 'Completed' || pay.paymentStatus === 'Success'
                                                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                                                            : pay.paymentStatus === 'Failed'
                                                                                ? 'bg-rose-50 text-rose-600 border-rose-200'
                                                                                : 'bg-amber-50 text-amber-600 border-amber-200'
                                                                            }`}>
                                                                            {pay.paymentStatus}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-3 group/id cursor-help">
                                                                        <Clock className="h-4 w-4 text-slate-400" />
                                                                        <p className="text-xs font-black font-mono text-slate-500 group-hover/id:text-blue-600 transition-colors uppercase">TXN: {pay.transactionId}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col items-start lg:items-end gap-3">
                                                                    <div className="inline-flex items-center gap-3 rounded-2xl bg-slate-50 px-5 py-3 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                                                        <Calendar className="h-5 w-5 text-blue-500" />
                                                                        <span className="text-sm font-black text-slate-700 dark:text-slate-200">{new Date(pay.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                                    </div>
                                                                    <span className="rounded-xl bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border border-indigo-100 dark:border-indigo-800">{pay.paymentMethod}</span>
                                                                </div>
                                                            </div>
                                                            <div className="relative mt-8 flex flex-wrap gap-3">
                                                                <span className="rounded-2xl bg-slate-50 dark:bg-slate-800 px-5 py-2.5 text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest border border-slate-100 dark:border-slate-700">Method: {pay.method}</span>
                                                                <span className="rounded-2xl bg-slate-50 dark:bg-slate-800 px-5 py-2.5 text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest border border-slate-100 dark:border-slate-700">Order: {pay.orderId}</span>
                                                                {pay.forMonth && <span className="rounded-2xl bg-blue-50 dark:bg-blue-900/30 px-5 py-2.5 text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest border border-blue-100 dark:border-blue-800">For: {new Date(pay.forMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {payments.length === 0 && (
                                                    <div className="py-32 text-center rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/30">
                                                        <CreditCard className="h-16 w-16 mx-auto mb-6 opacity-20" />
                                                        <p className="text-base font-black uppercase tracking-widest text-slate-400">No payment transactions found</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        )}

                        {activeTab === "support" && (
                            supportLoading ? <TabLoadingState /> : (
                                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                                    <div className="space-y-6">
                                        <h3 className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.3em] text-blue-600 ml-4">
                                            <MessageSquare className="h-5 w-5" />
                                            Customer Queries
                                        </h3>
                                        <div className="space-y-4">
                                            {queries.map((q: any) => (
                                                <div key={q._id} className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/60 p-6 shadow-sm transition-all hover:bg-white hover:shadow-xl dark:border-slate-800 dark:bg-slate-950/50">
                                                    <div className="absolute left-0 top-0 h-full w-1 bg-blue-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest">#{q.complaintId}</span>
                                                        <span className={`rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-wider border shadow-sm ${q.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                            {q.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed italic">"{q.message}"</p>
                                                    <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4 dark:border-slate-900">
                                                        <div className="flex items-center gap-2 text-slate-400">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            <span className="text-[10px] font-bold">{new Date(q.date).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {queries.length === 0 && <div className="text-center py-20 rounded-3xl bg-slate-50/50 dark:bg-slate-900/30 font-black uppercase text-[10px] tracking-widest text-slate-400">No queries reported</div>}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.3em] text-rose-600 ml-4">
                                            <Wrench className="h-5 w-5" />
                                            Repair Tracking
                                        </h3>
                                        <div className="space-y-4">
                                            {repairs.map((r: any) => (
                                                <div key={r._id} className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/60 p-6 shadow-sm transition-all hover:bg-white hover:shadow-xl dark:border-slate-800 dark:bg-slate-950/50">
                                                    <div className="absolute right-0 top-0 h-1 w-full bg-gradient-to-r from-rose-500/0 via-rose-500/20 to-rose-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className="text-[10px] font-black uppercase text-rose-500 tracking-wider">ISSUE ID: {r.returnId}</span>
                                                        <span className={`rounded-xl px-3 py-1 text-[10px] font-black uppercase border tracking-wider shadow-sm ${r.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                                            {r.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-base font-black text-slate-800 dark:text-slate-100 mb-2">{r.productId?.productName || "Product Name"}</p>
                                                    <p className="text-xs font-bold text-slate-500 italic">"{r.issueReported}"</p>
                                                    <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-50 pt-4 dark:border-slate-900">
                                                        <div className="space-y-1">
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Estimate</p>
                                                            <p className="text-sm font-black text-rose-600">₹{r.estimatedCost || 0}</p>
                                                        </div>
                                                        <div className="space-y-1 text-right">
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reported On</p>
                                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {repairs.length === 0 && <div className="text-center py-20 rounded-3xl bg-slate-50/50 dark:bg-slate-900/30 font-black uppercase text-[10px] tracking-widest text-slate-400">No repair history</div>}
                                        </div>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Document Preview Modal */}
            <ModalWrapper isOpen={!!docTarget} onClose={() => setDocTarget(null)}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                        Order Documents - {docTarget?.orderId}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${docTarget?.documentStatus === 'verified' ? 'bg-green-100 text-green-700' :
                            docTarget?.documentStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                        }`}>
                        {docTarget?.documentStatus || 'pending'}
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {['aadhar', 'pan', 'rentAgreement', 'idProof'].map((key) => {
                        const doc = docTarget?.documents?.[key];
                        return (
                            <div key={key} className="flex flex-col items-center gap-2 p-3 rounded-xl border bg-slate-50 dark:bg-slate-900/50">
                                <span className="text-[10px] font-bold uppercase text-slate-500">{key}</span>
                                {doc?.url ? (
                                    <button
                                        onClick={() => setPreview(doc.url)}
                                        className="text-blue-500 hover:text-blue-600 p-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
                                    >
                                        <Eye size={20} />
                                    </button>
                                ) : (
                                    <span className="text-xs text-slate-400 italic">No file</span>
                                )}
                            </div>
                        );
                    })}
                </div>

                {preview && (
                    <div className="mb-6 p-2 rounded-xl border bg-slate-100 dark:bg-slate-800">
                        <div className="flex justify-between items-center mb-2 px-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Preview</span>
                            <button onClick={() => setPreview(null)} className="text-[10px] font-bold text-rose-500 hover:underline">Close Preview</button>
                        </div>
                        {renderPreview()}
                    </div>
                )}

                <div className="flex justify-end gap-3 border-t pt-4">
                    <button
                        onClick={() => setDocTarget(null)}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
                    >
                        Close
                    </button>
                </div>
            </ModalWrapper>
        </div >
    );
};

export default CustomerDetailComponent;
