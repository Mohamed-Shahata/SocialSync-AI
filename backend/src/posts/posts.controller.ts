import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import 'multer';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { GenerateVariantsDto } from './dto/generate-variants.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { RegenerateVariantDto } from './dto/regenerate-variant.dto';
import { PublishPostDto } from './dto/publish-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('media', 10))
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.postsService.create(user.id, dto, files);
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.postsService.findAllForUser(user.id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.postsService.remove(user.id, id);
  }

  @Post(':id/generate')
  generate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: GenerateVariantsDto,
  ) {
    return this.postsService.generateVariants(user.id, id, dto);
  }

  @Post(':id/variants/:variantId/regenerate')
  regenerateVariant(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @Body() dto: RegenerateVariantDto,
  ) {
    return this.postsService.regenerateVariant(
      user.id,
      id,
      variantId,
      dto.provider,
    );
  }

  @Patch(':id/variants/:variantId')
  updateVariant(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateVariantDto,
  ) {
    return this.postsService.updateVariantText(
      user.id,
      id,
      variantId,
      dto.generatedText,
    );
  }

  @Post(':id/publish')
  publish(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: PublishPostDto,
  ) {
    return this.postsService.publish(user.id, id, dto);
  }

  @Post(':id/variants/:variantId/retry-publish')
  retryPublish(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Param('variantId') variantId: string,
  ) {
    return this.postsService.retryVariantPublish(user.id, id, variantId);
  }
}
