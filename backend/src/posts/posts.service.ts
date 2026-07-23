import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import 'multer';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostStatus } from '../../generated/prisma/client';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(
    userId: string,
    dto: CreatePostDto,
    files: Express.Multer.File[],
  ) {
    const mediaUrls = files?.length
      ? await this.cloudinary.uploadFiles(files)
      : [];

    return this.prisma.post.create({
      data: {
        userId,
        originalText: dto.text,
        topic: dto.topic,
        mediaUrls,
        status: PostStatus.DRAFT,
        variants: dto.platforms?.length
          ? {
              create: dto.platforms.map((platform) => ({
                platform,
                generatedText: dto.text,
              })),
            }
          : undefined,
      },
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
}
