import { Injectable } from '@nestjs/common';
import { SocialAccount } from '../../../generated/prisma/client';
import { PlatformAdapter, PublishInput } from './platform-adapter.interface';

const GRAPH_API = 'https://graph.facebook.com/v19.0';

@Injectable()
export class FacebookAdapter implements PlatformAdapter {
  async publish(account: SocialAccount, input: PublishInput): Promise<string> {
    const hasMedia = input.mediaUrls.length > 0;
    const endpoint = hasMedia
      ? `${GRAPH_API}/${account.externalId}/photos`
      : `${GRAPH_API}/${account.externalId}/feed`;

    const body = new URLSearchParams({
      access_token: account.accessToken,
      ...(hasMedia
        ? { url: input.mediaUrls[0], caption: input.text }
        : { message: input.text }),
    });

    const res = await fetch(endpoint, { method: 'POST', body });
    const data = (await res.json().catch(() => null)) as {
      id?: string;
      post_id?: string;
      error?: { message?: string };
    } | null;

    if (!res.ok || !data || (!data.id && !data.post_id)) {
      throw new Error(
        data?.error?.message ?? 'Facebook publish request failed',
      );
    }

    return data.post_id ?? data.id!;
  }
}
