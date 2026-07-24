import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SocialAuthModule } from '../social-auth/social-auth.module';
import { PublishingService } from './publishing.service';
import { FacebookAdapter } from './adapters/facebook.adapter';
import { LinkedInAdapter } from './adapters/linkedin.adapter';
import { XAdapter } from './adapters/x.adapter';
import { InstagramAdapter } from './adapters/instagram.adapter';
import { TikTokAdapter } from './adapters/tiktok.adapter';

@Module({
  imports: [PrismaModule, SocialAuthModule],
  providers: [
    PublishingService,
    FacebookAdapter,
    LinkedInAdapter,
    XAdapter,
    InstagramAdapter,
    TikTokAdapter,
  ],
  exports: [PublishingService],
})
export class PublishingModule {}
