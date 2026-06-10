import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Inject,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { LoginUserDto, RegisterUserDto } from "./dto/user.dto";
import { ethers } from "ethers";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SendTransactionError, SystemProgram, Transaction } from "@solana/web3.js";
import { getAssociatedTokenAddress } from '@solana/spl-token';
import * as bs58 from "bs58";
import * as bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import ECPairFactory from "ecpair";
import { toHex } from "src/utils/crypto.util";
import Redis from "ioredis";
import { ApiService } from "src/api/api.service";
import { MailerService } from "../mailer/mailer.service";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { ResendVerificationDto } from "./dto/resend-verification.dto";
import { ForgotPasswordDto, ResetPasswordDto } from "./dto/forgot-password.dto";
import { IUser } from "src/interfaces/user.interface";
import { EmailNotVerifiedException } from "./exceptions/email-not-verified.exception";
import { ConfigService } from "@nestjs/config";

const chalk = require("chalk");

@Injectable()
export class AuthService {
  private hotWallet: Keypair;
  private connection: Connection;
  constructor(
    private config: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private readonly apiService: ApiService,
    private readonly mailerService: MailerService,
    @Inject("REDIS_CLIENT") private redis: Redis
  ) {
    const hotWalletArray: number[] = JSON.parse(this.config.get<string>('SOLANA_HOT_WALLET')!);
    this.hotWallet = Keypair.fromSecretKey(Uint8Array.from(hotWalletArray));

    const rpcUrl = this.config.get<string>('SOLANA_RPC');
    this.connection = new Connection(rpcUrl!, 'confirmed');
  }

  async validateUser(loginUserDto: LoginUserDto): Promise<User | null> {
    const { usernameOrEmail, password } = loginUserDto;

    const isEmail = usernameOrEmail.includes("@");
    const user = await this.userRepository.findOne({
      where: isEmail
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail },
    });

    if (!user) return null;

    const isPasswordValid = await user.validatePassword(password);
    return isPasswordValid ? user : null;
  }

  async login(loginUserDto: LoginUserDto): Promise<{ access_token: string }> {
    const { usernameOrEmail, password, rememberMe } = loginUserDto;

    // 1. Validate input
    if (!usernameOrEmail || !password) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'BAD_REQUEST',
        message: 'Username (or email) and password are required.',
      });
    }

    // 2. Determine lookup field
    const isEmail = usernameOrEmail.includes('@');
    const user = await this.userRepository.findOne({
      where: isEmail
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail },
    });

    // 3. Handle user not found
    if (!user) {
      throw new NotFoundException({
        statusCode: 404,
        error: isEmail ? 'EMAIL_NOT_FOUND' : 'USERNAME_NOT_FOUND',
        message: isEmail
          ? "Email doesn't exist."
          : "Username doesn't exist.",
      });
    }

    // 4. Enforce email verification
    if (!user.isVerified) {
      throw new UnauthorizedException({
        statusCode: 401,
        error: 'EMAIL_NOT_VERIFIED',
        message: 'Email not verified. Please verify your email before logging in.',
      });
    }

    // 5. Validate password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        statusCode: 401,
        error: 'INVALID_PASSWORD',
        message: 'Invalid password.',
      });
    }

    // 6. Generate JWT
    const jwtPayload = { username: user.username, email: user.email, sub: user.id };
    const tokenExpiry = rememberMe ? '7d' : '1h';
    const access_token = this.jwtService.sign(jwtPayload, {
      expiresIn: tokenExpiry,
    });

    return { access_token };
  }



  async register(
    registerUserDto: RegisterUserDto
  ): Promise<{ msg: string; success: boolean; access_token: string }> {
    const { username, email, password } = registerUserDto;

    try {
      // 🔍 Check duplicates
      const existingUser = await this.userRepository.findOne({ where: { username } });
      if (existingUser)
        return { msg: 'User already exists', success: false, access_token: '' };

      const existingEmail = await this.userRepository.findOne({ where: { email } });
      if (existingEmail)
        return { msg: 'Email already exists', success: false, access_token: '' };

      // 🪙 Create EVM Wallet
      const wallet = ethers.Wallet.createRandom();
      const EVMAddress = wallet.address;
      const EVMprivateKey = wallet.privateKey;

      // 💎 Create Solana Wallet (deposit address)
      const keypair = Keypair.generate();
      const SolpublicKey = keypair.publicKey.toBase58();
      const SolsecretKey = bs58.encode(keypair.secretKey);

      // 🎯 Derive USDC/USDT ATAs (no creation needed yet)
      const solWalletPubkey = new PublicKey(SolpublicKey);
      const usdcMint = new PublicKey(process.env.SOLANA_USDC_ADDRESS!);
      const usdtMint = new PublicKey(process.env.SOLANA_USDT_ADDRESS!);

      const usdcATA = await getAssociatedTokenAddress(usdcMint, solWalletPubkey);
      const usdtATA = await getAssociatedTokenAddress(usdtMint, solWalletPubkey);

      // ⚠️ No funding step needed!
      // The deposit wallet will receive tokens directly from users.
      // You will only fund it later (0.001 SOL) when sweeping funds.

      // 🪙 Create Bitcoin Wallet
      const ECPair = ECPairFactory(ecc);
      const keyPair = ECPair.makeRandom();
      const privateKeyBuffer = keyPair.privateKey;
      const pubkey = keyPair.publicKey;
      const { address: p2wpkh } = bitcoin.payments.p2wpkh({
        pubkey: Buffer.from(pubkey),
        network: bitcoin.networks.bitcoin,
      });
      const BTCAddress = p2wpkh;
      const BTCprivatekey = privateKeyBuffer ? toHex(privateKeyBuffer) : undefined;

      // 🧱 Create and Save User
      const newUser = new User();
      newUser.username = username;
      newUser.email = email;
      newUser.password = password;
      newUser.usercode = username.toLowerCase();

      newUser.EVMAddress = EVMAddress;
      newUser.EVMPrivatekey = EVMprivateKey;

      newUser.SOLAddress = SolpublicKey;
      newUser.SOLPrivatekey = SolsecretKey;
      newUser.SOLUSDCAddress = usdcATA.toBase58();
      newUser.SOLUSDTAddress = usdtATA.toBase58();

      newUser.BTCAddress = BTCAddress ?? '';
      newUser.BTCPrivatekey = BTCprivatekey ?? '';

      newUser.ethBalance = '0';
      newUser.usdtBalance = '0';
      newUser.btcBalance = '0';
      newUser.solBalance = '0';
      newUser.realBalance = 0;
      newUser.bonusBalance = 0;
      newUser.level = 1;
      newUser.loyaltyPoints = 0;
      newUser.avatar = '';

      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      newUser.verificationCode = verificationCode;
      newUser.isVerified = false;

      const savedUser = await this.userRepository.save(newUser);

      // Store EVM deposit address in Redis for deposit tracking
      await this.redis.sadd('deposit_addresses_set', EVMAddress.toLowerCase());

      // 🪪 Generate Access Token
      const payload = { username, email, sub: savedUser.id };
      const access_token = this.jwtService.sign(payload, { expiresIn: '1h' });

      // 📧 Send verification email
      await this.mailerService.sendMail(
        email,
        'Verify your email',
        `Your verification code is ${verificationCode}`,
        `<h1>Email Verification</h1><p>Your code is <b>${verificationCode}</b></p>`
      );

      return {
        access_token,
        success: true,
        msg: 'Registration successful! Please verify your email before logging in.',
      };
    } catch (error: any) {
      return {
        msg: error.message || 'Registration failed',
        success: false,
        access_token: '',
      };
    }
  }



  async getUser(userId: number): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return null;
    return user;
  }

  async getUserById(id: number): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) return null;
    return user;
  }

  async getUsers(): Promise<User[] | null> {
    const users = await this.userRepository.find();
    if (!users) return null;
    return users;
  }

  async sendWelcomeEmail(userEmail: string) {
    await this.mailerService.sendMail(
      userEmail,
      "🎉 Welcome to SpinFox!",
      "Thanks for joining us!",
      `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h1 style="color: #2c3e50;">Welcome to My App 🎉</h1>
        <p>Hi there,</p>
        <p>We’re absolutely thrilled to have you on board! Thank you for registering and becoming part of our community.</p>
        <p>Here’s what you can do next:</p>
        <ul>
          <li>👉 Explore your dashboard</li>
          <li>👉 Set up your profile</li>
          <li>👉 Start enjoying all the features we’ve built for you</li>
        </ul>
        <p>If you ever need help, our support team is always just a click away.</p>
        <br/>
        <p>Once again, welcome to <strong>My App</strong> – we’re excited to have you with us!</p>
        <br/>
        <p>Cheers,</p>
        <p><strong>The My App Team</strong></p>
      </div>
    `
    );
  }

  async verifyEmail({ email, code }: VerifyEmailDto) {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new BadRequestException("User not found");
      }

      if (user.isVerified) {
        return { success: true, msg: "Email already verified" };
      }
      if (user.verificationCode !== code) {
        throw new BadRequestException("Invalid verification code");
      }

      user.isVerified = true;
      user.verificationCode = "";
      await this.userRepository.save(user);

      // Seamless mode: User will be auto-created on aggregator when they launch their first game
      // No need to manually create user on aggregator
      this.sendWelcomeEmail(user.email);
      // Issue JWT
      const payload = { sub: user.id, email: user.email, username: user.username };
      const access_token = this.jwtService.sign(payload);

      return { success: true, msg: "Email verified successfully", access_token };
    } catch (error) {
      throw new BadRequestException(error.message || "Verification failed");
    }
  }

  async resendVerification({ email }: ResendVerificationDto) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException("User not found");
    }

    if (user.isVerified) {
      return { success: true, msg: "Email already verified" };
    }

    // Generate new code
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = newCode;
    await this.userRepository.save(user);

    // Send email
    await this.mailerService.sendMail(
      email,
      "Your Verification Code",
      "Please verify your email address",
      `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
      <h2>Hello,</h2>
      <p>Thank you for signing up! To complete your registration and verify your email address, please use the verification code below:</p>
      <p style="font-size: 18px; font-weight: bold; color: #2c3e50;">
        Your verification code is: <strong>${newCode}</strong>
      </p>
      <p>This code will expire in <strong>10 minutes</strong>, so be sure to use it right away.</p>
      <p>If you didn’t request this code, please ignore this message. Your account will remain secure.</p>
      <br/>
      <p>Best regards,</p>
      <p><strong>The Support Team</strong></p>
    </div>
  `
    );

    return { success: true, msg: "Verification code resent" };
  }

  async requestPasswordReset({ email }: ForgotPasswordDto) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException("Email not found");
    }

    // Generate a temporary token (expires in 1 hour)
    const token = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: "1h" }
    );

    // Store token in Redis for validation (optional, extra security)
    await this.redis.set(`reset_password_${token}`, user.id, "EX", 3600);

    // Send email with reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.mailerService.sendMail(
      user.email,
      "Password Reset Request",
      "Reset your password",
      `
  <html>
    <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:auto; background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 0 10px rgba(0,0,0,0.1);">
        <tr>
          <td style="background-color:#896CEF; text-align:center; padding:20px; color:white;">
            <h2>Password Reset Request</h2>
          </td>
        </tr>
        <tr>
          <td style="padding:30px; color:#333; line-height:1.5;">
            <p>Hello ${user.username},</p>
            <p>We received a request to reset your password. Click the button below to reset it. This link is valid for <strong>1 hour</strong>.</p>
            <p style="text-align:center; margin:30px 0;">
              <!-- Button as clickable link -->
              <a href="${resetLink}" target="_blank" style="
                display:inline-block;
                padding:12px 24px;
                font-family: Arial, sans-serif;
                font-size:16px;
                color:#ffffff;
                text-decoration:none;
                font-weight:bold;
                background-color:#896CEF;
                border-radius:6px;
              ">Reset Password</a>
            </p>
            <p>If you didn’t request a password reset, you can safely ignore this email.</p>
            <p>Thanks,<br/>Your Company Name</p>
          </td>
        </tr>
        <tr>
          <td style="background-color:#f0f0f0; padding:10px; text-align:center; font-size:12px; color:#888;">
            © ${new Date().getFullYear()} Your Company Name. All rights reserved.
          </td>
        </tr>
      </table>
    </body>
  </html>
  `
    );

    return { success: true, msg: "Reset password email sent" };
  }

  async resetPassword({ token, newPassword }: ResetPasswordDto) {
    try {
      // Validate JWT token
      const payload: any = this.jwtService.verify(token);
      const redisValue = await this.redis.get(`reset_password_${token}`);
      if (!redisValue || Number(redisValue) !== payload.sub) {
        throw new BadRequestException("Invalid or expired token");
      }

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });
      if (!user) throw new NotFoundException("User not found");

      user.password = newPassword; // will be hashed by @BeforeInsert/@BeforeUpdate
      await this.userRepository.save(user);

      // Remove token from Redis
      await this.redis.del(`reset_password_${token}`);

      return { success: true, msg: "Password reset successfully" };
    } catch (error) {
      throw new BadRequestException("Invalid or expired token");
    }
  }

  async getEmailByUsername(username: string): Promise<{ email: string }> {
    const user = await this.userRepository.findOne({
      where: { username },
      select: ['email'], // only select email for privacy
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { email: user.email };
  }
}

