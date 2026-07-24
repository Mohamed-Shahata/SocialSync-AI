import { Platform } from '../../../generated/prisma/client';

export type Dialect =
  'EGYPTIAN' | 'GULF' | 'IRAQI' | 'LEVANTINE' | 'MSA' | 'ENGLISH';

const platformGuides: Record<Platform, string> = {
  LINKEDIN:
    'نبرة احترافية وجادة، طول متوسط إلى طويل (3-5 جمل)، لغة تخاطب أصحاب الأعمال والمحترفين، هاشتاجين بالكتير في الآخر.',
  FACEBOOK:
    'نبرة ودّية وقريبة من الناس، طول متوسط، أسلوب محادثة عادي، إيموجي بسيط لو مناسب، هاشتاج أو اتنين بس.',
  INSTAGRAM:
    'نبرة عاطفية وبصرية، جمل قصيرة مقسّمة بأسطر، إيموجيز مناسبة، واختم بـ 5-8 هاشتاجات مرتبطة بالموضوع.',
  TIKTOK:
    'نبرة كاجوال وسريعة، هوك قوي في أول جملة يشد الانتباه، جمل قصيرة جدًا، هاشتاج أو اتنين بس في الآخر.',
  X: 'نبرة مختصرة وقوية، أقل من 280 حرف، جملة أو جملتين بالكتير، هاشتاج واحد بالكتير.',
};

const dialectGuides: Record<Dialect, string> = {
  EGYPTIAN: 'اكتب باللهجة المصرية العامية.',
  GULF: 'اكتب باللهجة الخليجية العامية.',
  IRAQI: 'اكتب باللهجة العراقية العامية.',
  LEVANTINE: 'اكتب باللهجة الشامية (شام/لبنان/الأردن) العامية.',
  MSA: 'اكتب بالفصحى الحديثة (اللغة العربية الفصحى).',
  ENGLISH: 'Write the post in English.',
};

export function buildPrompt(
  platform: Platform,
  text: string,
  topic?: string | null,
  dialect?: Dialect | null,
): string {
  return [
    'انت خبير كتابة محتوى سوشيال ميديا.',
    `حوّل الفكرة دي لمنشور مناسب لمنصة ${platform}.`,
    `الأسلوب المطلوب: ${platformGuides[platform]}`,
    dialectGuides[dialect ?? 'EGYPTIAN'],
    topic ? `موضوع البوست: ${topic}` : '',
    `الفكرة الأصلية: "${text}"`,
    'رجّع نص المنشور بس، من غير أي شرح أو مقدمة أو علامات اقتباس.',
  ]
    .filter(Boolean)
    .join('\n');
}
