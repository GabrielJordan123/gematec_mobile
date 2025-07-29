export default class PersonalData {
    id: number;
    name: string;
    email: string;
    document: string | null;
    rg: string | null;
    phone: string | null;
    ctps: string | null;
    rh_factor: string | null;
    birthdate: string | null;
    admission_date: string | null;
    group: any | null; // Adicionado
    role: any | null; // Adicionado
  
    constructor(data: any) {
      this.id = data.id;
      this.name = data.name;
      this.email = data.email;
      this.document = data.document || '';
      this.rg = data.rg || '';
      this.phone = data.phone || '';
      this.ctps = data.ctps || '';
      this.rh_factor = data.rh_factor || '';
      this.birthdate = data.birthdate || '';
      this.admission_date = data.admission_date || '';
      this.group = data.group || null; // Inicializa com null se não houver
      this.role = data.role || null;   // Inicializa com null se não houver
    }
  }
  