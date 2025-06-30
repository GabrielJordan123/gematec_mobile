export interface Client {
  id: number;
  name: string;
  email: string;
  document: string;
  phone: string;
}

export interface Pmoc {
  id: number;
  client: Client; // Retornado pela API após criação
  client_id: number; // Usado na criação
  sector_id: number; // Usado na criação
  equipment_ids: number[]; // Usado na criação (array de IDs numéricos)
  start_date: string; // Data de início (ex.: "2025-03-07")
  frequency_days: number; // Frequência em dias
  deadline: string; // Retornado pela API (ex.: "2025-12-31")
  status: "open" | "pending" | "closed";
  equipment_closed_count: number;
}