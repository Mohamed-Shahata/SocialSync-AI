import { Injectable, BadRequestException } from '@nestjs/common';
import { SocialAccount } from '../../../generated/prisma/client';
import { PlatformAdapter, PublishInput } from './platform-adapter.interface';

const GRAPH_API = 'https://graph.facebook.com/v19.0';

@Injectable()
export class InstagramAdapter implements PlatformAdapter {
  async publish(account: SocialAccount, input: PublishInput): Promise<string> {
    if (!input.mediaUrls.length) {
      throw new BadRequestException(
        'Instagram requires at least one image or video',
      );
    }

    const isVideo = /\.(mp4|mov|webm|m4v)$/i.test(input.mediaUrls[0]);

    const createRes = await fetch(`${GRAPH_API}/${account.externalId}/media`, {
      method: 'POST',
      body: new URLSearchParams({
        access_token: account.accessToken,
        caption: input.text,
        ...(isVideo
          ? { media_type: 'REELS', video_url: input.mediaUrls[0] }
          : { image_url: input.mediaUrls[0] }),
      }),
    });
    const created = (await createRes.json().catch(() => null)) as {
      id?: string;
      error?: { message?: string };
    } | null;
    if (!createRes.ok || !created?.id) {
      throw new Error(
        created?.error?.message ?? 'Instagram media container creation failed',
      );
    }

    const publishRes = await fetch(
      `${GRAPH_API}/${account.externalId}/media_publish`,
      {
        method: 'POST',
        body: new URLSearchParams({
          access_token: account.accessToken,
          creation_id: created.id,
        }),
      },
    );
    const published = (await publishRes.json().catch(() => null)) as {
      id?: string;
      error?: { message?: string };
    } | null;
    if (!publishRes.ok || !published?.id) {
      throw new Error(
        published?.error?.message ?? 'Instagram publish request failed',
      );
    }

    return published.id;
  }
}
