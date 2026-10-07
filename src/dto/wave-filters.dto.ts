import { IsOptional, IsString, IsBoolean, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class WaveFiltersDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  reqFreq?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeDeleted?: boolean;
}