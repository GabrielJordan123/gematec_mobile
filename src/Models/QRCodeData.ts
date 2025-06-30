export default class QRCodeData {
  host: string;

  constructor(host: string) {
    this.host = host;
  }

  static fromJSON(json: string): QRCodeData {
    try {
      const parsed = JSON.parse(json);
      if (parsed.host) {
        return new QRCodeData(parsed.host);
      }
      throw new Error("Host não encontrado");
    } catch (error) {
      throw new Error("QR Code inválido");
    }
  }
}
