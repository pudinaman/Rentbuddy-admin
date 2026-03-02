import apiClient from "./apiClient";

export const repairService = {
    getRepairProducts: async () => {
        const response = await apiClient.get("/products/getRepairProductsRoute");
        return response.data;
    },

    createRepair: async (repairData: any) => {
        const response = await apiClient.post("/repairs", repairData);
        return response.data;
    },

    updateRepair: async (id: string, repairData: any) => {
        const response = await apiClient.put(`/repairs/${id}`, repairData);
        return response.data;
    },

    deleteRepair: async (id: string) => {
        const response = await apiClient.delete(`/repairs/${id}`);
        return response.data;
    },
};
