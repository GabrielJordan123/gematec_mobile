import apiClient from "../Context/ApiClient";
import { ServiceOrder, Answer, UploadedImage } from "../Models/ServiceOrder";
import { API_BASE_URL } from "../config/apiConfig";

interface FetchServiceOrdersParams {
    token: string;
    filters: {
        search?: string;
        equipmentType?: string;  // Ajustado para equipmentType
        brand?: string;
        status?: string;
        sector_id?: number;
        client_id?: number;
    };
    page: number;
}

class ServiceOrderService {
    static async fetchServiceOrders({ token, filters, page }: FetchServiceOrdersParams): Promise<{ results: ServiceOrder[]; count: number }> {
        try {
            const url = `${API_BASE_URL}/service_orders?page=${page}&per_page=10`;
            const params = {
                search: filters.search || '',
                equipmentType: filters.equipmentType || '',  // Ajustado
                brand: filters.brand || '',
                status: filters.status || 'open',
                sector_id: filters.sector_id || '',
                client_id: filters.client_id || '',
            };
            const response = await apiClient.get(url, { headers: { Authorization: `Bearer ${token}` }, params });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar ordens de serviço:', error);
            throw error;
        }
    }

    static async fetchServiceOrderDetails(token: string, serviceOrderId: number): Promise<ServiceOrder> {
        try {
            const response = await apiClient.get(`${API_BASE_URL}/service_orders/${serviceOrderId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar detalhes da ordem de serviço:', error);
            throw error;
        }
    }

    static async fetchAnswers(token: string, serviceOrderId: number): Promise<Answer[]> {
        try {
            const response = await apiClient.get(`${API_BASE_URL}/service_orders/${serviceOrderId}/answers`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar respostas:', error);
            throw error;
        }
    }

    static async uploadImages(token: string, pmocId: number, equipmentVersionId: number, formData: FormData): Promise<UploadedImage[]> {
        try {
            const response = await apiClient.post(`${API_BASE_URL}/pmocs/${pmocId}/equipments/${equipmentVersionId}/images`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao fazer upload de imagens:', error);
            throw error;
        }
    }

    static async fetchImages(token: string, serviceOrderId: number): Promise<UploadedImage[]> {
        try {
            const response = await apiClient.get(`${API_BASE_URL}/service_orders/${serviceOrderId}/images`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar imagens:', error);
            throw error;
        }
    }

    static async submitAnswers(token: string, serviceOrderId: number, data: { status: string; answers: { question_id: number; value: string; meta?: { justification?: string } }[] }): Promise<void> {
        try {
            await apiClient.post(`${API_BASE_URL}/service_orders/${serviceOrderId}/answers`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (error) {
            console.error('Erro ao enviar respostas:', error);
            throw error;
        }
    }

    static async createServiceOrder(token: string, data: { equipment_id: number }): Promise<{ id: number }> {
        try {
            const response = await apiClient.post(`${API_BASE_URL}/service_orders`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao criar ordem de serviço:', error);
            throw error;
        }
    }
}

export default ServiceOrderService;