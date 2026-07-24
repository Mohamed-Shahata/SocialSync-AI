export interface OAuthTokenResult {
  accessToken: string;
  refreshToken?: string;
  expiresInSeconds?: number;
}

export interface OAuthProfile {
  externalId: string;
  accountName: string;
}

export interface OAuthAdapter {
  /** Builds the provider's consent-screen URL. */
  getAuthorizeUrl(state: string, codeVerifier?: string): string;

  /** Exchanges an authorization code for access (and optionally refresh) tokens. */
  exchangeCode(code: string, codeVerifier?: string): Promise<OAuthTokenResult>;

  /** Fetches the connected account's platform id/name. */
  fetchProfile(accessToken: string): Promise<OAuthProfile>;

  /** Refreshes an access token. Returns null if the platform doesn't support it. */
  refresh(refreshToken: string): Promise<OAuthTokenResult | null>;

  /** Whether this provider needs a PKCE code_verifier/challenge pair. */
  usesPKCE?: boolean;
}
