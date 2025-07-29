export interface Category {
    id: number;
    name: string;
}

export interface Manual {
    id: number;
    name: string;
    category: Category;
    file_url: string; // Added for download functionality
}