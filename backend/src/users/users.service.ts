import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';

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
      select: { id: true, platform: true, accountName: true, status: true },
    });
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
