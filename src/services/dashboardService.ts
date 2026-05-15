import apiClient from "./apiClient";

export const dashboardService = {
    getCustomerStats: async () => {
        const response = await apiClient.get("/user/customerStats");
        return response.data;
    },
    getOrderAnalytics: async () => {
        const response = await apiClient.get("/orders/analytics");
        return response.data;
    },
    getOrdersByState: async () => {
        const response = await apiClient.get("/orders/orders-by-state");
        return response.data;
    },
};
