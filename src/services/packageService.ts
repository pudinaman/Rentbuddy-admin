import apiClient from "./apiClient";

export const packageService = {
    getAllPackages: async () => {
        const response = await apiClient.get("/packages/getAllPackages");
        return response.data;
    },

    createPackage: async (formData: FormData) => {
        const response = await apiClient.post("/packages/create", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    updatePackage: async (id: string, formData: FormData) => {
        const response = await apiClient.put(`/packages/update/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    togglePackageStatus: async (id: string) => {
        const response = await apiClient.patch(`/packages/toggle/${id}`, {});
        return response.data;
    },

    deletePackage: async (id: string) => {
        const response = await apiClient.delete(`/packages/delete/${id}`);
        return response.data;
    },
};
