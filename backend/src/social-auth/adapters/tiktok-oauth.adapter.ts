import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  OAuthAdapter,
  OAuthProfile,
  OAuthTokenResult,
} from './oauth-adapter.interface';

const AUTH_URL = 'https://www.tiktok.com/v2/auth/authorize/';
const TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';
const SCOPE = 'user.info.basic,video.publish';

@Injectable()
export class TikTokOAuthAdapter implements OAuthAdapter {
  constructor(private readonly config: ConfigService) {}

  private clientKey() {
    return this.config.getOrThrow<string>('TIKTOK_CLIENT_KEY');
  }
  private clientSecret() {
    return this.config.getOrThrow<string>('TIKTOK_CLIENT_SECRET');
  }
  private callbackUrl() {
    return this.config.getOrThrow<string>('TIKTOK_CALLBACK_URL');
  }

  getAuthorizeUrl(state: string): string {
    const params = new URLSearchParams({
      client_key: this.clientKey(),
      response_type: 'code',
      scope: SCOPE,
      redirect_uri: this.callbackUrl(),
      state,
    });
    return `${AUTH_URL}?${params.toString()}`;
  }

  private async requestToken(body: URLSearchParams): Promise<OAuthTokenResult> {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const data = (await res.json().catch(() => null)) as {
      access_token?: string;
      expires_in?: number;
      refresh_token?: string;
      error?: string;
      error_description?: string;
    } | null;
    if (!res.ok || !data?.access_token) {
      throw new Error(data?.error_description ?? 'TikTok token request failed');
    }
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresInSeconds: data.expires_in,
    };
  }

  exchangeCode(code: string): Promise<OAuthTokenResult> {
    return this.requestToken(
      new URLSearchParams({
        client_key: this.clientKey(),
        client_secret: this.clientSecret(),
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.callbackUrl(),
      }),
    );
  }

  refresh(refreshToken: string): Promise<OAuthTokenResult | null> {
    return this.requestToken(
      new URLSearchParams({
        client_key: this.clientKey(),
        client_secret: this.clientSecret(),
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    );
  }

  async fetchProfile(accessToken: string): Promise<OAuthProfile> {
    const res = await fetch(
      'https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name',
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const data = (await res.json().catch(() => null)) as {
      data?: { user?: { open_id?: string; display_name?: string } };
    } | null;
    const user = data?.data?.user;
    if (!res.ok || !user?.open_id) {
      throw new Error('Failed to fetch TikTok profile');
    }
    return {
      externalId: user.open_id,
      accountName: user.display_name ?? 'TikTok',
    };
  }
}
