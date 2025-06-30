import axios from "axios";
import { Pmoc } from "../Models/Pmoc_Model/Pmoc";
import { PmocEquipment } from "../Models/Pmoc_Model/PmocEqupment";
import { EquipmentDetails, Question } from "../Models/Pmoc_Model/EquipmentDetails";
import apiClient from "../Context/ApiClient"
import { ServiceOrder, Answer, UploadedImage } from "../Models/ServiceOrder"; // Ajuste o caminho
import { API_BASE_URL } from "../config/apiConfig"; // Adicione esta importação no topo
export default class PmocService {


  static async fetchPmocs(
    token: string,
    page: number = 1,
    perPage: number = 10,
    search: string = "",
    status: string = ""
  ): Promise<{ results: Pmoc[]; count: number }> {
    try {
      console.log("[PmocService] Iniciando busca por PMOCs...");

      console.log("[PmocService] Token:", token ? "Token recebido" : "Token não fornecido");

      // Validar o valor de status
      const validStatuses = ["open", "pending", "closed"];
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        search,
      });

      // Adicionar status apenas se for válido
      if (status && validStatuses.includes(status)) {
        params.append("status", status);
      }

      const url = `${API_BASE_URL}/pmocs?${params.toString()}`;
      console.log("[PmocService] URL do endpoint com filtros:", url);

      const response = await apiClient.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("[PmocService] Resposta do servidor:", response.data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.error("[PmocService] Erro no servidor:");
        console.error("Status:", error.response.status);
        console.error("Dados:", error.response.data);
      } else if (error.request) {
        console.error("[PmocService] Nenhuma resposta recebida do servidor.");
        console.error("Detalhes da requisição:", error.request);
      } else {
        console.error("[PmocService] Erro ao configurar a requisição:", error.message);
      }

      throw new Error("[PmocService] Erro ao buscar PMOCs.");
    }
  }

  static async createPmoc(token: string, pmocData: Partial<Pmoc>): Promise<Pmoc> {
    try {
      console.log("[PmocService] Criando novo PMOC...");

      console.log("[PmocService] Dados do PMOC:", pmocData);

      const response = await apiClient.post(`${API_BASE_URL}/pmocs`, pmocData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("[PmocService] PMOC criado com sucesso:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("[PmocService] Erro ao criar PMOC:", error);
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Dados:", error.response.data);
        throw new Error(error.response.data.message || "Erro ao criar PMOC.");
      } else if (error.request) {
        console.error("[PmocService] Nenhuma resposta recebida do servidor.");
        throw new Error("Falha na conexão com o servidor.");
      } else {
        console.error("[PmocService] Erro ao configurar requisição:", error.message);
        throw new Error("Erro ao configurar a requisição.");
      }
    }
  }



  static async fetchPmocEquipments(
    token: string,
    pmocId: number,
    page: number = 1,
    perPage: number = 10,
    search: string = "",
    status: string = "",
    equipmentTypeId: string = "",
    brandId: string = "",
    sectorId: number | null = null, // Adicionado
    clientId: number | null = null  // Adicionado
  ): Promise<{ results: PmocEquipment[]; count: number }> {
    try {
      console.log("[PmocService] Iniciando busca por equipamentos do PMOC...");
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        search,
        status,
        equipment_type_id: equipmentTypeId,
        brand_id: brandId,
        sector_id: sectorId?.toString() || '', // Adicionado
        client_id: clientId?.toString() || '', // Adicionado
      }).toString();

      const url = `${API_BASE_URL}/pmocs/${pmocId}/equipments?${params}`;
      console.log("[PmocService] URL do endpoint com filtros:", url);

      const response = await apiClient.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("[PmocService] Resposta do servidor:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("[PmocService] Erro ao buscar equipamentos do PMOC:", error);
      throw new Error("[PmocService] Erro ao buscar equipamentos do PMOC.");
    }
  }


  static async uploadImages(token: string, pmocId: number, equipmentId: number, formData: FormData): Promise<UploadedImage[]> {
    try {
      const response = await apiClient.post(`${API_BASE_URL}/pmocs/${pmocId}/equipments/${equipmentId}/images`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("[PmocService] Erro ao fazer upload de imagens:", error);
      throw new Error("Erro ao fazer upload de imagens.");
    }
  }

  static async fetchEquipmentDetails(
    token: string,
    pmocId: number,
    equipmentId: number
  ): Promise<{
    equipment: EquipmentDetails;
    questions: Question[];
    uploads: string[];
  }> {
    try {
      console.log("[PmocService] Buscando detalhes do equipamento...");
      const url = `${API_BASE_URL}/pmocs/${pmocId}/equipments/${equipmentId}`;
      const response = await apiClient.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("[PmocService] Resposta do servidor:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("[PmocService] Erro ao buscar detalhes do equipamento:", error);
      throw new Error("Erro ao buscar detalhes do equipamento.");
    }
  }

  static async submitAnswers(
    token: string,
    pmocId: number,
    equipmentId: number,
    data: {
      status: "open" | "pending" | "closed";
      answers: { question_id: number; value: string; meta?: any }[];
    }
  ) {
    try {
      console.log("[PmocService] Iniciando envio de respostas...");

      console.log("[PmocService] Token:", token ? "Token recebido" : "Token não fornecido");
      console.log("[PmocService] PMOC ID:", pmocId);
      console.log("[PmocService] Equipment ID:", equipmentId);
      console.log("[PmocService] Dados a serem enviados:", data);

      const url = `${API_BASE_URL}/pmocs/${pmocId}/equipments/${equipmentId}/answers`;
      console.log("[PmocService] URL do endpoint (envio de respostas):", url);

      const response = await apiClient.post(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("[PmocService] Resposta do servidor (envio de respostas):", response.data);

      return response.data;
    } catch (error: any) {
      console.error("[PmocService] Erro ao enviar respostas:", error);
      if (error.response) {
        console.error("[PmocService] Detalhes do erro:", {
          status: error.response.status,
          data: error.response.data,
        });
      } else if (error.request) {
        console.error("[PmocService] Nenhuma resposta recebida do servidor.");
      } else {
        console.error("[PmocService] Erro ao configurar a requisição:", error.message);
      }
      throw new Error("Erro ao enviar respostas.");
    }
  }

  static async fetchSavedAnswers(

    token: string,
    pmocId: number,
    equipmentId: number
  ): Promise<{
    links: { next: string | null; previous: string | null };
    count: number;
    results: { question_id: number; value: string; meta?: any }[];
  }> {
    try {
      console.log("[PmocService] Iniciando busca por respostas salvas...");
      console.log("[PmocService] Token:", token ? "Token recebido" : "Token não fornecido");
      console.log("[PmocService] PMOC ID:", pmocId);
      console.log("[PmocService] Equipment ID:", equipmentId);

      const url = `${API_BASE_URL}/pmocs/${pmocId}/equipments/${equipmentId}/answers`;
      console.log("[PmocService] URL do endpoint (respostas salvas):", url);

      const response = await apiClient.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("[PmocService] Resposta do servidor (respostas salvas):", response.data);

      return response.data;
    } catch (error: any) {
      console.error("[PmocService] Erro ao buscar respostas salvas:", error);
      if (error.response) {
        console.error("[PmocService] Detalhes do erro:", {
          status: error.response.status,
          data: error.response.data,
        });
      } else if (error.request) {
        console.error("[PmocService] Nenhuma resposta recebida do servidor.");
      } else {
        console.error("[PmocService] Erro ao configurar a requisição:", error.message);
      }
      throw new Error("Erro ao buscar respostas salvas.");
    }
  }

}