import axios from 'axios';
import PersonalData from '../Models/PersonalData';
import apiClient from "../Context/ApiClient"
import { API_BASE_URL } from "../config/apiConfig"; // Adicione esta importação no topo

export default class PersonalDataService {
  static async getPersonalData(accessToken: string): Promise<PersonalData> {
    try {
      const response = await apiClient.get(`${API_BASE_URL}/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return new PersonalData(response.data);
    } catch (error: any) {
      throw new Error('Erro ao buscar dados pessoais. Tente novamente mais tarde.');
    }
  }
  static async updatePersonalData(accessToken: string, updatedData: { name?: string; birthdate?: string; rh_factor?: string }) {
    try {
      const endpoint = `${API_BASE_URL}/me`;
      console.log('Atualizando dados pessoais no endpoint:', endpoint);
      console.log('Dados enviados:', updatedData);

      const response = await axios.patch(endpoint, updatedData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log('Resposta da atualização:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Erro durante a atualização dos dados pessoais:', error);
      if (error.response) {
        console.error('Detalhes do erro:', {
          status: error.response.status,
          data: error.response.data,
        });
        throw new Error(`Erro: ${error.response.data.detail || 'Falha ao atualizar os dados.'}`);
      }
      throw new Error('Erro ao conectar ao servidor.');
    }
  }
}
