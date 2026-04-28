import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { customerService } from "../../services/customerService";
import { productService } from "../../services/productService";
import { orderService } from "../../services/orderService";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { toast } from "react-toastify";
import { Loader2, ArrowLeft, CheckCircle2, Search, X, Check, Clock, ExternalLink } from "lucide-react";

export default function CreateOrder() {
  const navigate = useNavigate();

  // Selected Customer
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  // Search States
  const [customerSearch, setCustomerSearch] = useState("");
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

  // Selected Product
  const [selectedProductId, setSelectedProductId] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);

  // Documents
  const [aadharFile, setAadharFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [rentAgreementFile, setRentAgreementFile] = useState<File | null>(null);
  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [isUploadingDocs, setIsUploadingDocs] = useState(false);
  const [currentOrderStatus, setCurrentOrderStatus] = useState<any>(null);
  const [orderSuccessData, setOrderSuccessData] = useState<any>(null);

  useEffect(() => {
    let interval: any;
    if (orderSuccessData && (!currentOrderStatus || currentOrderStatus.paymentStatus !== "Paid")) {
      interval = setInterval(async () => {
        try {
          const res = await orderService.getOrderStatus(orderSuccessData.orderInternalId);
          setCurrentOrderStatus(res);
          if (res.paymentStatus === "Paid" || res.status === "Completed" || res.status === "Processing") {
            clearInterval(interval);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [orderSuccessData, currentOrderStatus]);
  
  // Order Details
  const [paymentType, setPaymentType] = useState("Recurring Payment");
  const [rentalDuration, setRentalDuration] = useState("3 Months");
  const [monthlyAmount, setMonthlyAmount] = useState("");
  const [depositAmount, setDepositAmount] = useState("");

  // Fetch Customers
  const { data: customersData, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["all-customers-list"],
    queryFn: () => customerService.getAllCustomers({ limit: 1000 }),
  });
  const customersList = customersData?.data || [];

  // Fetch Products
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["all-products-list"],
    queryFn: () => productService.getProductList(),
  });
  const productsList = productsData?.data || [];

  // Filtered Lists
  const filteredCustomers = customersList.filter((c: any) => 
    c.username?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone?.includes(customerSearch)
  );

  const filteredProducts = productsList.filter((p: any) =>
    p.productName?.toLowerCase().includes(productSearch.toLowerCase())
  );

  useEffect(() => {
    if (selectedProductId) {
      const p = productsList.find((p: any) => p._id === selectedProductId);
      if (p) {
        let rent = p.rentalPrice || 0;
        
        // Multiply rent by duration for full upfront payment
        if (paymentType === "Cumulative Payment") {
          const match = rentalDuration.match(/\d+/);
          const months = match ? parseInt(match[0], 10) : 1;
          rent = rent * months;
        }

        setMonthlyAmount(rent ? rent.toString() : "");
        setDepositAmount(p.deposit ? p.deposit.toString() : "");
      }
    } else {
      setMonthlyAmount("");
      setDepositAmount("");
    }
  }, [selectedProductId, productsList, paymentType, rentalDuration]);

  const createOrderMutation = useMutation({
    mutationFn: orderService.adminCreateOrder,
    onSuccess: async (data) => {
      // If there are documents to upload
      if (aadharFile || panFile) {
        setIsUploadingDocs(true);
        try {
          await orderService.uploadOrderDocuments(data.orderInternalId, {
            aadhar: aadharFile || undefined,
            pan: panFile || undefined,
            rentAgreement: rentAgreementFile || undefined,
            idProof: idProofFile || undefined,
          });
          toast.success("Documents uploaded successfully!");
        } catch (err) {
          toast.error("Failed to upload documents, but order was created.");
        } finally {
          setIsUploadingDocs(false);
        }
      }
      toast.success("Order created successfully!");
      setOrderSuccessData(data);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to create order");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedProductId) {
      toast.error("Please select both a customer and a product.");
      return;
    }

    if (!aadharFile || !panFile || !rentAgreementFile || !idProofFile) {
      toast.error("All documents (Aadhar, PAN, Rent Agreement, and ID Proof) are required.");
      return;
    }

    const selectedCustomer = customersList.find((c: any) => c._id === selectedCustomerId);
    const selectedProduct = productsList.find((p: any) => p._id === selectedProductId);

    if (!selectedCustomer) return;

    // Calculate approx total (just for payload, backend handles real calculation)
    const baseAmount = Number(monthlyAmount) || 0;
    const tax = baseAmount * 0.18;
    const deposit = Number(depositAmount) || 0;
    const totalInitial = baseAmount + tax + deposit;

    const payload = {
      targetUserId: selectedCustomerId, // Explicitly tell backend this is for another user
      paymentType,
      paymentMethod: "Pending",
      monthlyAmount: baseAmount.toString(),
      productRent: baseAmount,
      depositAmount: deposit,
      totalAmount: totalInitial,
      isFirstMonth: true,
      cgst: tax / 2,
      igst: tax / 2,
      items: [
        {
          itemType: "product",
          productId: selectedProductId,
          productName: selectedProduct?.productName || "Product",
          quantity: 1,
          rentalDuration,
          price: baseAmount,
          rent: baseAmount,
        }
      ],
      billingInfo: {
        firstName: selectedCustomer.username?.split(' ')[0] || "Customer",
        lastName: selectedCustomer.username?.split(' ').slice(1).join(' ') || "",
        email: selectedCustomer.email,
        phone: selectedCustomer.phone,
        address: selectedCustomer.address || "Address Placeholder",
        city: selectedCustomer.city || "City Placeholder",
        state: "State Placeholder",
        pincode: selectedCustomer.pincode || "000000",
      },
      documents: {},
    };

    createOrderMutation.mutate(payload);
  };

  if (orderSuccessData) {
    const isPaid = currentOrderStatus?.paymentStatus === "Paid" || 
                   currentOrderStatus?.paymentStatus === "Active" ||
                   currentOrderStatus?.status === "Completed" || 
                   currentOrderStatus?.status === "Processing";

    return (
      <div className="max-w-3xl mx-auto p-4 md:p-8">
        <div className="rounded-3xl bg-white p-8 shadow-xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center">
          <div className="flex justify-center mb-6">
            {isPaid ? (
              <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 animate-bounce">
                <CheckCircle2 className="h-12 w-12" />
              </div>
            ) : (
              <div className="h-20 w-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600">
                <Clock className="h-12 w-12 animate-pulse" />
              </div>
            )}
          </div>
          
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {isPaid ? "Payment Received!" : "Order Created Successfully"}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
            {isPaid 
              ? "The order has been fully paid and is now being processed. Everything is good to go!" 
              : `Order ${orderSuccessData.orderId} is pending. Waiting for the customer to complete the payment via the link sent.`}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-left">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Order ID</span>
              <span className="text-lg font-mono font-bold text-slate-900 dark:text-white">{orderSuccessData.orderId}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-left">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Status</span>
              <span className={`text-lg font-bold flex items-center gap-2 ${isPaid ? "text-green-600" : "text-amber-500"}`}>
                {isPaid ? <Check className="h-5 w-5" /> : <Loader2 className="h-5 w-5 animate-spin" />}
                {isPaid ? "Paid & Confirmed" : "Awaiting Payment"}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-900/10">
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 block mb-2">Razorpay Payment Link</span>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={orderSuccessData.authLink || orderSuccessData.oneTimePaymentLink || "No link generated"}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300"
                />
              </div>
            </div>
          </div>

          <div className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={async () => {
                  const res = await orderService.getOrderStatus(orderSuccessData.orderInternalId);
                  setCurrentOrderStatus(res);
                  if (res.paymentStatus === "Paid" || res.paymentStatus === "Active" || res.status === "Completed" || res.status === "Processing") {
                    toast.success("Payment verified!");
                  } else {
                    toast.warn("Payment still not detected on server.");
                  }
                }}
                className="flex-1 px-6 py-3 rounded-xl bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition flex items-center justify-center gap-2"
              >
                <Check className="h-4 w-4" />
                Force Verify
              </button>
              <button
                onClick={() => navigate("/orders")}
                className="flex-1 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Go to Order List
              </button>
              <button
                onClick={() => {
                  setOrderSuccessData(null);
                  setSelectedCustomerId("");
                  setSelectedProductId("");
                  setCurrentOrderStatus(null);
                }}
                className="flex-1 px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-sm font-bold text-white dark:text-slate-900 hover:opacity-90 transition"
              >
                Create Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/orders")}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            <ArrowLeft className="h-5 w-5 text-slate-500" />
          </button>
          <PageBreadcrumb pageTitle="Create Order" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Customer Selection */}
              <div className="space-y-3 relative z-20">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">1. Select Customer</h3>
                {isLoadingCustomers ? (
                  <div className="animate-pulse h-10 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
                ) : (
                  <div className="relative">
                    <div className="flex items-center w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800">
                      <Search className="h-4 w-4 text-slate-400 mr-2" />
                      <input
                        type="text"
                        value={selectedCustomerId ? customersList.find((c:any) => c._id === selectedCustomerId)?.username + ` (${customersList.find((c:any) => c._id === selectedCustomerId)?.phone})` : customerSearch}
                        onChange={(e) => {
                          setCustomerSearch(e.target.value);
                          if (selectedCustomerId) setSelectedCustomerId("");
                          setIsCustomerDropdownOpen(true);
                        }}
                        onFocus={() => setIsCustomerDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setIsCustomerDropdownOpen(false), 200)}
                        placeholder="Search by name, email, or phone..."
                        className="w-full bg-transparent outline-none dark:text-white"
                        required={!selectedCustomerId}
                      />
                      {selectedCustomerId && (
                        <button type="button" onClick={() => { setSelectedCustomerId(""); setCustomerSearch(""); }} className="ml-2 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                          <X className="h-4 w-4 text-slate-500" />
                        </button>
                      )}
                    </div>

                    {isCustomerDropdownOpen && !selectedCustomerId && (
                      <ul className="absolute top-full mt-1 w-full max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800 z-50 py-1">
                        {filteredCustomers.length === 0 ? (
                          <li className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">No customers found.</li>
                        ) : (
                          filteredCustomers.map((c: any) => (
                            <li
                              key={c._id}
                              onMouseDown={() => {
                                setSelectedCustomerId(c._id);
                                setCustomerSearch("");
                                setIsCustomerDropdownOpen(false);
                              }}
                              className="px-4 py-2.5 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-200 flex justify-between items-center"
                            >
                              <div>
                                <span className="font-semibold block">{c.username || "Customer"}</span>
                                <span className="text-xs text-slate-500 block">{c.email} • {c.phone}</span>
                              </div>
                            </li>
                          ))
                        )}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              <div className="h-px bg-slate-200 dark:bg-slate-800"></div>

              {/* Product Selection */}
              <div className="space-y-3 relative z-10">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">2. Select Product</h3>
                {isLoadingProducts ? (
                  <div className="animate-pulse h-10 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
                ) : (
                  <div className="relative">
                    <div className="flex items-center w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800">
                      <Search className="h-4 w-4 text-slate-400 mr-2" />
                      <input
                        type="text"
                        value={selectedProductId ? productsList.find((p:any) => p._id === selectedProductId)?.productName : productSearch}
                        onChange={(e) => {
                          setProductSearch(e.target.value);
                          if (selectedProductId) setSelectedProductId("");
                          setIsProductDropdownOpen(true);
                        }}
                        onFocus={() => setIsProductDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setIsProductDropdownOpen(false), 200)}
                        placeholder="Search product by name..."
                        className="w-full bg-transparent outline-none dark:text-white"
                        required={!selectedProductId}
                      />
                      {selectedProductId && (
                        <button type="button" onClick={() => { setSelectedProductId(""); setProductSearch(""); }} className="ml-2 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                          <X className="h-4 w-4 text-slate-500" />
                        </button>
                      )}
                    </div>

                    {isProductDropdownOpen && !selectedProductId && (
                      <ul className="absolute top-full mt-1 w-full max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800 z-50 py-1">
                        {filteredProducts.length === 0 ? (
                          <li className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">No products found.</li>
                        ) : (
                          filteredProducts.map((p: any) => (
                            <li
                              key={p._id}
                              onMouseDown={() => {
                                setSelectedProductId(p._id);
                                setProductSearch("");
                                setIsProductDropdownOpen(false);
                              }}
                              className="px-4 py-2.5 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-200 flex justify-between items-center"
                            >
                              <span className="font-medium">{p.productName}</span>
                            </li>
                          ))
                        )}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              <div className="h-px bg-slate-200 dark:bg-slate-800"></div>

              {/* Order Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">3. Order Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Payment Type</label>
                    <select
                      value={paymentType}
                      onChange={(e) => setPaymentType(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="Recurring Payment">Recurring Automated</option>
                      <option value="Cumulative Payment">Full Upfront Payment</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Duration</label>
                    <input
                      type="text"
                      value={rentalDuration}
                      onChange={(e) => setRentalDuration(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="e.g. 3 Months"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {paymentType === "Cumulative Payment" ? "Total Upfront Rent (₹)" : "Monthly Rent (₹)"}
                    </label>
                    <input
                      type="number"
                      value={monthlyAmount}
                      onChange={(e) => setMonthlyAmount(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="Amount before tax"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Security Deposit (₹)</label>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-200 dark:bg-slate-800"></div>

              {/* Document Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">4. Upload Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Aadhar Card *</label>
                    <input
                      type="file"
                      onChange={(e) => setAadharFile(e.target.files?.[0] || null)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      accept=".jpg,.jpeg,.png,.pdf"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">PAN Card *</label>
                    <input
                      type="file"
                      onChange={(e) => setPanFile(e.target.files?.[0] || null)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      accept=".jpg,.jpeg,.png,.pdf"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Rent Agreement *</label>
                    <input
                      type="file"
                      onChange={(e) => setRentAgreementFile(e.target.files?.[0] || null)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      accept=".jpg,.jpeg,.png,.pdf"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">ID Proof (Other) *</label>
                    <input
                      type="file"
                      onChange={(e) => setIdProofFile(e.target.files?.[0] || null)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      accept=".jpg,.jpeg,.png,.pdf"
                      required
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500 italic">Max size: 5MB per file. Formats: JPG, PNG, PDF. All documents are mandatory.</p>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={createOrderMutation.isPending || isUploadingDocs}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white shadow-lg transition transform active:scale-95 disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 shadow-indigo-500/25"
                >
                  {createOrderMutation.isPending || isUploadingDocs ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {isUploadingDocs ? "Uploading Documents..." : "Processing Order..."}
                    </>
                  ) : (
                    "Create Order & Generate Link"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Summary Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/50">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Initial Payment Summary</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">
                  {paymentType === "Cumulative Payment" ? "Total Rent" : "Base Rent"}
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">₹{Number(monthlyAmount) || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">GST (18%)</span>
                <span className="font-semibold text-slate-900 dark:text-white">₹{((Number(monthlyAmount) || 0) * 0.18).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Security Deposit</span>
                <span className="font-semibold text-slate-900 dark:text-white">₹{Number(depositAmount) || 0}</span>
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-700 my-2"></div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-slate-900 dark:text-white">Total Customer Pays</span>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                  ₹{((Number(monthlyAmount) || 0) * 1.18 + (Number(depositAmount) || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
