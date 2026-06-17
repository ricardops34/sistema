import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  login: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  @IsIn(['platform', 'backoffice', 'portal'])
  channel?: 'platform' | 'backoffice' | 'portal';

  @IsString()
  @IsOptional()
  tenantSlug?: string;
}
