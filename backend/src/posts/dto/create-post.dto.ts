import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Platform } from '../../../generated/prisma/client';
import type { AiProvider } from '../../ai/ai.service';
import type { Dialect } from '../../ai/prompts/platform-prompts';

export class CreatePostDto {
  @IsString()
  @MinLength(1)
  text!: string;

  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsString()
  aiPrompt?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(Platform, { each: true })
  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? (JSON.parse(value) as Platform[]) : value,
  )
  platforms?: Platform[];

  @IsOptional()
  @IsEnum(['GEMINI', 'GROQ'])
  provider?: AiProvider;

  @IsOptional()
  @IsEnum(['EGYPTIAN', 'GULF', 'IRAQI', 'LEVANTINE', 'MSA', 'ENGLISH'])
  dialect?: Dialect;
}
