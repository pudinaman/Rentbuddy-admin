import apiClient from "./apiClient";

export const orderService = {
    getOrders: async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        startDate?: string;
        endDate?: string;
        city?: string;
        state?: string;
    }) => {
        const response = await apiClient.get("/orders/getOrders", { params });
        return response.data;
    },
    deleteOrder: async (id: string) => {
        const response = await apiClient.delete(`/orders/${id}`);
        return response.data;
    },
};
