import apiClient from "./apiClient";

export const barcodeService = {
    getAllBarcodes: async (page = 1, limit = 10, status = "all") => {
        const statusQuery = status !== "all" ? `&status=${status}` : "";
        const response = await apiClient.get(
            `/barcode/getAllBarcodes?page=${page}&limit=${limit}${statusQuery}`
        );
        return response.data;
    },

    getBarcodesByProductId: async (productId: string, page = 1, limit = 10) => {
        const response = await apiClient.get(
            `/barcode/br/${productId}?page=${page}&limit=${limit}`
        );
        return response.data;
    },

    getBarcodeById: async (barcodeId: string) => {
        const response = await apiClient.get(`/barcode/get/${barcodeId}`);
        return response.data;
    },

    returnBarcode: async (barcodeId: string, conditionAtReturn = "good") => {
        const response = await apiClient.put(`/barcode/return/${barcodeId}`, {
            conditionAtReturn,
        });
        return response.data;
    },

    markDamaged: async (barcodeId: string, note = "Marked damaged from admin") => {
        const response = await apiClient.post(
            `/barcode/markDamaged/${barcodeId}/damage`,
            { note }
        );
        return response.data;
    },

    markAvailable: async (barcodeId: string) => {
        const response = await apiClient.post(
            `/barcode/markAvailable/${barcodeId}/available`,
            {}
        );
        return response.data;
    },

    markReturn: async (barcodeId: string) => {
        const response = await apiClient.post(
            `/barcode/markReturn/${barcodeId}/return`,
            {}
        );
        return response.data;
    },

    deleteBarcode: async (barcodeId: string) => {
        const response = await apiClient.delete(`/barcode/delete/${barcodeId}`);
        return response.data;
    },
};
