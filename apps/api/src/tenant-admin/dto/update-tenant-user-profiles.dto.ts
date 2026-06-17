import { ArrayUnique, IsArray, IsString } from 'class-validator';

export class UpdateTenantUserProfilesDto {
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  profileIds: string[];
}
