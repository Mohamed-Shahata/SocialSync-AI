import { IsArray, IsEnum, IsOptional } from 'class-validator';
import { Platform } from '../../../generated/prisma/client';
import type { AiProvider } from '../../ai/ai.service';

export class GenerateVariantsDto {
  @IsOptional()
  @IsArray()
  @IsEnum(Platform, { each: true })
  platforms?: Platform[];

  @IsOptional()
  @IsEnum(['GEMINI', 'GROQ'])
  provider?: AiProvider;
}
