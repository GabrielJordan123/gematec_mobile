export interface EquipmentDetails {
    id: number;
    tag: string;
    patrimony: string;
    serial_number: string;
    capacity: string;
    voltage: number;
    electric_current: number;
    sector_name: string;
    client_name: string;
    brand_name: string;
    technology: string;
    equipment_type_name: string;
    coil_type_name: string;
    evaporator_type_name: string;
    condenser_type_name: string;
    status: "open" | "pending" | "closed"; 
  }
  
  export interface Question {
    id: number;
    title: string;
    description?: string;
    answer_type: "select" | "radio" | "radio_with_justification" | "measure" | "text";
    meta: {
      options?: string[];
      justification_target?: string;
      unit?: string;
    };
  }