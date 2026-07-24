import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

const SALT_ROUNDS = 10;
const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1h

// Number of posts a FREE_TRIAL user can create before needing to upgrade.
// Surfaced to the client so the dashboard can show remaining trial usage.
export const TRIAL_POST_LIMIT = 5;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  private signToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  private omitPassword<T extends { password: string | null }>(user: T) {
    const rest: Omit<T, 'password'> = { ...user };
    delete (rest as { password?: string | null }).password;
    return rest;
  }

  // Adds the client-facing trial limit alongside the user record so the
  // dashboard can render "X posts remaining" without hardcoding the limit.
  private attachPlanInfo<T>(user: T) {
    return { ...user, trialPostsLimit: TRIAL_POST_LIMIT };
  }

  private generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const verificationToken = this.generateToken();

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        verificationToken,
        verificationTokenExpiresAt: new Date(
          Date.now() + VERIFICATION_TOKEN_TTL_MS,
        ),
      },
      omit: { password: true },
    });

    await this.mailService.sendVerificationEmail(user.email, verificationToken);

    const accessToken = this.signToken({
      sub: user.id,
      email: user.email,
      tokenVersion: user.tokenVersion,
    });

    return {
      accessToken,
      user: this.attachPlanInfo(user),
    };
  }

  async loginWithGoogle(profile: {
    googleId: string;
    email?: string;
    name?: string;
    avatarUrl?: string;
  }) {
    if (!profile.email) {
      throw new BadRequestException('Google account has no email');
    }

    let user = await this.prisma.user.findUnique({
      where: { googleId: profile.googleId },
    });

    if (!user) {
      user = await this.prisma.user.findUnique({
        where: { email: profile.email },
      });

      user = user
        ? await this.prisma.user.update({
            where: { id: user.id },
            data: { googleId: profile.googleId },
          })
        : await this.prisma.user.create({
            data: {
              email: profile.email,
              googleId: profile.googleId,
              name: profile.name,
              avatarUrl: profile.avatarUrl,
              isVerified: true,
            },
          });
    }

    const accessToken = this.signToken({
      sub: user.id,
      email: user.email,
      tokenVersion: user.tokenVersion,
    });

    return { accessToken, user: this.omitPassword(user) };
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findUnique({
      where: { verificationToken: token },
    });

    if (
      !user ||
      !user.verificationTokenExpiresAt ||
      user.verificationTokenExpiresAt < new Date()
    ) {
      throw new BadRequestException('Verification link is invalid or expired');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiresAt: null,
      },
    });

    return { message: 'Email verified successfully' };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { subscription: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      throw new UnauthorizedException(
        'This account signed up with Google. Please use "Continue with Google" to log in.',
      );
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    const accessToken = this.signToken({
      sub: user.id,
      email: user.email,
      tokenVersion: user.tokenVersion,
    });

    return {
      accessToken,
      user: this.attachPlanInfo(this.omitPassword(user)),
    };
  }

  // Stateless JWT can't be "deleted" server-side, so logout bumps the
  // user's tokenVersion. Any token signed before this call carries the old
  // version and gets rejected by JwtStrategy from now on.
  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
    });

    return { message: 'Logged out successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Always return the same message, whether or not the email exists,
    // so the endpoint can't be used to enumerate registered emails.
    const genericResponse = {
      message: 'If that email exists, a reset link has been sent',
    };

    if (!user) return genericResponse;

    const resetToken = this.generateToken();
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordTokenExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    await this.mailService.sendPasswordResetEmail(user.email, resetToken);

    return genericResponse;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { resetPasswordToken: dto.token },
    });

    if (
      !user ||
      !user.resetPasswordTokenExpiresAt ||
      user.resetPasswordTokenExpiresAt < new Date()
    ) {
      throw new BadRequestException('Reset link is invalid or expired');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordTokenExpiresAt: null,
        tokenVersion: { increment: 1 }, // invalidate any existing sessions
      },
    });

    return { message: 'Password reset successfully' };
  }

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      omit: { password: true },
      include: { subscription: true },
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    return this.attachPlanInfo(user);
  }
}
