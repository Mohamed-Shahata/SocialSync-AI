import { Injectable } from '@nestjs/common';
import { SocialAccount } from '../../../generated/prisma/client';
import { PlatformAdapter, PublishInput } from './platform-adapter.interface';

const LINKEDIN_API = 'https://api.linkedin.com/v2';

@Injectable()
export class LinkedInAdapter implements PlatformAdapter {
  async publish(account: SocialAccount, input: PublishInput): Promise<string> {
    const author = `urn:li:person:${account.externalId}`;

    const res = await fetch(`${LINKEDIN_API}/ugcPosts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${account.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: input.text },
            shareMediaCategory: input.mediaUrls.length ? 'IMAGE' : 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      }),
    });

    const postId = res.headers.get('x-restli-id');
    if (!res.ok || !postId) {
      const data = (await res.json().catch(() => null)) as {
        message?: string;
      } | null;
      throw new Error(data?.message ?? 'LinkedIn publish request failed');
    }

    return postId;
  }
}
