import { SocialAccount } from '../../../generated/prisma/client';

export interface PublishInput {
  text: string;
  mediaUrls: string[];
}

export interface PlatformAdapter {
  /** Publishes the content and returns the external post id. Throws on failure. */
  publish(account: SocialAccount, input: PublishInput): Promise<string>;
}
