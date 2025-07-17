import apiClient from "../Context/ApiClient";
import { API_BASE_URL } from "../config/apiConfig";
import { Category, Manual } from "../Models/Manual";

interface FetchManualsParams {
    token: string;
    page: number;
    perPage: number;
    search?: string;
    categoryId?: number;
}

export default class ManualService {
    static async fetchManuals({
        token,
        page,
        perPage,
        search,
        categoryId,
    }: FetchManualsParams): Promise<{ results: Manual[]; count: number }> {
        try {
            const params = new URLSearchParams({
                per_page: perPage.toString(),
                page: page.toString(),
            });

            if (search) params.append("search", search);
            if (categoryId) params.append("category_id", categoryId.toString());

            const url = `${API_BASE_URL}/manuals?${params.toString()}`;
            const response = await apiClient.get(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error: any) {
            console.error("[ManualService] Erro ao buscar manuais:", error);
            throw new Error("Erro ao buscar manuais.");
        }
    }
    static async fetchManualDetails(token: string, manualId: number): Promise<Manual> {
        try {
            const url = `${API_BASE_URL}/manuals/${manualId}`;
            const response = await apiClient.get(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error: any) {
            console.error("[ManualService] Erro ao buscar detalhes do manual:", error);
            throw new Error("Erro ao buscar detalhes do manual.");
        }
    }
    static async fetchCategories(token: string): Promise<Category[]> {
        try {
            const url = `${API_BASE_URL}/manuals`;
            const response = await apiClient.get(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data.results || [];
        } catch (error: any) {
            console.error("[ManualService] Erro ao buscar categorias:", error);
            throw new Error("Erro ao buscar categorias.");
        }
    }
}