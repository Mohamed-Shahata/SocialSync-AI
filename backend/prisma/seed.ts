import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@postai.com' },
    update: {},
    create: {
      email: 'demo@postai.com',
      password,
      plan: 'PRO',
      isVerified: true,
    },
  });

  await prisma.post.deleteMany({ where: { userId: user.id } });

  await prisma.post.create({
    data: {
      userId: user.id,
      originalText:
        'كيفية بناء مجتمع متفاعل حول علامتك التجارية باستخدام الذكاء الاصطناعي',
      topic: 'بناء مجتمع رقمي',
      status: 'PUBLISHED',
      mediaUrls: [],
      variants: {
        create: [
          {
            platform: 'LINKEDIN',
            generatedText: 'نسخة لينكدإن',
            status: 'PUBLISHED',
            approved: true,
          },
          {
            platform: 'X',
            generatedText: 'نسخة إكس',
            status: 'PUBLISHED',
            approved: true,
          },
        ],
      },
    },
  });

  await prisma.post.create({
    data: {
      userId: user.id,
      originalText: 'أفضل أدوات تحسين الإنتاجية الرقمية في عام 2026',
      topic: 'أدوات الإنتاجية',
      status: 'SCHEDULED',
      mediaUrls: [],
      variants: {
        create: [
          {
            platform: 'FACEBOOK',
            generatedText: 'نسخة فيسبوك',
            status: 'PENDING',
          },
        ],
      },
    },
  });

  await prisma.post.create({
    data: {
      userId: user.id,
      originalText:
        'اكتشاف مستقبل الذكاء الاصطناعي في إدارة الشركات الاجتماعية',
      topic: 'الذكاء الاصطناعي للشركات',
      status: 'DRAFT',
      mediaUrls: [],
    },
  });

  console.log('✅ Seed done. Login with demo@postai.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
