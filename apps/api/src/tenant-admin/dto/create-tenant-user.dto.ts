import { ArrayUnique, IsArray, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTenantUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  profileIds?: string[];
}
