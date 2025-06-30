export interface Activity {
    id: number;
    type: "pmoc" | "service_order" | "technical_assistance"; // Tipos específicos
    created_at: string; // Data de abertura (comum a todos)
    status: "open" | "closed" | "pending" | string; // Status (comum a todos)
    client?: { // Opcional, usado em PMOC
        id: number;
        name: string;
        email?: string;
        document?: string;
        phone?: string;
    };
    deadline?: string; // Opcional, usado em PMOC
    equipment?: { // Opcional, usado em Service Order e Technical Assistance
        id: number;
        tag?: string;
        patrimony?: string;
        equipment_type?: { id: number; name: string };
        brand?: { id: number; name: string };
        technology?: string;
    };
    count_equipment?: number; // Opcional, usado em PMOC
    count_equipment_close?: number; // Opcional, usado em PMOC
}