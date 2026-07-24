import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { AiModule } from '../ai/ai.module';
import { PublishingModule } from '../publishing/publishing.module';

@Module({
  imports: [CloudinaryModule, AiModule, PublishingModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
