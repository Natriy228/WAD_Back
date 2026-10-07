import { IsString, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @MinLength(3)
  nickName: string;

  @IsString()
  @MinLength(8)
  password: string;
}