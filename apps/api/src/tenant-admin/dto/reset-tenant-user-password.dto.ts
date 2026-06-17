import { IsString, MinLength } from 'class-validator';

export class ResetTenantUserPasswordDto {
  @IsString()
  @MinLength(8)
  password: string;
}
