import { IsEnum, IsOptional } from 'class-validator';
import type { AiProvider } from '../../ai/ai.service';

export class RegenerateVariantDto {
  @IsOptional()
  @IsEnum(['GEMINI', 'GROQ'])
  provider?: AiProvider;
}
