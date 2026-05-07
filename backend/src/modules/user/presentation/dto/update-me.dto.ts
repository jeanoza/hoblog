import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateMeDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  name?: string;
}
