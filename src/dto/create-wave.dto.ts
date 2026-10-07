import { IsString, IsNumber, Min, MinLength, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWaveDto {
  @IsString()
  @MinLength(3, { message: 'Название должно быть не менее 3 символов' })
  name: string;

  @IsString()
  @IsOptional()
  desc?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Нижняя граница диапазона не может быть отрицательной' })
  lowWave: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Верхняя граница диапазона не может быть отрицательной' })
  highWave: number;
}