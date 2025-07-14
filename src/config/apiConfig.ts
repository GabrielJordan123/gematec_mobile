// src/config/apiConfig.ts

// URLs base para os ambientes
const API_BASE_URLS = {
    production: "https://keosstg001.xyz/api",
    homologation: "https://keosstg001.xyz/api",
};

// Escolha do ambiente (pode ser configurado por variável de ambiente ou constante)
const ENVIRONMENT = "homologation"; // Mude para "production" quando for para produção

// URL base exportada
export const API_BASE_URL = API_BASE_URLS[ENVIRONMENT as keyof typeof API_BASE_URLS];