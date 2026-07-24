import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FacebookOAuthAdapter } from './facebook-oauth.adapter';

/**
 * Instagram (Business/Creator accounts) is connected through Facebook's
 * OAuth dialog, with Instagram-specific scopes added on top of the base
 * Facebook permissions. The linked Instagram business account is resolved
 * via the Facebook Page it's attached to.
 */
@Injectable()
export class InstagramOAuthAdapter extends FacebookOAuthAdapter {
  constructor(config: ConfigService) {
    super(config);
  }

  protected override clientId() {
    return this.config.getOrThrow<string>('INSTAGRAM_CLIENT_ID');
  }
  protected override clientSecret() {
    return this.config.getOrThrow<string>('INSTAGRAM_CLIENT_SECRET');
  }
  protected override callbackUrl() {
    return this.config.getOrThrow<string>('INSTAGRAM_CALLBACK_URL');
  }
  protected override scope() {
    return 'public_profile,pages_show_list,instagram_basic,instagram_content_publish';
  }

  override async fetchProfile(accessToken: string) {
    const GRAPH_API = 'https://graph.facebook.com/v19.0';
    const pagesRes = await fetch(
      `${GRAPH_API}/me/accounts?fields=instagram_business_account{id,username}&access_token=${accessToken}`,
    );
    const pagesData = (await pagesRes.json().catch(() => null)) as {
      data?: {
        instagram_business_account?: { id?: string; username?: string };
      }[];
    } | null;

    const igAccount = pagesData?.data?.find(
      (p) => p.instagram_business_account?.id,
    )?.instagram_business_account;

    if (!igAccount?.id) {
      throw new Error(
        'No Instagram business account linked to this Facebook login',
      );
    }

    return {
      externalId: igAccount.id,
      accountName: igAccount.username ?? 'Instagram',
    };
  }
}
