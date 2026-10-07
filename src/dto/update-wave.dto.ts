import { IsString, IsNumber, Min, MinLength, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateWaveDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  lowWave?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  highWave?: number;

  @IsString()
  @IsOptional()
  @MinLength(1)
  img?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  video?: string;
}