import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  OAuthAdapter,
  OAuthProfile,
  OAuthTokenResult,
} from './oauth-adapter.interface';

const GRAPH_API = 'https://graph.facebook.com/v19.0';

@Injectable()
export class FacebookOAuthAdapter implements OAuthAdapter {
  constructor(protected readonly config: ConfigService) {}

  protected clientId() {
    return this.config.getOrThrow<string>('FACEBOOK_CLIENT_ID');
  }
  protected clientSecret() {
    return this.config.getOrThrow<string>('FACEBOOK_CLIENT_SECRET');
  }
  protected callbackUrl() {
    return this.config.getOrThrow<string>('FACEBOOK_CALLBACK_URL');
  }
  protected scope() {
    return 'public_profile,pages_show_list,pages_manage_posts';
  }

  getAuthorizeUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId(),
      redirect_uri: this.callbackUrl(),
      state,
      scope: this.scope(),
      response_type: 'code',
    });
    return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
  }

  async exchangeCode(code: string): Promise<OAuthTokenResult> {
    const params = new URLSearchParams({
      client_id: this.clientId(),
      client_secret: this.clientSecret(),
      redirect_uri: this.callbackUrl(),
      code,
    });
    const res = await fetch(`${GRAPH_API}/oauth/access_token?${params}`);
    const data = (await res.json().catch(() => null)) as {
      access_token?: string;
      expires_in?: number;
      error?: { message?: string };
    } | null;
    if (!res.ok || !data?.access_token) {
      throw new Error(data?.error?.message ?? 'Facebook token exchange failed');
    }

    // Exchange the short-lived token for a long-lived one (~60 days).
    // Facebook has no refresh_token flow; the long-lived token itself is
    // the closest equivalent and must be re-authorized once it expires.
    const longLived = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: this.clientId(),
      client_secret: this.clientSecret(),
      fb_exchange_token: data.access_token,
    });
    const longRes = await fetch(`${GRAPH_API}/oauth/access_token?${longLived}`);
    const longData = (await longRes.json().catch(() => null)) as {
      access_token?: string;
      expires_in?: number;
    } | null;

    return {
      accessToken: longData?.access_token ?? data.access_token,
      expiresInSeconds: longData?.expires_in ?? data.expires_in,
    };
  }

  async fetchProfile(accessToken: string): Promise<OAuthProfile> {
    const res = await fetch(
      `${GRAPH_API}/me?fields=id,name&access_token=${accessToken}`,
    );
    const data = (await res.json().catch(() => null)) as {
      id?: string;
      name?: string;
    } | null;
    if (!res.ok || !data?.id) {
      throw new Error('Failed to fetch Facebook profile');
    }
    return { externalId: data.id, accountName: data.name ?? 'Facebook' };
  }

  // Facebook long-lived tokens can't be silently refreshed; re-consent required.
  async refresh(): Promise<OAuthTokenResult | null> {
    return null;
  }
}
