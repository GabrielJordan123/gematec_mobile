export interface EquipmentType {
  id: number;
  name: string;
}

export interface Brand {
  id: number;
  name: string;
}

export interface PmocEquipment {
  id: number;
  tag: string;
  patrimony: string;
  equipment_type: EquipmentType;
  brand: Brand;
  technology: string;
  status: "open" | "pending" | "closed";
  sector_id: number | null;
  client_id: number | null;
}