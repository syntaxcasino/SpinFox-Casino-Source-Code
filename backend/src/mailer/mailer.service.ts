import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // e.g., smtp.gmail.com
      port: 587, // 465 for SSL, 587 for TLS
      secure: false, // true for port 465, false for 587
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendMail(to: string, subject: string, text: string, html?: string) {
    const info = await this.transporter.sendMail({
      from: '"My App" <thomasken900125@gmail.com>', // sender address
      to,
      subject,
      text,
      html,
    });
    return info;
  }
}