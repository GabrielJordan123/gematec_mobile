import axios from 'axios';
import apiClient from "../Context/ApiClient";
import Client from '../Models/Clientes';
import { API_BASE_URL } from "../config/apiConfig"; // Adicione esta importação no topo
export default class ClientService {

  static async getClients(
    hasContract: boolean,
    page: number,
    accessToken: string,
    searchQuery: string = ""
  ) {
    try {

      if (!accessToken) {
        console.error("[ClientService] Token de acesso ausente.");
        throw new Error("Token de acesso ausente.");
      }

      const endpoint = `${API_BASE_URL}/clients`;
      console.log("[ClientService] Endpoint completo:", endpoint);

      const params = {
        has_contract: hasContract.toString(),
        page,
        search: searchQuery,
        include: "sectors,addresses",
      };

      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      console.log("[ClientService] Iniciando requisição com os seguintes parâmetros:");
      console.log("Parâmetros:", params);
      console.log("Headers:", headers);
      const response = await apiClient.get(endpoint, { params, headers });
      console.log("[ClientService] Dados recebidos:", response.data);
      const clientList = response.data.results.map((data: any) => new Client(data));
      return {
        results: clientList,
        count: response.data.count,
        total_pages: Math.ceil(response.data.count / 10) || 1,
      };
    } catch (error: any) {
      console.error("[ClientService] Erro ao buscar clientes:", error.message || error);
      if (error.response) {
        console.error("[ClientService] Resposta do servidor:", error.response.data);
      } else if (error.request) {
        console.error("[ClientService] Nenhuma resposta recebida do servidor.", error.request);
      } else {
        console.error("[ClientService] Erro ao configurar requisição:", error.message);
      }
      throw error;
    }
  }

  static async getClientDetails(clientId: number, accessToken: string) {
    try {
      const endpoint = `${API_BASE_URL}/clients/${clientId}`;
      console.log("[ClientService] Buscando detalhes do cliente...");
      console.log("[ClientService] Endpoint:", endpoint);
      console.log("[ClientService] Token de Acesso:", accessToken ? "Token recebido" : "Token não fornecido");

      const response = await apiClient.get(endpoint, {
        params: {
          include: "sectors,addresses",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log("[ClientService] Detalhes do cliente recebidos:", response.data);
      return new Client(response.data);
    } catch (error: any) {
      console.error("[ClientService] Erro ao buscar detalhes do cliente:", error);

      if (error.response) {
        console.error("[ClientService] Resposta do Servidor:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        });
      } else if (error.request) {
        console.error("[ClientService] Nenhuma resposta recebida:", error.request);
      } else {
        console.error("[ClientService] Erro na configuração da requisição:", error.message);
      }

      throw new Error("Erro ao conectar ao servidor.");
    }
  }

  static async getClientContracts(clientId: string, accessToken: string) {
    try {
      const endpoint = `${API_BASE_URL}/clients/${clientId}/contracts`;
      console.log("[ClientService] Obtendo contratos do cliente...");
      console.log("[ClientService] Endpoint:", endpoint);

      const response = await apiClient.get(endpoint, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log("[ClientService] Contratos do cliente recebidos:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("[ClientService] Erro ao buscar contratos do cliente:", error);
      throw new Error("Erro ao obter os contratos do cliente.");
    }
  }

  static async getClientSectors(clientId: string, accessToken: string) {
    try {
      const endpoint = `${API_BASE_URL}/clients/${clientId}/sectors`;
      console.log("[ClientService] Obtendo setores do cliente...");
      console.log("[ClientService] Endpoint:", endpoint);

      const response = await apiClient.get(endpoint, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log("[ClientService] Setores do cliente recebidos:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("[ClientService] Erro ao buscar setores do cliente:", error);
      throw new Error("Erro ao obter os setores do cliente.");
    }
  }

  static async getClientContacts(clientId: string, accessToken: string) {
    try {
      const endpoint = `${API_BASE_URL}/clients/${clientId}/contacts`;
      console.log("[ClientService] Obtendo contatos do cliente...");
      console.log("[ClientService] Endpoint:", endpoint);

      const response = await apiClient.get(endpoint, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log("[ClientService] Contatos do cliente recebidos:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("[ClientService] Erro ao buscar contatos do cliente:", error);
      throw new Error("Erro ao obter os contatos do cliente.");
    }
  }

  static async getClientAddresses(clientId: string, accessToken: string) {
    try {
      const endpoint = `${API_BASE_URL}/clients/${clientId}/addresses`;
      console.log("[ClientService] Obtendo endereços do cliente...");
      console.log("[ClientService] Endpoint:", endpoint);

      const response = await apiClient.get(endpoint, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log("[ClientService] Endereços do cliente recebidos:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("[ClientService] Erro ao buscar endereços do cliente:", error);
      throw new Error("Erro ao obter os endereços do cliente.");
    }
  }

}
