import { IsArray, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { Platform } from '../../../generated/prisma/client';

export enum PublishMode {
  NOW = 'NOW',
  SCHEDULE = 'SCHEDULE',
}

export class PublishPostDto {
  @IsEnum(PublishMode)
  mode!: PublishMode;

  /** Required when mode is SCHEDULE. ISO date-time string. */
  @IsOptional()
  @IsDateString()
  scheduledFor?: string;

  /** Optional subset of variant platforms to publish; defaults to all variants. */
  @IsOptional()
  @IsArray()
  @IsEnum(Platform, { each: true })
  platforms?: Platform[];
}
