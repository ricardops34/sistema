import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePersonDto {
  @IsString()
  @IsNotEmpty()
  nameLegal: string;

  @IsString()
  @IsOptional()
  nameSocial?: string;

  @IsString()
  @IsOptional()
  birthDate?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
