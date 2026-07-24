import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import 'multer';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { AiService, AiProvider } from '../ai/ai.service';
import { PublishingService } from '../publishing/publishing.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { GenerateVariantsDto } from './dto/generate-variants.dto';
import { PublishPostDto, PublishMode } from './dto/publish-post.dto';
import {
  Platform,
  PostStatus,
  VariantStatus,
} from '../../generated/prisma/client';
import { buildPostLink } from './post-link.util';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
    private readonly ai: AiService,
    private readonly publishing: PublishingService,
  ) {}

  async create(
    userId: string,
    dto: CreatePostDto,
    files: Express.Multer.File[],
  ) {
    const mediaUrls = files?.length
      ? await this.cloudinary.uploadFiles(files)
      : [];

    const post = await this.prisma.post.create({
      data: {
        userId,
        originalText: dto.text,
        topic: dto.topic,
        mediaUrls,
        status: PostStatus.DRAFT,
      },
    });

    if (dto.platforms?.length) {
      const source = dto.aiPrompt?.trim() || dto.text;
      await Promise.all(
        dto.platforms.map(async (platform) => {
          let generatedText = dto.text;
          let errorLog: string | null = null;
          try {
            generatedText = await this.ai.generateForPlatform(
              source,
              platform,
              dto.topic,
              dto.provider,
              dto.dialect,
            );
          } catch (e) {
            errorLog = e instanceof Error ? e.message : 'AI generation failed';
          }

          return this.prisma.postVariant.create({
            data: {
              postId: post.id,
              platform,
              generatedText,
              status: VariantStatus.PENDING,
              errorLog,
            },
          });
        }),
      );
    }

    return this.prisma.post.findUnique({
      where: { id: post.id },
      include: { variants: true },
    });
  }

  findAllForUser(userId: string) {
    return this.prisma.post.findMany({
      where: { userId },
      include: { variants: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Post History / Analytics: flat list of every published variant for the
   * user, each with a direct link to the platform and a small stats summary.
   */
  async getHistory(userId: string) {
    const posts = await this.prisma.post.findMany({
      where: {
        userId,
        variants: { some: { status: VariantStatus.PUBLISHED } },
      },
      include: { variants: { where: { status: VariantStatus.PUBLISHED } } },
      orderBy: { createdAt: 'desc' },
    });

    const accounts = await this.prisma.socialAccount.findMany({
      where: { userId },
      select: { platform: true, accountName: true },
    });
    const accountByPlatform = new Map(
      accounts.map((a) => [a.platform, a.accountName]),
    );

    const items = posts.flatMap((post) =>
      post.variants.map((variant) => ({
        postId: post.id,
        variantId: variant.id,
        platform: variant.platform,
        text: variant.generatedText,
        mediaUrls: post.mediaUrls,
        publishedAt: variant.publishedAt,
        externalPostId: variant.externalPostId,
        link: buildPostLink(
          variant.platform,
          variant.externalPostId,
          accountByPlatform.get(variant.platform) ?? null,
        ),
      })),
    );

    items.sort((a, b) => {
      const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return bTime - aTime;
    });

    const byPlatform: Record<string, number> = {};
    for (const item of items) {
      byPlatform[item.platform] = (byPlatform[item.platform] ?? 0) + 1;
    }

    const now = new Date();
    const thisMonth = items.filter((item) => {
      if (!item.publishedAt) return false;
      const d = new Date(item.publishedAt);
      return (
        d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
      );
    }).length;

    return {
      items,
      stats: {
        totalPublished: items.length,
        thisMonth,
        byPlatform,
      },
    };
  }

  private async findOwnedDraft(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId) throw new ForbiddenException();
    if (post.status !== PostStatus.DRAFT) {
      throw new BadRequestException('Only draft posts can be modified');
    }
    return post;
  }

  async update(userId: string, postId: string, dto: UpdatePostDto) {
    await this.findOwnedDraft(userId, postId);

    return this.prisma.post.update({
      where: { id: postId },
      data: {
        originalText: dto.text,
        topic: dto.topic,
      },
      include: { variants: true },
    });
  }

  async remove(userId: string, postId: string) {
    await this.findOwnedDraft(userId, postId);

    await this.prisma.postVariant.deleteMany({ where: { postId } });
    await this.prisma.post.delete({ where: { id: postId } });

    return { message: 'Post deleted' };
  }

  private async findOwnedPost(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { variants: true },
    });
    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId) throw new ForbiddenException();
    return post;
  }

  async generateVariants(
    userId: string,
    postId: string,
    dto: GenerateVariantsDto,
  ) {
    const post = await this.findOwnedPost(userId, postId);

    const platforms: Platform[] = dto.platforms?.length
      ? dto.platforms
      : post.variants.map((v) => v.platform);

    if (!platforms.length) {
      throw new BadRequestException('No platforms specified');
    }

    return Promise.all(
      platforms.map(async (platform) => {
        const generatedText = await this.ai.generateForPlatform(
          post.originalText,
          platform,
          post.topic,
          dto.provider,
        );

        const existing = post.variants.find((v) => v.platform === platform);
        if (existing) {
          return this.prisma.postVariant.update({
            where: { id: existing.id },
            data: {
              generatedText,
              status: VariantStatus.PENDING,
              errorLog: null,
            },
          });
        }

        return this.prisma.postVariant.create({
          data: {
            postId,
            platform,
            generatedText,
            status: VariantStatus.PENDING,
          },
        });
      }),
    );
  }

  async regenerateVariant(
    userId: string,
    postId: string,
    variantId: string,
    provider?: AiProvider,
  ) {
    const post = await this.findOwnedPost(userId, postId);
    const variant = post.variants.find((v) => v.id === variantId);
    if (!variant) throw new NotFoundException('Variant not found');

    const generatedText = await this.ai.generateForPlatform(
      post.originalText,
      variant.platform,
      post.topic,
      provider,
    );

    return this.prisma.postVariant.update({
      where: { id: variantId },
      data: { generatedText, status: VariantStatus.PENDING, errorLog: null },
    });
  }

  async updateVariantText(
    userId: string,
    postId: string,
    variantId: string,
    generatedText: string,
  ) {
    const post = await this.findOwnedPost(userId, postId);
    const variant = post.variants.find((v) => v.id === variantId);
    if (!variant) throw new NotFoundException('Variant not found');

    return this.prisma.postVariant.update({
      where: { id: variantId },
      data: { generatedText, status: VariantStatus.APPROVED },
    });
  }

  async publish(userId: string, postId: string, dto: PublishPostDto) {
    const post = await this.findOwnedPost(userId, postId);

    const targets = dto.platforms?.length
      ? post.variants.filter((v) => dto.platforms!.includes(v.platform))
      : post.variants;

    if (!targets.length) {
      throw new BadRequestException('No variants to publish');
    }

    if (dto.mode === PublishMode.SCHEDULE) {
      if (!dto.scheduledFor) {
        throw new BadRequestException(
          'scheduledFor is required when scheduling',
        );
      }
      const scheduledFor = new Date(dto.scheduledFor);
      if (scheduledFor.getTime() <= Date.now()) {
        throw new BadRequestException('scheduledFor must be in the future');
      }

      await this.prisma.postVariant.updateMany({
        where: { id: { in: targets.map((v) => v.id) } },
        data: { scheduledFor, status: VariantStatus.PENDING, errorLog: null },
      });
      await this.prisma.post.update({
        where: { id: postId },
        data: { status: PostStatus.SCHEDULED },
      });

      return this.prisma.post.findUnique({
        where: { id: postId },
        include: { variants: true },
      });
    }

    // Publish now: run each target through its platform integration.
    await Promise.all(
      targets.map((variant) =>
        this.publishing.publishVariant(
          userId,
          variant,
          variant.generatedText,
          post.mediaUrls,
        ),
      ),
    );

    const refreshed = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { variants: true },
    });

    const allPublished = refreshed!.variants.every(
      (v) => v.status === VariantStatus.PUBLISHED,
    );
    const anyPublished = refreshed!.variants.some(
      (v) => v.status === VariantStatus.PUBLISHED,
    );

    await this.prisma.post.update({
      where: { id: postId },
      data: {
        status: allPublished
          ? PostStatus.PUBLISHED
          : anyPublished
            ? PostStatus.PUBLISHED
            : PostStatus.FAILED,
      },
    });

    return this.prisma.post.findUnique({
      where: { id: postId },
      include: { variants: true },
    });
  }

  async retryVariantPublish(userId: string, postId: string, variantId: string) {
    const post = await this.findOwnedPost(userId, postId);
    const variant = post.variants.find((v) => v.id === variantId);
    if (!variant) throw new NotFoundException('Variant not found');

    const updated = await this.publishing.publishVariant(
      userId,
      variant,
      variant.generatedText,
      post.mediaUrls,
    );

    const refreshed = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { variants: true },
    });
    const allPublished = refreshed!.variants.every(
      (v) => v.status === VariantStatus.PUBLISHED,
    );
    const anyPublished = refreshed!.variants.some(
      (v) => v.status === VariantStatus.PUBLISHED,
    );
    await this.prisma.post.update({
      where: { id: postId },
      data: {
        status: allPublished
          ? PostStatus.PUBLISHED
          : anyPublished
            ? PostStatus.PUBLISHED
            : PostStatus.FAILED,
      },
    });

    return updated;
  }
}
