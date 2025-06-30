import { Equipment } from "./Equipament";
import { Answer } from "./ServiceOrder";
import { UploadedImage } from "./ServiceOrder";

export interface TechnicalAssistance {
    id: number;
    equipment: Equipment;
    status: "open" | "pending" | "closed";
    created_at: string;
    answers: Answer[] | null;
    images: UploadedImage[] | null;
    questions: Question[];  // Adicionado para alinhar com o backend
}

export interface Question {
    id: number;
    title: string;
    description?: string;
    answer_type: "select" | "radio" | "radio_with_justification" | "measure" | "text";
    meta: {
        options?: string[];
        unit?: string;
        justification_target?: string;
        justification_max_length?: number;
    };
    order: number;
}