export const decodeToken = (token: string): any => {
  try {
    console.log("Iniciando a decodificação do token...");
    if (!token || typeof token !== "string") {
      throw new Error("Token inválido ou ausente.");
    }

    console.log("Token recebido:", token);

    // Divide o token em suas três partes: header, payload, signature  
    const [header, payload, signature] = token.split(".");
    if (!payload) {
      throw new Error("Token malformado.");
    }

    // Decodifica o payload do JWT (Base64)
    const decodedPayload = JSON.parse(atob(payload));
    console.log("Payload decodificado:", decodedPayload);

    return decodedPayload;
  } catch (error) {
    console.error("Erro ao decodificar o token:", error);
    throw new Error("Falha na decodificação do token.");
  }
};
