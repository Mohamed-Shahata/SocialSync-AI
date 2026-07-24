import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import {
  OAuthAdapter,
  OAuthProfile,
  OAuthTokenResult,
} from './oauth-adapter.interface';

const AUTH_URL = 'https://twitter.com/i/oauth2/authorize';
const TOKEN_URL = 'https://api.twitter.com/2/oauth2/token';
const SCOPE = 'tweet.read tweet.write users.read offline.access';

@Injectable()
export class XOAuthAdapter implements OAuthAdapter {
  readonly usesPKCE = true;

  constructor(private readonly config: ConfigService) {}

  private clientId() {
    return this.config.getOrThrow<string>('X_CLIENT_ID');
  }
  private clientSecret() {
    return this.config.getOrThrow<string>('X_CLIENT_SECRET');
  }
  private callbackUrl() {
    return this.config.getOrThrow<string>('X_CALLBACK_URL');
  }

  getAuthorizeUrl(state: string, codeVerifier?: string): string {
    if (!codeVerifier) {
      throw new Error('X OAuth requires a PKCE code_verifier');
    }
    // X requires the S256-hashed challenge, base64url-encoded without padding.
    const challenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId(),
      redirect_uri: this.callbackUrl(),
      scope: SCOPE,
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    });
    return `${AUTH_URL}?${params.toString()}`;
  }

  private basicAuthHeader() {
    return (
      'Basic ' +
      Buffer.from(`${this.clientId()}:${this.clientSecret()}`).toString(
        'base64',
      )
    );
  }

  private async requestToken(body: URLSearchParams): Promise<OAuthTokenResult> {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: this.basicAuthHeader(),
      },
      body,
    });
    const data = (await res.json().catch(() => null)) as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
      error_description?: string;
    } | null;
    if (!res.ok || !data?.access_token) {
      throw new Error(data?.error_description ?? 'X token request failed');
    }
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresInSeconds: data.expires_in,
    };
  }

  exchangeCode(code: string, codeVerifier?: string): Promise<OAuthTokenResult> {
    if (!codeVerifier) {
      throw new Error('X OAuth requires a PKCE code_verifier');
    }
    return this.requestToken(
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.callbackUrl(),
        code_verifier: codeVerifier,
        client_id: this.clientId(),
      }),
    );
  }

  refresh(refreshToken: string): Promise<OAuthTokenResult | null> {
    return this.requestToken(
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.clientId(),
      }),
    );
  }

  async fetchProfile(accessToken: string): Promise<OAuthProfile> {
    const res = await fetch('https://api.twitter.com/2/users/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = (await res.json().catch(() => null)) as {
      data?: { id?: string; username?: string };
    } | null;
    if (!res.ok || !data?.data?.id) {
      throw new Error('Failed to fetch X profile');
    }
    return {
      externalId: data.data.id,
      accountName: data.data.username ?? 'X',
    };
  }
}
