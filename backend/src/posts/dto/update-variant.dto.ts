import { IsString, MinLength } from 'class-validator';

export class UpdateVariantDto {
  @IsString()
  @MinLength(1)
  generatedText!: string;
}
