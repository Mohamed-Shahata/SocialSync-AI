import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  OAuthAdapter,
  OAuthProfile,
  OAuthTokenResult,
} from './oauth-adapter.interface';

const AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const SCOPE = 'openid profile w_member_social';

@Injectable()
export class LinkedInOAuthAdapter implements OAuthAdapter {
  constructor(private readonly config: ConfigService) {}

  private clientId() {
    return this.config.getOrThrow<string>('LINKEDIN_CLIENT_ID');
  }
  private clientSecret() {
    return this.config.getOrThrow<string>('LINKEDIN_CLIENT_SECRET');
  }
  private callbackUrl() {
    return this.config.getOrThrow<string>('LINKEDIN_CALLBACK_URL');
  }

  getAuthorizeUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId(),
      redirect_uri: this.callbackUrl(),
      state,
      scope: SCOPE,
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
      error_description?: string;
    } | null;
    if (!res.ok || !data?.access_token) {
      throw new Error(
        data?.error_description ?? 'LinkedIn token request failed',
      );
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
        grant_type: 'authorization_code',
        code,
        client_id: this.clientId(),
        client_secret: this.clientSecret(),
        redirect_uri: this.callbackUrl(),
      }),
    );
  }

  refresh(refreshToken: string): Promise<OAuthTokenResult | null> {
    return this.requestToken(
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.clientId(),
        client_secret: this.clientSecret(),
      }),
    );
  }

  async fetchProfile(accessToken: string): Promise<OAuthProfile> {
    const res = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = (await res.json().catch(() => null)) as {
      sub?: string;
      name?: string;
    } | null;
    if (!res.ok || !data?.sub) {
      throw new Error('Failed to fetch LinkedIn profile');
    }
    return { externalId: data.sub, accountName: data.name ?? 'LinkedIn' };
  }
}
