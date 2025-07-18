
import apiClient from "../Context/ApiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/apiConfig";
import { MenuItem } from "../Models/MenuItem";

export default class MenuService {
    static async fetchDynamicMenu(): Promise<MenuItem[]> {
        try {
            const token = await AsyncStorage.getItem("access_token");
            if (!token) {
                throw new Error("Token de acesso não encontrado.");
            }

            const endpoint = `${API_BASE_URL}/me/menu?app=mobile`;
            console.log("[MenuService] Buscando menu dinâmico do endpoint:", endpoint);

            const response = await apiClient.get(endpoint, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("[MenuService] Resposta do menu dinâmico:", response.data);
            return response.data; // A API deve retornar diretamente um array de MenuItem
        } catch (error: any) {
            console.error("[MenuService] Erro ao buscar menu dinâmico:", error);
            throw new Error("Não foi possível carregar o menu. Tente novamente mais tarde.");
        }
    }
}
