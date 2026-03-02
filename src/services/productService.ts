import apiClient from "./apiClient";

export const productService = {
    getProductList: async () => {
        const response = await apiClient.get("/products/list");
        return response.data;
    },

    getProducts: async (page = 1, limit = 10, city = "") => {
        // If city is empty, it shouldn't be included or should be handled by backend.
        // The original code: `${BASE_API_URL}/products/getProduct?page=${page}&limit=${limit}${city ? `&city=${city}` : ""}`
        const params: any = { page, limit };
        if (city) params.city = city;

        const response = await apiClient.get("/products/getProduct", { params });
        return response.data;
    },

    addStock: async (id: string, amount: number) => {
        const response = await apiClient.put(`/products/add-stock/${id}`, { addStock: amount });
        return response.data;
    },

    removeStock: async (id: string, amount: number) => {
        const response = await apiClient.put(`/products/remove-stock/${id}`, { removeStock: amount });
        return response.data;
    },

    editProduct: async (productData: any) => {
        const response = await apiClient.put("/products/editProduct", productData);
        return response.data;
    },

    editOffers: async (id: string, offerData: any) => {
        const response = await apiClient.post(`/products/editOffers/${id}`, offerData);
        return response.data;
    },

    deleteProduct: async (id: string) => {
        const response = await apiClient.delete(`/products/deleteProduct/${id}`);
        return response.data;
    },

    addDurationDiscount: async (id: string, discountData: any) => {
        const response = await apiClient.put(`/products/addDurationDiscount/${id}`, discountData);
        return response.data;
    },

    addProduct: async (formData: FormData) => {
        const response = await apiClient.post("/products/addProduct", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },

    trackProducts: async () => {
        const response = await apiClient.get("/products/trackProductsRoute");
        return response.data;
    },

    getForbr: async () => {
        const response = await apiClient.get("/products/getForbr");
        return response.data;
    },

    getProductById: async (id: string) => {
        const response = await apiClient.get(`/products/getById/${id}`);
        return response.data;
    },
};
