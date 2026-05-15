import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { customerService } from "../../services/customerService";
import { productService } from "../../services/productService";
import { orderService } from "../../services/orderService";
import { packageService } from "../../services/packageService";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { toast } from "react-toastify";
import { Loader2, ArrowLeft, CheckCircle2, Search, X, Check, Clock, Plus } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  type: "product" | "package";
  price: number;
  deposit: number;
  quantity: number;
  duration: number;
}

export default function CreateOrder() {
  const navigate = useNavigate();

  // Selected Customer
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  // Search States
  const [customerSearch, setCustomerSearch] = useState("");
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

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
  const [discountPercent, setDiscountPercent] = useState(0);

  // Fetch Customers
  const { data: customersData, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["all-customers-list"],
    queryFn: () => customerService.getAllCustomers({ limit: 1000 }),
  });
  const customersList = customersData?.data || [];

  // Fetch Products
  const { data: productsData } = useQuery({
    queryKey: ["all-products-list"],
    queryFn: () => productService.getProductList(),
  });
  const productsList = productsData?.data || [];

  // Fetch Packages
  const { data: packagesData } = useQuery({
    queryKey: ["all-packages-list"],
    queryFn: () => packageService.getAllPackages(),
  });
  const packagesList = packagesData?.data || [];

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchType, setSearchType] = useState<"product" | "package">("product");

  // Filtered Lists
  const filteredCustomers = customersList.filter((c: any) => 
    c.username?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone?.includes(customerSearch)
  );

  const filteredItems = searchType === "product" 
    ? productsList.filter((p: any) => p.productName?.toLowerCase().includes(productSearch.toLowerCase()))
    : packagesList.filter((p: any) => p.packageName?.toLowerCase().includes(productSearch.toLowerCase()));

  const addItemToCart = (item: any, type: "product" | "package") => {
    const isAlreadyInCart = cartItems.find((i) => i.id === item._id);
    if (isAlreadyInCart) {
      toast.info(`${isAlreadyInCart.name} is already in cart. Increasing quantity.`);
      updateCartItem(item._id, { quantity: isAlreadyInCart.quantity + 1 });
      return;
    }

    const newItem: CartItem = {
      id: item._id,
      name: type === "product" ? item.productName : item.packageName,
      type,
      price: type === "product" ? item.rentalPrice : item.monthlyPrice,
      deposit: type === "product" ? (item.deposit || 0) : (item.depositAmount || 0),
      quantity: 1,
      duration: 3, // Default duration
    };
    setCartItems((prev) => [...prev, newItem]);
    setProductSearch("");
    setIsProductDropdownOpen(false);
    toast.success(`${newItem.name} added to cart`);
  };

  const removeItemFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateCartItem = (id: string, updates: Partial<CartItem>) => {
    setCartItems((prev) => prev.map((item) => item.id === id ? { ...item, ...updates } : item));
  };


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

  const { totalRent, totalDeposit, totalTax, totalInitial, rentDiscount, discountedMonthlyRent } = useMemo(() => {
    const rent = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const deposit = cartItems.reduce((acc, item) => acc + (item.deposit * item.quantity), 0);
    
    // Calculate Discount
    const discountAmount = rent * (discountPercent / 100);
    const discountedMonthlyRent = rent - discountAmount;

    let calculatedRent = discountedMonthlyRent;
    if (paymentType === "Cumulative Payment") {
        const match = rentalDuration.match(/\d+/);
        const months = match ? parseInt(match[0], 10) : 1;
        calculatedRent = discountedMonthlyRent * months;
    }

    const tax = calculatedRent * 0.18;
    return {
      totalRent: calculatedRent,
      totalDeposit: deposit,
      totalTax: tax,
      totalInitial: calculatedRent + tax + deposit,
      rentDiscount: discountAmount,
      discountedMonthlyRent
    };
  }, [cartItems, paymentType, rentalDuration, discountPercent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      toast.error("Please select a customer.");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Please add at least one product or package.");
      return;
    }

    if (!aadharFile || !panFile || !rentAgreementFile || !idProofFile) {
      toast.error("All documents (Aadhar, PAN, Rent Agreement, and ID Proof) are required.");
      return;
    }

    const selectedCustomer = customersList.find((c: any) => c._id === selectedCustomerId);

    if (!selectedCustomer) return;

    const payload = {
      targetUserId: selectedCustomerId,
      paymentType,
      paymentMethod: "Pending",
      monthlyAmount: discountedMonthlyRent.toString(),
      productRent: discountedMonthlyRent,
      depositAmount: totalDeposit,
      totalAmount: totalInitial,
      isFirstMonth: true,
      couponDiscount: rentDiscount,
      cgst: totalTax / 2,
      igst: totalTax / 2,
      items: cartItems.map(item => ({
        itemType: item.type,
        productId: item.id, // Backend usually expects productId even for packages, or handles by itemType
        productName: item.name,
        quantity: item.quantity,
        rentalDuration: `${item.duration} Months`,
        price: item.price,
        rent: item.price,
        depositAmount: item.deposit,
      })),
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
                  setCartItems([]);
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

              {/* Product & Package Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">2. Add Items</h3>
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => setSearchType("product")}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition ${searchType === "product" ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600" : "text-slate-500"}`}
                    >
                      Products
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchType("package")}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition ${searchType === "package" ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600" : "text-slate-500"}`}
                    >
                      Packages
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <div className="flex items-center w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800">
                    <Search className="h-4 w-4 text-slate-400 mr-2" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setIsProductDropdownOpen(true);
                      }}
                      onFocus={() => setIsProductDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setIsProductDropdownOpen(false), 200)}
                      placeholder={`Search ${searchType}s by name...`}
                      className="w-full bg-transparent outline-none dark:text-white"
                    />
                  </div>

                  {isProductDropdownOpen && (
                    <ul className="absolute top-full mt-1 w-full max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800 z-50 py-1">
                      {filteredItems.length === 0 ? (
                        <li className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">No {searchType}s found.</li>
                      ) : (
                        filteredItems.map((item: any) => (
                          <li
                            key={item._id}
                            onMouseDown={() => addItemToCart(item, searchType)}
                            className="px-4 py-2.5 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-200 flex justify-between items-center"
                          >
                            <div className="text-left">
                                <span className="font-medium block">{item.productName || item.packageName}</span>
                                <span className="text-xs text-slate-500">₹{item.rentalPrice || item.monthlyPrice} / month</span>
                            </div>
                            <Plus className="h-4 w-4 text-indigo-500" />
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </div>

                {/* Cart Table */}
                {cartItems.length > 0 && (
                  <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-widest">
                        <tr>
                          <th className="px-4 py-3">Item</th>
                          <th className="px-4 py-3">Price</th>
                          <th className="px-4 py-3">Deposit</th>
                          <th className="px-4 py-3">Qty</th>
                          <th className="px-4 py-3">Duration</th>
                          <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {cartItems.map((item) => (
                          <tr key={item.id} className="dark:text-slate-300">
                            <td className="px-4 py-3">
                              <span className="font-medium block">{item.name}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${item.type === 'package' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                {item.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">₹{item.price}</td>
                            <td className="px-4 py-3 whitespace-nowrap">₹{item.deposit}</td>
                            <td className="px-4 py-3">
                              <input 
                                type="number" 
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateCartItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                                className="w-12 bg-transparent border-b border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <select 
                                value={item.duration}
                                onChange={(e) => updateCartItem(item.id, { duration: parseInt(e.target.value) })}
                                className="bg-transparent border-b border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none"
                              >
                                {[3, 6, 9, 12].map(m => <option key={m} value={m}>{m}m</option>)}
                              </select>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button type="button" onClick={() => removeItemFromCart(item.id)} className="text-rose-500 hover:text-rose-600 p-1">
                                <X className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Discount Percentage (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        placeholder="e.g. 10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                    </div>
                  </div>

                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-1 italic">
                        * Monthly amount and deposit are automatically calculated based on the items added above and any discount applied.
                      </p>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Base Monthly Rent:</span>
                        <span className="text-sm font-medium text-slate-500 line-through">₹{cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Final Monthly Rent:</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">₹{cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0) - rentDiscount}</span>
                      </div>
                    </div>
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
                  {paymentType === "Cumulative Payment" ? "Total Rent (Gross)" : "Base Rent (Gross)"}
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">₹{(totalRent + (paymentType === "Cumulative Payment" ? (rentDiscount * (parseInt(rentalDuration) || 1)) : rentDiscount)).toFixed(2)}</span>
              </div>
              {rentDiscount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount ({discountPercent}%)</span>
                    <span>-₹{(paymentType === "Cumulative Payment" ? (rentDiscount * (parseInt(rentalDuration) || 1)) : rentDiscount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Net Rent</span>
                <span className="font-semibold text-slate-900 dark:text-white">₹{totalRent.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">GST (18%)</span>
                <span className="font-semibold text-slate-900 dark:text-white">₹{totalTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Security Deposit</span>
                <span className="font-semibold text-slate-900 dark:text-white">₹{totalDeposit.toFixed(2)}</span>
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-700 my-2"></div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-slate-900 dark:text-white">Total Customer Pays</span>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                  ₹{totalInitial.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}