import { IsString, IsOptional, IsDateString, IsInt } from 'class-validator';

export class UpdateActivityDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  note?: string | null;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsInt()
  @IsOptional()
  categoryId?: number;
}
