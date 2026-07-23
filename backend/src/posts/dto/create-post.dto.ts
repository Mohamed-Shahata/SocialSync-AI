import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Platform } from '../../../generated/prisma/client';

export class CreatePostDto {
  @IsString()
  @MinLength(1)
  text!: string;

  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(Platform, { each: true })
  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? (JSON.parse(value) as Platform[]) : value,
  )
  platforms?: Platform[];
}
