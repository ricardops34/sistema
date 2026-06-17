import { IsEmail, IsOptional } from 'class-validator';

export class UpdateTenantUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;
}
