import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';
import { AccountStatus } from '../../generated/prisma/client';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { name: dto.name },
      omit: { password: true },
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    if (!user.password) {
      throw new BadRequestException(
        'This account signed up with Google and has no password set',
      );
    }

    const currentMatches = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );
    if (!currentMatches) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        tokenVersion: { increment: 1 }, // invalidate other sessions
      },
    });

    return { message: 'Password changed successfully' };
  }

  async completeOnboarding(userId: string, dto: CompleteOnboardingDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        niche: dto.niche,
        hasCompletedOnboarding: true,
      },
      omit: { password: true },
    });
  }

  async getSocialAccounts(userId: string) {
    return this.prisma.socialAccount.findMany({
      where: { userId },
      select: {
        id: true,
        platform: true,
        accountName: true,
        status: true,
        tokenExpiresAt: true,
      },
    });
  }

  async disconnectSocialAccount(userId: string, accountId: string) {
    const account = await this.prisma.socialAccount.findUnique({
      where: { id: accountId },
    });
    if (!account || account.userId !== userId) {
      throw new NotFoundException('Connected account not found');
    }

    // Clear the sensitive tokens outright rather than just flipping status,
    // so a revoked connection can't still be used to publish.
    await this.prisma.socialAccount.update({
      where: { id: accountId },
      data: {
        status: AccountStatus.REVOKED,
        accessToken: '',
        refreshToken: null,
        tokenExpiresAt: null,
      },
    });

    return { message: 'Account disconnected' };
  }

  async updateAvatar(userId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const result = await this.cloudinary.uploadFile(file, 'avatars');

    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: result.secure_url },
      omit: { password: true },
    });
  }
}
