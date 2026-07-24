import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Platform,
  PostVariant,
  VariantStatus,
} from '../../generated/prisma/client';
import { PlatformAdapter } from './adapters/platform-adapter.interface';
import { FacebookAdapter } from './adapters/facebook.adapter';
import { LinkedInAdapter } from './adapters/linkedin.adapter';
import { XAdapter } from './adapters/x.adapter';
import { InstagramAdapter } from './adapters/instagram.adapter';
import { TikTokAdapter } from './adapters/tiktok.adapter';
import { SocialAuthService } from '../social-auth/social-auth.service';

@Injectable()
export class PublishingService {
  private readonly adapters: Record<Platform, PlatformAdapter>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly socialAuth: SocialAuthService,
    facebook: FacebookAdapter,
    linkedin: LinkedInAdapter,
    x: XAdapter,
    instagram: InstagramAdapter,
    tiktok: TikTokAdapter,
  ) {
    this.adapters = {
      FACEBOOK: facebook,
      LINKEDIN: linkedin,
      X: x,
      INSTAGRAM: instagram,
      TIKTOK: tiktok,
    };
  }

  /** Publishes a single variant to its platform. Always resolves; never throws. */
  async publishVariant(
    userId: string,
    variant: PostVariant,
    text: string,
    mediaUrls: string[],
  ): Promise<PostVariant> {
    await this.prisma.postVariant.update({
      where: { id: variant.id },
      data: { status: VariantStatus.PUBLISHING, errorLog: null },
    });

    const account = await this.prisma.socialAccount.findFirst({
      where: { userId, platform: variant.platform, status: 'ACTIVE' },
    });

    if (!account) {
      return this.prisma.postVariant.update({
        where: { id: variant.id },
        data: {
          status: VariantStatus.FAILED,
          errorLog: 'مفيش حساب متصل ونشط للمنصة دي',
        },
      });
    }

    // Tokens are stored encrypted at rest; this also refreshes them first
    // if they're expired (or about to be) and the platform supports it.
    const accessToken = await this.socialAuth.getValidAccessToken(account.id);
    if (!accessToken) {
      return this.prisma.postVariant.update({
        where: { id: variant.id },
        data: {
          status: VariantStatus.FAILED,
          errorLog: 'الحساب محتاج إعادة ربط، التوكن انتهى',
        },
      });
    }

    try {
      const externalPostId = await this.adapters[variant.platform].publish(
        { ...account, accessToken },
        { text, mediaUrls },
      );
      return await this.prisma.postVariant.update({
        where: { id: variant.id },
        data: {
          status: VariantStatus.PUBLISHED,
          publishedAt: new Date(),
          externalPostId,
          errorLog: null,
        },
      });
    } catch (e) {
      return this.prisma.postVariant.update({
        where: { id: variant.id },
        data: {
          status: VariantStatus.FAILED,
          errorLog: e instanceof Error ? e.message : 'فشل النشر، حاول تاني',
        },
      });
    }
  }
}
