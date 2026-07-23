import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
      // Most managed Postgres providers (Neon, Supabase, RDS proxy, etc.)
      // silently close idle connections after a few minutes. Without these
      // settings, pg keeps handing out those dead sockets to Prisma, which
      // surfaces as `P1017 ConnectionClosed` on the first query after a
      // period of inactivity (e.g. right after the JWT strategy hits the DB).
      // Recycling idle clients ourselves, before the server does, avoids it.
      max: 10,
      idleTimeoutMillis: 20_000,
      connectionTimeoutMillis: 10_000,
      keepAlive: true,
    });

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
