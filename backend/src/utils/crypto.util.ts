// crypto.util.ts
import CryptoJS from 'crypto-js';
import {
  Injectable,
  NestMiddleware,
  BadRequestException,
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY: string = process.env.SECRET_KEY || "Sp1nF0xConnect2025At";

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function encryptRes<T>(data: T): { encData: string | null } {
  try {
    const strData = typeof data === 'string' ? data : JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(strData, SECRET_KEY).toString();
    return { encData: encrypted };
  } catch (error) {
    console.error('Encryption error:', error);
    return { encData: null };
  }
}

@Injectable()
export class DecryptBodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: Function) {
    try {
      if (!req || !req.body || typeof req.body !== 'object') {
        return next(); // Skip decryption if no body
      }
      const { encData } = req.body as { encData?: string };
      if (!encData) {
        throw new BadRequestException('encData is required');
      }
      const bytes = CryptoJS.AES.decrypt(
        decodeURIComponent(encData),
        SECRET_KEY,
      );
      const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
      if (!decryptedText) {
        throw new BadRequestException('Invalid encrypted data');
      }
      req.body = JSON.parse(decryptedText);
      next();
    } catch(error) {
      console.error('Decryption error:', error);
      throw new BadRequestException('Invalid encrypted data');
    }
  }
}

@Injectable()
export class EncryptResponseInterceptor<T> implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => encryptRes(data)));
  }
}
