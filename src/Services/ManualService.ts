import apiClient from "../Context/ApiClient";
import { setDynamicApiUrl } from "../config/apiConfig";
import { Category, Manual } from "../Models/Manual";
import jwtDecode from "jwt-decode";
import * as FileSystem from "expo-file-system";

interface FetchManualsParams {
    accessToken: string;
    page: number;
    perPage: number;
    search?: string;
    categoryId?: number;
}

export default class ManualService {
    private static getDynamicBaseUrl(accessToken: string): string {
        const decodedToken: any = jwtDecode(accessToken);
        const accountName = decodedToken?.account_name || "default";
        return setDynamicApiUrl(accountName);
    }

    static async fetchManuals({
        accessToken,
        page,
        perPage,
        search,
        categoryId,
    }: FetchManualsParams): Promise<{ results: Manual[]; count: number }> {
        try {
            const dynamicBaseUrl = ManualService.getDynamicBaseUrl(accessToken);
            const params = new URLSearchParams({
                per_page: perPage.toString(),
                page: page.toString(),
            });

            if (search) params.append("search", search);
            if (categoryId) params.append("category_id", categoryId.toString());

            const url = `/manuals?${params.toString()}`;
            const response = await apiClient.get(url, {
                baseURL: dynamicBaseUrl,
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            // Handle array response or paginated response
            const data = Array.isArray(response.data)
                ? { results: response.data, count: response.data.length }
                : response.data;
            return {
                results: data.results || data,
                count: data.count || data.length || 0,
            };
        } catch (error: any) {
            console.error("[ManualService] Erro ao buscar manuais:", error);
            if (error.response?.status === 403) {
                throw new Error("Você não tem permissão para visualizar manuais.");
            }
            throw new Error("Erro ao buscar manuais.");
        }
    }

    static async fetchManualDetails(accessToken: string, manualId: number): Promise<Manual> {
        try {
            const dynamicBaseUrl = ManualService.getDynamicBaseUrl(accessToken);
            const url = `/manuals/${manualId}`;
            const response = await apiClient.get(url, {
                baseURL: dynamicBaseUrl,
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            return response.data;
        } catch (error: any) {
            console.error("[ManualService] Erro ao buscar detalhes do manual:", error);
            if (error.response?.status === 403) {
                throw new Error("Você não tem permissão para visualizar detalhes do manual.");
            }
            throw new Error("Erro ao buscar detalhes do manual.");
        }
    }

    static async fetchCategories(accessToken: string): Promise<Category[]> {
        try {
            const dynamicBaseUrl = ManualService.getDynamicBaseUrl(accessToken);
            const url = `/manual_categories`;
            const response = await apiClient.get(url, {
                baseURL: dynamicBaseUrl,
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            return Array.isArray(response.data) ? response.data : response.data.results || [];
        } catch (error: any) {
            console.error("[ManualService] Erro ao buscar categorias:", error);
            if (error.response?.status === 403) {
                throw new Error("Você não tem permissão para visualizar categorias de manuais.");
            }
            throw new Error("Erro ao buscar categorias.");
        }
    }

    static async downloadManual(manualUrl: string, accessToken: string): Promise<string> {
        try {
            const filename = manualUrl.split('/').pop() || 'manual.pdf';
            const fileUri = FileSystem.documentDirectory + filename;

            const downloadResumable = FileSystem.createDownloadResumable(
                manualUrl,
                fileUri,
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );

            const downloadResult = await downloadResumable.downloadAsync();
            if (!downloadResult || !downloadResult.uri) {
                throw new Error("Download do manual falhou ou foi cancelado.");
            }
            console.log('Finished downloading to ', downloadResult.uri);
            return downloadResult.uri as string;
        } catch (error: any) {
            console.error("[ManualService] Erro ao baixar manual:", error);
            throw new Error(`Erro ao baixar manual: ${error.message || 'Erro desconhecido'}`);
        }
    }
}