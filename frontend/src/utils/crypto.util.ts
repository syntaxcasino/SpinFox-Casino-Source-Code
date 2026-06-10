import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY || "Sp1nF0xConnect2025At";

export function encryptReq<T>(data: T): { encData: string } {
  const strData = typeof data === "string" ? data : JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(strData, SECRET_KEY).toString();
  return { encData: encrypted };
}

export function decryptRes<T = any>(encData: string): T {
  const bytes = CryptoJS.AES.decrypt(encData, SECRET_KEY);
  const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decryptedText);
}
