import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { SocialAuthController } from './social-auth.controller';
import { SocialAuthService } from './social-auth.service';
import { FacebookOAuthAdapter } from './adapters/facebook-oauth.adapter';
import { InstagramOAuthAdapter } from './adapters/instagram-oauth.adapter';
import { LinkedInOAuthAdapter } from './adapters/linkedin-oauth.adapter';
import { TikTokOAuthAdapter } from './adapters/tiktok-oauth.adapter';
import { XOAuthAdapter } from './adapters/x-oauth.adapter';

@Module({
  imports: [
    // Separate, short-lived JWT config just for signing/verifying the OAuth
    // `state` param — deliberately not the same secret usage as user-session
    // JWTs' expiry, since state tokens live for minutes, not days.
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [SocialAuthController],
  providers: [
    SocialAuthService,
    FacebookOAuthAdapter,
    InstagramOAuthAdapter,
    LinkedInOAuthAdapter,
    TikTokOAuthAdapter,
    XOAuthAdapter,
  ],
  exports: [SocialAuthService],
})
export class SocialAuthModule {}
