import apiClient from "./apiClient";

export const onboardHouse = async (formData: FormData) => {
    const response = await apiClient.post('/houses/onboard', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getHouseById = async (id: string) => {
    const response = await apiClient.get(`/houses/${id}`);
    return response.data;
};

export const updateHouse = async (id: string, formData: FormData) => {
    const response = await apiClient.put(`/houses/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
