import apiClient from "./apiClient";

export const customerService = {
    getAllCustomers: async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        city?: string;
        state?: string;
        startDate?: string;
        endDate?: string;
    }) => {
        const response = await apiClient.get("/user/getAllCustomers", { params });
        return response.data;
    },
    deleteCustomer: async (id: string) => {
        const response = await apiClient.delete("/user/deleteCustomer", {
            data: { id },
        });
        return response.data;
    },
    getCustomerById: async (id: string) => {
        const response = await apiClient.get(`/user/getAllCustomers/${id}`);
        return response.data;
    },
    // modular routes
    getCustomerOrders: async (id: string) => {
        const response = await apiClient.get(`/user/getAllCustomers/${id}/orders`);
        console.log(response.data);
        return response.data;
    },
    getCustomerPayments: async (id: string) => {
        const response = await apiClient.get(`/user/getAllCustomers/${id}/payments`);
        return response.data;
    },
    getCustomerRentals: async (id: string) => {
        const response = await apiClient.get(`/user/getAllCustomers/${id}/rentals`);
        return response.data;
    },
    getCustomerSupport: async (id: string) => {
        const response = await apiClient.get(`/user/getAllCustomers/${id}/support`);
        return response.data;
    },
    getCustomerCart: async (id: string) => {
        const response = await apiClient.get(`/user/getAllCustomers/${id}/cart`);
        return response.data;
    },
};
