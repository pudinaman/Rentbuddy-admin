import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { paymentService } from "../../services/paymentService";
import ModalWrapper from "../../layout/ModalWrapper";
import { toast } from "react-toastify";
import { Check, Info, Loader2, Copy, Send } from "lucide-react";

interface ExtendSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionId?: string;
  rentalId?: string;
  orderId?: string;
  paymentType?: string;
  customerName?: string;
  email?: string;
}

export default function ExtendSubscriptionModal({
  isOpen,
  onClose,
  subscriptionId,
  rentalId,
  orderId,
  paymentType,
  customerName,
  email,
}: ExtendSubscriptionModalProps) {
  const queryClient = useQueryClient();
  const [extensionMonths, setExtensionMonths] = useState<number>(1);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isNotifying, setIsNotifying] = useState(false);
  const [hasNotified, setHasNotified] = useState(false);
  
  // Default to Full if no subscriptionId is provided or if it's a Cumulative Payment
  const isUpfront = paymentType === "Cumulative Payment" || !subscriptionId;
  const [type, setType] = useState<"Recurring" | "Full">(isUpfront ? "Full" : "Recurring");

  const extendMutation = useMutation({
    mutationFn: paymentService.continueSubscription,
    onSuccess: (data) => {
      // SCENARIO B: Conversion (Auth Link + Initial Order)
      if (type === "Recurring" && data.data?.authLink) {
        toast.info("Conversion initiated! Opening mandate authorization link...");
        
        // 1. Open Mandate link in new tab
        window.open(data.data.authLink, "_blank");

        // 2. Open Checkout for Month 1
        if (data.data.razorpayOrder) {
          handleRazorpayCheckout(data.data.razorpayOrder);
        } else {
           toast.success("Mandate initialized. Please sign it in the new tab.");
           onClose();
        }
      } 
      // SCENARIO A: Existing Recurring Update
      else if (type === "Recurring") {
        toast.success(data.message || "Subscription extended successfully!");
        queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
        onClose();
      } 
      // Scenario: Full Upfront Payment
      else if (type === "Full" && data.data?.order_id) {
        handleRazorpayCheckout(data.data);
      }
    },
    onError: (err: any) => {
      console.error("[Extension Mutation Error]:", err);
      const msg = err.response?.data?.message || err.response?.data?.error || "Failed to extend subscription";
      toast.error(msg);
    },
  });

  const { data: estimate, isLoading: isLoadingEstimate } = useQuery({
    queryKey: ["extension-estimate", rentalId || orderId, extensionMonths],
    queryFn: () => paymentService.getEstimation({ rentalId, orderId, extensionMonths }),
    enabled: !!(rentalId || orderId) && isOpen,
  });

  const handleRazorpayCheckout = (paymentData: any) => {
    const options: RazorpayOptions = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_RfCKljXbTdyJM2", // Correct test key
      amount: paymentData.amount,
      currency: paymentData.currency || "INR",
      name: "RentBuddy",
      description: `Subscription Extension - ${extensionMonths} Month(s)`,
      order_id: paymentData.order_id,
      handler: function (_response: any) {
        toast.success("Payment successful! Extension will be processed.");
        queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
        onClose();
      },
      prefill: {
        name: customerName,
        email: email,
      },
      theme: {
        color: "#4F46E5",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleNotifyCustomer = async () => {
    if (!generatedLink || !rentalId) return;
    setIsNotifying(true);
    try {
      await paymentService.sendInvite({
        rentalId,
        type,
        link: generatedLink,
        extensionMonths
      });
      setHasNotified(true);
      toast.success("Invitation sent via WhatsApp and Email!");
    } catch (err: any) {
      toast.error("Failed to send invitations");
    } finally {
      setIsNotifying(false);
    }
  };

  const handleCopyLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    toast.success("Link copied to clipboard!");
  };

  const handleExtend = () => {
    // Validation: Per Guideline, Conversion (upfront to recurring) requires 2+ months
    if (type === "Recurring" && isUpfront && extensionMonths === 1) {
      toast.error("For a 1-month extension, please use the 'Full Upfront' payment mode. Conversion to Recurring requires at least 2 months.");
      return;
    }

    extendMutation.mutate({
      subscriptionId,
      rentalId,
      orderId,
      extensionMonths,
      type,
    });
  };

  const estData = estimate?.data;
  const grandTotal = type === "Full" ? (estData?.totalRate * extensionMonths) : estData?.totalRate;

  return (
    <ModalWrapper isOpen={isOpen} onClose={() => !extendMutation.isPending && onClose()}>
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">
            Extend Subscription
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Increase the duration of rental agreement for {subscriptionId ? 'Subscription' : 'Order'}: <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">{subscriptionId || orderId}</span>
          </p>
        </div>

        {/* Extension Months */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Extension Duration (Months)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 3, 6, 12].map((m) => (
              <button
                key={m}
                onClick={() => setExtensionMonths(m)}
                className={`py-2 rounded-xl border text-sm font-semibold transition-all ${
                  extensionMonths === m
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400"
                }`}
              >
                {m}m
              </button>
            ))}
          </div>
          <input
            type="range"
            min="1"
            max="24"
            value={extensionMonths}
            onChange={(e) => setExtensionMonths(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1">
            <span>1 Month</span>
            <span>Selected: {extensionMonths} {extensionMonths === 1 ? 'Month' : 'Months'}</span>
            <span>24 Months</span>
          </div>
        </div>

        {/* Mode selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Payment Mode
          </label>
          
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => setType("Recurring")}
              className={`relative flex flex-col items-start p-4 rounded-2xl border transition-all text-left group ${
                type === "Recurring"
                  ? "bg-indigo-50/50 dark:bg-indigo-500/5 border-indigo-500 ring-1 ring-indigo-500"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {isUpfront ? "Switch to Monthly Recurring" : "Recurring Automated"}
                </span>
                {type === "Recurring" && <div className="h-5 w-5 bg-indigo-500 rounded-full flex items-center justify-center"><Check className="h-3 w-3 text-white" /></div>}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isUpfront 
                  ? "Start a monthly subscription. Requires mandate authorization."
                  : "Updates Razorpay billing cycles. No immediate payment needed."}
              </p>
              <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                <Info className="h-3 w-3" />
                {isUpfront ? "First month + Arrears paid now." : "Only for Active subscriptions."}
              </div>
            </button>

            <button
              onClick={() => setType("Full")}
              className={`relative flex flex-col items-start p-4 rounded-2xl border transition-all text-left group ${
                type === "Full"
                  ? "bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-500 ring-1 ring-emerald-500"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-300"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-slate-900 dark:text-slate-100">Full Upfront Payment</span>
                {type === "Full" && <div className="h-5 w-5 bg-emerald-500 rounded-full flex items-center justify-center"><Check className="h-3 w-3 text-white" /></div>}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                One-time payment. Also clears any missed installments.
              </p>
              <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                <Check className="h-3 w-3" />
                Works even if Past Due.
              </div>
            </button>
          </div>
        </div>

        {/* Payment Summary Preview */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <Loader2 className={`h-3 w-3 ${isLoadingEstimate ? 'animate-spin opacity-100' : 'opacity-0'}`} />
            Payment Summary
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Rate (Base)</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                ₹{isLoadingEstimate ? "..." : estData?.baseRate.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">GST (18%)</span>
              <span className="font-medium text-slate-600 dark:text-slate-400">
                + ₹{isLoadingEstimate ? "..." : estData?.taxRate.toLocaleString()}
              </span>
            </div>
            <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {type === "Full" ? `Total for ${extensionMonths}m` : "Initial Month Total"}
              </span>
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                ₹{isLoadingEstimate ? "..." : grandTotal?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Generated Link & Sharing section */}
        {generatedLink && (
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                <Check className="h-3 w-3" />
                Extension Link Ready
              </span>
              <button 
                onClick={handleCopyLink}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Copy className="h-3 w-3" />
                Copy
              </button>
            </div>
            
            <div className="bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-indigo-100 dark:border-indigo-500/20 truncate text-xs font-mono text-slate-600 dark:text-slate-300">
              {generatedLink}
            </div>

            <button
              onClick={handleNotifyCustomer}
              disabled={isNotifying || hasNotified}
              className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition transform active:scale-95 ${
                hasNotified 
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                  : "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700"
              }`}
            >
              {isNotifying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : hasNotified ? (
                <>
                  <Check className="h-4 w-4" />
                  Sent via WhatsApp & Email
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send to Customer (WA + Email)
                </>
              )}
            </button>
          </div>
        )}

        <div className="pt-4 flex gap-3">
          <button
            onClick={() => {
              if (generatedLink) {
                 queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
                 onClose();
              } else {
                 onClose();
              }
            }}
            disabled={extendMutation.isPending}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm"
          >
            {generatedLink ? "Done" : "Cancel"}
          </button>
          {!generatedLink && (
            <button
              onClick={handleExtend}
              disabled={extendMutation.isPending}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition transform active:scale-95 disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2 ${
                type === "Recurring"
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 shadow-indigo-500/25"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-500/25"
              }`}
            >
              {extendMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Extend ${extensionMonths}m`
              )}
            </button>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}
