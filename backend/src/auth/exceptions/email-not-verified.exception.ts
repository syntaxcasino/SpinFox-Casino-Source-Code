import { UnauthorizedException } from '@nestjs/common';

export class EmailNotVerifiedException extends UnauthorizedException {
  constructor() {
    super({
      statusCode: 401,
      error: 'EMAIL_NOT_VERIFIED',
      message: 'Email not verified. Please verify your email before logging in.',
    });
  }
}