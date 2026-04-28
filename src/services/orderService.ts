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
        status?: string;
    }) => {
        const response = await apiClient.get("/orders/getOrders", { params });
        return response.data;
    },
    deleteOrder: async (id: string) => {
        const response = await apiClient.delete(`/orders/${id}`);
        return response.data;
    },
    updateOrderDocStatus: async (orderId: string, status: string) => {
        const response = await apiClient.put(`/orders/updateOrderDocStatus/${orderId}`, {
            status,
        });
        return response.data;
    },
    adminCreateOrder: async (orderData: any) => {
        const response = await apiClient.post("/orders/createOrder", orderData);
        return response.data;
    },
    uploadOrderDocuments: async (orderId: string, files: { aadhar?: File, pan?: File, rentAgreement?: File, idProof?: File }) => {
        const formData = new FormData();
        if (files.aadhar) formData.append("aadhar", files.aadhar);
        if (files.pan) formData.append("pan", files.pan);
        if (files.rentAgreement) formData.append("rentAgreement", files.rentAgreement);
        if (files.idProof) formData.append("idProof", files.idProof);
        
        const response = await apiClient.post(`/orders/updateOrderDocuments/${orderId}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },
    getOrderStatus: async (orderInternalId: string) => {
        const response = await apiClient.get(`/orders/status/${orderInternalId}`);
        return response.data;
    },
};
