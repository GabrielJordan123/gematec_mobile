import axios from "axios";
import { Activity } from "../Models/Activity";
import apiClient from "../Context/ApiClient";
import { API_BASE_URL } from "../config/apiConfig"; // Adicione esta importação no topo
export default class ActivityService {


    async fetchActivities(
        equipmentId: number,
        params: {
            page?: number;
            per_page?: number;
            activity_type?: string;
            token: string;
        }
    ): Promise<{ results: Activity[]; count: number; links: { next: string | null; previous: string | null } }> {
        try {
            const url = `${API_BASE_URL}/equipments/${equipmentId}/activities`;
            console.log("[ActivityService] Buscando atividades:", { url, params });
            const response = await apiClient.get(url, {
                headers: {
                    Authorization: `Bearer ${params.token}`,
                },
                params: {
                    page: params?.page,
                    per_page: params?.per_page,
                    activity_type: params?.activity_type,
                },
            });
            console.log("[ActivityService] Resposta recebida:", response.data);
            return response.data;
        } catch (error: any) {
            console.error("[ActivityService] Erro ao buscar atividades do equipamento:", {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
            });
            throw error;
        }
    }
}