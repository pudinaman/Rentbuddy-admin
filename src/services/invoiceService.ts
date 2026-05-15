import apiClient from "./apiClient";

export const invoiceService = {
    getInvoices: async (page = 1, limit = 10) => {
        const response = await apiClient.get("/orders/getInvoice", {
            params: { page, limit },
        });
        return response.data;
    },

    getInvoiceById: async (id: string) => {
        // Try the primary route first
        try {
            const response = await apiClient.get(`/invoices/${id}`);
            return response.data;
        } catch (err) {
            // Fallback
            const response = await apiClient.get(`/orders/getInvoice/${id}`);
            return response.data;
        }
    },
};
