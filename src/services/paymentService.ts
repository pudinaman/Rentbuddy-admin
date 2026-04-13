import apiClient from "./apiClient";

export const paymentService = {
    getRecurringPayments: async () => {
        const response = await apiClient.get("/payments/recurringPayments/current");
        return response.data;
    },

    skipMonth: async (subscriptionId: string) => {
        const response = await apiClient.post("/payments/skip-month", {
            subscriptionId,
        });
        return response.data;
    },

    sendStrictNotice: async (subscriptionId: string) => {
        const response = await apiClient.post("/payments/strict-reminder", {
            subscriptionId,
        });
        return response.data;
    },

    getPayments: async (page = 1, limit = 10) => {
        const response = await apiClient.get("/payments/getPayments", {
            params: { page, limit },
        });
        return response.data;
    },

    refundPayment: async (data: { paymentId: string; refund_amount?: number; refund_note?: string }) => {
        // Aligned with backend routes/refunds.js expectations
        const response = await apiClient.post("/refunds/create-refund", data);
        return response.data;
    },

    continueSubscription: async (data: {
        rentalId?: string;
        subscriptionId?: string;
        orderId?: string;
        extensionMonths: number;
        type: "Recurring" | "Full";
    }) => {
        const response = await apiClient.post("/payments/continue", data);
        return response.data;
    },

    getEstimation: async (data: {
        rentalId?: string;
        orderId?: string;
        extensionMonths: number;
        type: "Recurring" | "Full";
    }) => {
        const response = await apiClient.post("/payments/continue/estimate", data);
        return response.data;
    },
};