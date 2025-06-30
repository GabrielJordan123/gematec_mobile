import apiClient from "../Context/ApiClient";
import { TechnicalAssistance } from "../Models/TechnicalAssistance";
import { Equipment } from "../Models/Equipament"; // Importar Equipment para fetchEquipments
import { Answer } from "../Models/ServiceOrder"; // Importar Answer para fetchAnswers e submitAnswers
import { API_BASE_URL } from "../config/apiConfig"; // Adicione esta importação no topo
export default class TechnicalAssistanceService {


    async fetchTechnicalAssistance(
        token: string,
        pagination: { page: number; per_page: number },
        filters?: {
            search?: string;
            equipment_type?: string;
            brand?: string;
            status?: string;
        }
    ): Promise<{ results: TechnicalAssistance[]; count: number }> {
        const endpoint = `${API_BASE_URL}/technical_assistances`; // Corrigido para /technical_assistances
        console.log('Endpoint:', endpoint);

        // Construir parâmetros apenas com valores válidos
        const params: { [key: string]: any } = {
            page: pagination.page,
            per_page: pagination.per_page,
        };
        if (filters?.search) params.search = filters.search;
        if (filters?.equipment_type) params.equipment_type = filters.equipment_type;
        if (filters?.brand) params.brand = filters.brand;
        if (filters?.status) params.status = filters.status;

        try {
            const response = await apiClient.get(endpoint, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params,
            });
            console.log('Parâmetros enviados:', params); // Log para depuração
            console.log('Resposta do backend:', response.data); // Log para verificar resposta
            return response.data;
        } catch (error: any) {
            console.error('Erro ao buscar assistências técnicas:', error);
            if (error.response) {
                console.error('Detalhes do erro:', error.response.data); // Log detalhado do erro
            }
            throw new Error('Erro ao carregar assistências técnicas. Tente novamente mais tarde.');
        }
    }

    async fetchClients(token: string, search: string): Promise<any> {
        const endpoint = `${API_BASE_URL}/clients`; // fetchClients
        try {
            const response = await apiClient.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
                params: { search },
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
            throw new Error('Erro ao carregar clientes.');
        }
    }

    async submitAnswers(
        token: string,
        technicalAssistanceId: number,
        data: { answers: { question_id: number; value: string; meta?: any }[] }
    ): Promise<TechnicalAssistance> {
        const endpoint = `${API_BASE_URL}/technical_assistances/${technicalAssistanceId}/answers`; // submitAnswers
        try {
            const response = await apiClient.post(endpoint, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('[TechnicalAssistanceService] Erro ao salvar respostas:', error);
            throw error;
        }
    }

    async fetchTechnicalAssistanceDetails(token: string, technicalAssistanceId: number): Promise<TechnicalAssistance> {
        const endpoint = `${API_BASE_URL}/technical_assistances/${technicalAssistanceId}`;
        try {
            const response = await apiClient.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;  // Agora retorna TechnicalAssistance com questions
        } catch (error) {
            console.error('Erro ao buscar detalhes da assistência técnica:', error);
            throw error;
        }
    }

    async fetchSectors(token: string, clientId: number, search: string): Promise<any> {
        const endpoint = `${API_BASE_URL}/clients/${clientId}/sectors`; // fetchSectors
        try {
            const response = await apiClient.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
                params: { search },
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar setores:', error);
            throw new Error('Erro ao carregar setores.');
        }
    }

    async fetchEquipments(token: string, sectorId: number, search: string): Promise<{ results: Equipment[]; count: number }> {
        const endpoint = `${API_BASE_URL}/sectors/${sectorId}/equipments`;
        try {
            const response = await apiClient.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
                params: { search },
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar equipamentos:', error);
            throw new Error('Erro ao carregar equipamentos.');
        }
    }

    async fetchAnswers(token: string, technicalAssistanceId: number): Promise<Answer[]> {
        const endpoint = `${API_BASE_URL}/technical_assistances/${technicalAssistanceId}/answers`; // fetchAnswers
        try {
            const response = await apiClient.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar respostas:', error);
            throw error;
        }
    }

    async createTechnicalAssistance(token: string, data: { equipment_id: number }): Promise<TechnicalAssistance> {
        const endpoint = `${API_BASE_URL}/technical_assistances`;
        try {
            const response = await apiClient.post(endpoint, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao criar assistência técnica:', error);
            throw new Error('Erro ao criar assistência técnica.');
        }
    }
}