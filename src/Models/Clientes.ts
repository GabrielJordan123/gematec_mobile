
export interface Sector {
  id: number;
  name: string;
}

export interface Address {
  id: number;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  neighborhood?: string; // Adicionado
  number?: string; // Adicionado
  complement?: string; // Adicionado
  reference_point?: string; // Adicionado
  zip_code?: string; //
}

export interface IClient {
  id: number;
  name: string;
  email: string;
  document: string | null;
  phone: string | null;
  hasContract: boolean;
  sectors: Sector[] | null;
  addresses: Address[] | null;
}

export default class Client implements IClient {
  id: number;
  name: string;
  email: string;
  document: string | null;
  phone: string | null;
  hasContract: boolean;
  sectors: Sector[] | null;
  addresses: Address[] | null;

  constructor(data: any) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.document = data.document || null;
    this.phone = data.phone || null;
    this.hasContract = data.has_contract || false;
    this.sectors = data.sectors || null;
    this.addresses = data.addresses || null;
  }
}