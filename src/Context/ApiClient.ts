import axios, { InternalAxiosRequestConfig, AxiosError, AxiosResponse } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/apiConfig";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
});

apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
        const accessToken = await AsyncStorage.getItem("access_token");
        const slidingToken = await AsyncStorage.getItem("sliding_token");

        if (!config.headers) {
            config.headers = {} as any;
        }

        // Usa o sliding token para os endpoints /accounts e /account/switch
        if (config.url?.includes("/accounts") || config.url?.includes("/account/switch")) {
            if (slidingToken) {
                config.headers.Authorization = `Bearer ${slidingToken}`;
            }
        } else if (accessToken) {
            // Usa o access token para os outros endpoints
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const newAccessToken = await refreshAccessToken();
                if (!newAccessToken) {
                    throw new Error("Falha ao renovar o token. Faça login novamente.");
                }

                await AsyncStorage.setItem("access_token", newAccessToken);

                if (!originalRequest.headers) {
                    originalRequest.headers = {} as any;
                }
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return apiClient(originalRequest);
            } catch (refreshError) {
                console.error("[apiClient] Erro ao renovar token:", refreshError);
                await AsyncStorage.removeItem("access_token");
                await AsyncStorage.removeItem("refresh_token");
                throw refreshError;
            }
        }

        return Promise.reject(error);
    }
);

const refreshAccessToken = async () => {
    try {
        const refreshToken = await AsyncStorage.getItem("refresh_token");
        if (!refreshToken) {
            throw new Error("Refresh token não encontrado.");
        }

        const response = await axios.post(
            `${API_BASE_URL}/refresh`, // Ajustado
            { refresh_token: refreshToken },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        const { access, refresh: newRefreshToken } = response.data;

        if (newRefreshToken) {
            await AsyncStorage.setItem("refresh_token", newRefreshToken);
        }

        return access;
    } catch (error) {
        console.error("[refreshAccessToken] Erro ao renovar token:", error);
        throw error;
    }
};

export default apiClient;