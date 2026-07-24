import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { Platform, AccountStatus } from '../../generated/prisma/client';
import { encryptToken, decryptToken } from '../common/token-crypto.util';
import { OAuthAdapter } from './adapters/oauth-adapter.interface';
import { FacebookOAuthAdapter } from './adapters/facebook-oauth.adapter';
import { InstagramOAuthAdapter } from './adapters/instagram-oauth.adapter';
import { LinkedInOAuthAdapter } from './adapters/linkedin-oauth.adapter';
import { TikTokOAuthAdapter } from './adapters/tiktok-oauth.adapter';
import { XOAuthAdapter } from './adapters/x-oauth.adapter';

interface OAuthState {
  userId: string;
  platform: Platform;
  codeVerifier?: string;
}

const STATE_TTL_SECONDS = 10 * 60; // 10 minutes to complete the OAuth dance

@Injectable()
export class SocialAuthService {
  private readonly adapters: Record<Platform, OAuthAdapter>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    facebook: FacebookOAuthAdapter,
    instagram: InstagramOAuthAdapter,
    linkedin: LinkedInOAuthAdapter,
    tiktok: TikTokOAuthAdapter,
    x: XOAuthAdapter,
  ) {
    this.adapters = {
      FACEBOOK: facebook,
      INSTAGRAM: instagram,
      LINKEDIN: linkedin,
      TIKTOK: tiktok,
      X: x,
    };
  }

  private getAdapter(platform: Platform): OAuthAdapter {
    const adapter = this.adapters[platform];
    if (!adapter) {
      throw new BadRequestException(`Unsupported platform: ${platform}`);
    }
    return adapter;
  }

  /** Builds the provider consent URL and returns it for the client to navigate to. */
  buildConnectUrl(userId: string, platform: Platform): string {
    const adapter = this.getAdapter(platform);
    const codeVerifier = adapter.usesPKCE
      ? crypto.randomBytes(32).toString('base64url')
      : undefined;

    const state = this.jwtService.sign(
      { userId, platform, codeVerifier } satisfies OAuthState,
      { expiresIn: STATE_TTL_SECONDS },
    );

    return adapter.getAuthorizeUrl(state, codeVerifier);
  }

  private verifyState(state: string): OAuthState {
    try {
      return this.jwtService.verify<OAuthState>(state);
    } catch {
      throw new UnauthorizedException('OAuth state is invalid or expired');
    }
  }

  /** Handles the provider's redirect: exchanges the code and stores the account. */
  async handleCallback(platform: Platform, code: string, state: string) {
    const decoded = this.verifyState(state);
    if (decoded.platform !== platform) {
      throw new BadRequestException('OAuth state does not match platform');
    }

    const adapter = this.getAdapter(platform);
    const tokens = await adapter.exchangeCode(code, decoded.codeVerifier);
    const profile = await adapter.fetchProfile(tokens.accessToken);

    const tokenExpiresAt = tokens.expiresInSeconds
      ? new Date(Date.now() + tokens.expiresInSeconds * 1000)
      : null;

    await this.prisma.socialAccount.upsert({
      where: {
        userId_platform_externalId: {
          userId: decoded.userId,
          platform,
          externalId: profile.externalId,
        },
      },
      update: {
        accountName: profile.accountName,
        accessToken: encryptToken(tokens.accessToken),
        refreshToken: tokens.refreshToken
          ? encryptToken(tokens.refreshToken)
          : null,
        tokenExpiresAt,
        status: AccountStatus.ACTIVE,
      },
      create: {
        userId: decoded.userId,
        platform,
        externalId: profile.externalId,
        accountName: profile.accountName,
        accessToken: encryptToken(tokens.accessToken),
        refreshToken: tokens.refreshToken
          ? encryptToken(tokens.refreshToken)
          : null,
        tokenExpiresAt,
        status: AccountStatus.ACTIVE,
      },
    });

    return { userId: decoded.userId, platform };
  }

  /**
   * Returns a valid, decrypted access token for the account, refreshing it
   * first if it's expired (or about to expire) and the platform supports it.
   */
  async getValidAccessToken(accountId: string): Promise<string | null> {
    const account = await this.prisma.socialAccount.findUnique({
      where: { id: accountId },
    });
    if (!account || account.status !== AccountStatus.ACTIVE) return null;

    const isExpiringSoon =
      account.tokenExpiresAt &&
      account.tokenExpiresAt.getTime() - Date.now() < 5 * 60 * 1000;

    if (!isExpiringSoon) {
      return decryptToken(account.accessToken);
    }

    if (!account.refreshToken) {
      // Token expired and nothing to refresh with; needs re-authorization.
      await this.prisma.socialAccount.update({
        where: { id: account.id },
        data: { status: AccountStatus.EXPIRED },
      });
      return null;
    }

    try {
      const adapter = this.getAdapter(account.platform);
      const refreshed = await adapter.refresh(
        decryptToken(account.refreshToken),
      );
      if (!refreshed) {
        await this.prisma.socialAccount.update({
          where: { id: account.id },
          data: { status: AccountStatus.EXPIRED },
        });
        return null;
      }

      const tokenExpiresAt = refreshed.expiresInSeconds
        ? new Date(Date.now() + refreshed.expiresInSeconds * 1000)
        : null;

      await this.prisma.socialAccount.update({
        where: { id: account.id },
        data: {
          accessToken: encryptToken(refreshed.accessToken),
          refreshToken: refreshed.refreshToken
            ? encryptToken(refreshed.refreshToken)
            : account.refreshToken,
          tokenExpiresAt,
          status: AccountStatus.ACTIVE,
        },
      });

      return refreshed.accessToken;
    } catch {
      await this.prisma.socialAccount.update({
        where: { id: account.id },
        data: { status: AccountStatus.EXPIRED },
      });
      return null;
    }
  }
}
