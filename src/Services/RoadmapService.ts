import axios from "axios";
import { buildApiUrlForAccount } from "../config/apiConfig";
import { RoadmapResponse, RoadmapActivity } from '../Models/Roadmap';

export class RoadmapService {
  /**
   * Busca o roteiro atual do técnico para o dia
   */
  static async getCurrentRoadmap(): Promise<RoadmapResponse> {
    try {
      // Montar a URL dinâmica com o subdomínio da conta
      const apiUrl = await buildApiUrlForAccount();
      const endpoint = `${apiUrl}/roadmaps/current`;
      console.log('[RoadmapService] Endpoint de roteiro atual:', endpoint);
      
      const response = await axios.get(endpoint);
      return response.data;
    } catch (error: any) {
      console.error('[RoadmapService] Erro ao buscar roteiro atual:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('Token inválido ou expirado.');
        } else if (error.response.status === 403) {
          throw new Error('Permissão negada.');
        } else if (error.response.status === 404) {
          throw new Error('Endpoint não encontrado.');
        } else if (error.response.status === 500) {
          throw new Error('Erro interno do servidor. Tente novamente mais tarde.');
        } else {
          throw new Error(`Erro inesperado: ${error.response.status}.`);
        }
      } else if (error.request) {
        throw new Error('Erro ao conectar ao servidor. Verifique sua conexão com a internet.');
      } else {
        throw new Error(`Erro inesperado: ${error.message}`);
      }
    }
  }

  /**
   * Busca o roteiro para uma data específica
   */
  static async getRoadmapByDate(date: string): Promise<RoadmapResponse> {
    try {
      const apiUrl = await buildApiUrlForAccount();
      const endpoint = `${apiUrl}/roadmaps/${date}`;
      console.log('[RoadmapService] Endpoint de roteiro por data:', endpoint);
      
      const response = await axios.get(endpoint);
      return response.data;
    } catch (error: any) {
      console.error('[RoadmapService] Erro ao buscar roteiro por data:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('Token inválido ou expirado.');
        } else if (error.response.status === 403) {
          throw new Error('Permissão negada.');
        } else if (error.response.status === 404) {
          throw new Error('Endpoint não encontrado.');
        } else if (error.response.status === 500) {
          throw new Error('Erro interno do servidor. Tente novamente mais tarde.');
        } else {
          throw new Error(`Erro inesperado: ${error.response.status}.`);
        }
      } else if (error.request) {
        throw new Error('Erro ao conectar ao servidor. Verifique sua conexão com a internet.');
      } else {
        throw new Error(`Erro inesperado: ${error.message}`);
      }
    }
  }

  /**
   * Atualiza o status de uma atividade
   */
  static async updateActivityStatus(activityId: number, status: RoadmapActivity['status']): Promise<RoadmapActivity> {
    try {
      const apiUrl = await buildApiUrlForAccount();
      const endpoint = `${apiUrl}/roadmaps/activities/${activityId}/status`;
      console.log('[RoadmapService] Endpoint de atualização de status:', endpoint);
      
      const response = await axios.patch(endpoint, { status });
      return response.data;
    } catch (error: any) {
      console.error('[RoadmapService] Erro ao atualizar status da atividade:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('Token inválido ou expirado.');
        } else if (error.response.status === 403) {
          throw new Error('Permissão negada.');
        } else if (error.response.status === 404) {
          throw new Error('Atividade não encontrada.');
        } else if (error.response.status === 500) {
          throw new Error('Erro interno do servidor. Tente novamente mais tarde.');
        } else {
          throw new Error(`Erro inesperado: ${error.response.status}.`);
        }
      } else if (error.request) {
        throw new Error('Erro ao conectar ao servidor. Verifique sua conexão com a internet.');
      } else {
        throw new Error(`Erro inesperado: ${error.message}`);
      }
    }
  }

  /**
   * Adiciona notas a uma atividade
   */
  static async addActivityNotes(activityId: number, notes: string): Promise<RoadmapActivity> {
    try {
      const apiUrl = await buildApiUrlForAccount();
      const endpoint = `${apiUrl}/roadmaps/activities/${activityId}/notes`;
      console.log('[RoadmapService] Endpoint de adição de notas:', endpoint);
      
      const response = await axios.patch(endpoint, { notes });
      return response.data;
    } catch (error: any) {
      console.error('[RoadmapService] Erro ao adicionar notas à atividade:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('Token inválido ou expirado.');
        } else if (error.response.status === 403) {
          throw new Error('Permissão negada.');
        } else if (error.response.status === 404) {
          throw new Error('Atividade não encontrada.');
        } else if (error.response.status === 500) {
          throw new Error('Erro interno do servidor. Tente novamente mais tarde.');
        } else {
          throw new Error(`Erro inesperado: ${error.response.status}.`);
        }
      } else if (error.request) {
        throw new Error('Erro ao conectar ao servidor. Verifique sua conexão com a internet.');
      } else {
        throw new Error(`Erro inesperado: ${error.message}`);
      }
    }
  }
}