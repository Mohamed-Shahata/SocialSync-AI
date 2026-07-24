import { Platform } from '../../generated/prisma/client';

/**
 * Builds a best-effort direct link to a published post on its platform.
 * Some platforms (e.g. Instagram) don't return a link-friendly id from
 * their publish API, so we fall back to the account's profile page.
 */
export function buildPostLink(
  platform: Platform,
  externalPostId: string | null,
  accountName: string | null,
): string | null {
  if (!externalPostId) return null;

  switch (platform) {
    case 'LINKEDIN':
      return `https://www.linkedin.com/feed/update/${externalPostId}`;
    case 'FACEBOOK':
      return `https://www.facebook.com/${externalPostId}`;
    case 'X':
      return accountName
        ? `https://x.com/${accountName}/status/${externalPostId}`
        : `https://x.com/i/status/${externalPostId}`;
    case 'TIKTOK':
      return accountName
        ? `https://www.tiktok.com/@${accountName}/video/${externalPostId}`
        : null;
    case 'INSTAGRAM':
      // Instagram's publish API returns a media id, not a shareable
      // shortcode, so the profile page is the safest reliable link.
      return accountName ? `https://www.instagram.com/${accountName}/` : null;
    default:
      return null;
  }
}
