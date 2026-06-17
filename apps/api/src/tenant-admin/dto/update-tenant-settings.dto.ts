import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateTenantSettingsDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  planCode?: string;

  @IsOptional()
  @IsObject()
  limits?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  enabledFeatures?: string[];

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
