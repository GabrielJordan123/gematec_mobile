export default class QRCodeService {
  static processQRCode(data: string) {
    try {
      const parsed = JSON.parse(data);
      if (parsed.host) {
        return { host: parsed.host };
      }
      throw new Error("Host não encontrado no QR Code.");
    } catch (error) {
      throw new Error("QR Code inválido.");
    }
  }
}
