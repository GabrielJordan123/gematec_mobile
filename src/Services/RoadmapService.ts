import { RoadmapResponse, RoadmapActivity } from '../Models/Roadmap';
import { apiClient } from '../config/apiClient';

export class RoadmapService {
  /**
   * Busca o roteiro atual do técnico para o dia
   */
  static async getCurrentRoadmap(): Promise<RoadmapResponse> {
    try {
      const response = await apiClient.get('/roadmaps/current');
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar roteiro atual:', error);
      throw new Error(error.response?.data?.message || 'Erro ao carregar roteiro');
    }
  }

  /**
   * Busca o roteiro para uma data específica
   */
  static async getRoadmapByDate(date: string): Promise<RoadmapResponse> {
    try {
      const response = await apiClient.get(`/roadmaps/${date}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar roteiro por data:', error);
      throw new Error(error.response?.data?.message || 'Erro ao carregar roteiro');
    }
  }

  /**
   * Atualiza o status de uma atividade
   */
  static async updateActivityStatus(activityId: number, status: RoadmapActivity['status']): Promise<RoadmapActivity> {
    try {
      const response = await apiClient.patch(`/roadmaps/activities/${activityId}/status`, {
        status
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao atualizar status da atividade:', error);
      throw new Error(error.response?.data?.message || 'Erro ao atualizar atividade');
    }
  }

  /**
   * Adiciona notas a uma atividade
   */
  static async addActivityNotes(activityId: number, notes: string): Promise<RoadmapActivity> {
    try {
      const response = await apiClient.patch(`/roadmaps/activities/${activityId}/notes`, {
        notes
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao adicionar notas à atividade:', error);
      throw new Error(error.response?.data?.message || 'Erro ao adicionar notas');
    }
  }
}