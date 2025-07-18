// src/Models/MenuItem.ts
export interface MenuItem {
    slug: string;
    icon?: string; // Ex: "pi pi-briefcase" - para itens de nível superior
    items?: MenuItem[]; // Sub-itens do menu (anteriormente 'children')

    // Propriedades para itens aninhados (e também podem estar em nível superior, se o backend enviar)
    required_permissions?: string[];
    required_apps?: string[]; // Ex: ["web", "mobile"]

    // Propriedades que serão mapeadas no frontend para uso no app
    title?: string; // Título amigável para exibição (ex: "Operacional", "Clientes com Contrato")
    route?: string; // Nome da rota para navegação (ex: "HomeScreen", "ClientsComContratoScreen")
    action?: 'logout'; // Ação específica (ex: 'logout')
}
