import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class ManageCatalogModuleDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ManageCatalogGroupDto extends ManageCatalogModuleDto {
  @IsOptional()
  @IsString()
  moduleId?: string;
}

export class ManageCatalogRoutineDto extends ManageCatalogModuleDto {
  @IsOptional()
  @IsString()
  moduleId?: string;

  @IsOptional()
  @IsString()
  menuGroupId?: string;

  @IsOptional()
  @IsString()
  routePath?: string;

  @IsOptional()
  @IsBoolean()
  isVisibleInMenu?: boolean;
}

export class ManageRoutineActionsDto {
  @IsArray()
  actions: Array<{
    code: string;
    name: string;
    description?: string;
    sortOrder?: number;
    isActive?: boolean;
  }>;
}
