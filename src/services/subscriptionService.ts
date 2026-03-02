import apiClient from "./apiClient";

export const subscriptionService = {
    getSubscriptions: async () => {
        const response = await apiClient.get("/user/getSubscription");
        return response.data;
    },

    cancelSubscription: async (subscriptionId: string) => {
        const response = await apiClient.post("/payments/cancel", {
            subscriptionId,
        });
        return response.data;
    },
};
