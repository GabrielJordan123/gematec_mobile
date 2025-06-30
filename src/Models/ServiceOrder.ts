export interface Answer {
    question_id: number;
    answer: string | number | boolean;
    justification?: string;
}

export interface UploadedImage {
    id: number;
    url: string;
    uploaded_at: string;
}

export interface Question {
    id: number;
    title: string;
    description?: string;
}
interface Equipment {
    id: number;
    tag: string;
    equipmentType: {  // Mudado de equipment_type para equipmentType
        id: number;
        name: string;
    };
    brand: {
        id: number;
        name: string;
    };
    technology: string;  // Adicionado do ServiceOrder
    sector_id: number | null;  // Adicionado do ServiceOrder
    client_id: number | null;  // Adicionado do ServiceOrder
}
export interface ServiceOrder {
    id: number;
    client: {
        name: string;
        email: string;
    };
    equipment: Equipment;
    status: "open" | "pending" | "closed";
    created_at: string;
    // Opcional: adicionar se precisar usar no futuro
    answers?: Answer[] | null;
    images?: UploadedImage[] | null;
    questions?: Question[] | null;
}