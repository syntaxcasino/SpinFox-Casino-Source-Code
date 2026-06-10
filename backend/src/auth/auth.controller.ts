// auth.controller.ts
import { Controller, Post, Body, UseInterceptors, Get, Req, UseGuards, BadRequestException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { EncryptResponseInterceptor } from "../utils/crypto.util";
import { LoginUserDto, RegisterUserDto } from "./dto/user.dto";
import { AuthenticatedRequest } from "src/utils/api";
import { AuthGuard } from "@nestjs/passport";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { ResendVerificationDto } from "./dto/resend-verification.dto";
import { ForgotPasswordDto, ResetPasswordDto } from "./dto/forgot-password.dto";

@Controller("auth")
@UseInterceptors(EncryptResponseInterceptor) // Encrypt every response in this controller
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post("login")
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Post("register")
  async register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Post("verify-email")
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Get('google/callback')
  async googleCallback(@Req() req) {
    const { username, email, password } = req.user; // Assuming user data is available here.
    await this.authService.register({ username, email, password });
    return 'User registered successfully';
  }

  @Post('user')
  @UseGuards(AuthGuard('jwt'))
  async getUser(
    @Req() { user: { userId } }: AuthenticatedRequest,
  ) {
    if (!userId) return "no user id"
    return await this.authService.getUser(userId);
  }

  @Post('users')
  @UseGuards(AuthGuard('jwt'))
  async getUsers() {
    return await this.authService.getUsers();
  }

  @Post('userbyid')
  @UseGuards(AuthGuard('jwt'))
  async getUserById(@Body() req: { id: number }) {
    return await this.authService.getUserById(req.id);
  }

  @Post('get-email')
  async getEmailByUsername(@Body() body: { username: string }) {
    const { username } = body;
    if (!username) {
      throw new BadRequestException('Username is required');
    }
    return this.authService.getEmailByUsername(username);
  }

  @Post('resend-verification')
  async resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.requestPasswordReset(dto);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
