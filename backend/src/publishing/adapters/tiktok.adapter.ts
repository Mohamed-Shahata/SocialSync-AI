import { Injectable, BadRequestException } from '@nestjs/common';
import { SocialAccount } from '../../../generated/prisma/client';
import { PlatformAdapter, PublishInput } from './platform-adapter.interface';

const TIKTOK_API = 'https://open.tiktokapis.com/v2';

@Injectable()
export class TikTokAdapter implements PlatformAdapter {
  async publish(account: SocialAccount, input: PublishInput): Promise<string> {
    const videoUrl = input.mediaUrls.find((u) =>
      /\.(mp4|mov|webm|m4v)$/i.test(u),
    );
    if (!videoUrl) {
      throw new BadRequestException('TikTok requires a video file');
    }

    const res = await fetch(`${TIKTOK_API}/post/publish/video/init/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${account.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        post_info: {
          title: input.text,
          privacy_level: 'PUBLIC_TO_EVERYONE',
        },
        source_info: {
          source: 'PULL_FROM_URL',
          video_url: videoUrl,
        },
      }),
    });

    const data = (await res.json().catch(() => null)) as {
      data?: { publish_id?: string };
      error?: { message?: string; code?: string };
    } | null;

    if (!res.ok || !data?.data?.publish_id || data.error?.code === 'error') {
      throw new Error(data?.error?.message ?? 'TikTok publish request failed');
    }

    return data.data.publish_id;
  }
}
