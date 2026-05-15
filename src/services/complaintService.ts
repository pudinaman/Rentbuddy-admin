import apiClient from "./apiClient";

export const complaintService = {
    getAllComplaints: async () => {
        const response = await apiClient.get("/user/getQuery");
        return response.data;
    },

    updateComplaintStatus: async (id: string, status: string) => {
        const response = await apiClient.patch(`/user/updateQueryStatus/${id}/status`, {
            status,
        });
        return response.data;
    },

    deleteComplaint: async (id: string) => {
        const response = await apiClient.delete(`/user/deleteQuery/${id}`);
        return response.data;
    },
};
