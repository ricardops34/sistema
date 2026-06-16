import { IsString, IsNotEmpty, IsEmail, IsOptional, Matches } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, { message: 'slug deve conter apenas letras minúsculas, números e hífens' })
  slug: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsEmail()
  adminEmail: string;

  @IsString()
  @IsOptional()
  adminPassword?: string;
}
