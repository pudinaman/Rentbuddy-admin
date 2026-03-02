import apiClient from "./apiClient";

export const documentService = {
    getDocuments: async () => {
        const response = await apiClient.get("/orders/getDocument");
        return response.data;
    },

    updateDocumentStatus: async (id: string, status: string) => {
        const response = await apiClient.put(`/orders/updateDocStatus/${id}`, {
            status,
        });
        return response.data;
    },
};
