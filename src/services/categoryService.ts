import apiClient from "./apiClient";

export const getCategories = async () => {
    const response = await apiClient.get('/categories');
    return response.data;
};

export const createCategory = async (name: string) => {
    const response = await apiClient.post('/categories', { name });
    return response.data;
};

export const deleteCategory = async (id: string) => {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
};
