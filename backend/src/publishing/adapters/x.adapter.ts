import { Injectable } from '@nestjs/common';
import { SocialAccount } from '../../../generated/prisma/client';
import { PlatformAdapter, PublishInput } from './platform-adapter.interface';

@Injectable()
export class XAdapter implements PlatformAdapter {
  async publish(account: SocialAccount, input: PublishInput): Promise<string> {
    const res = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${account.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: input.text }),
    });

    const data = (await res.json().catch(() => null)) as {
      data?: { id?: string };
      detail?: string;
      title?: string;
    } | null;

    if (!res.ok || !data?.data?.id) {
      throw new Error(
        data?.detail ?? data?.title ?? 'X publish request failed',
      );
    }

    return data.data.id;
  }
}
