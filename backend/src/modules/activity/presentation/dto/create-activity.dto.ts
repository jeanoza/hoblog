import { IsString, IsOptional, IsDateString, IsInt } from 'class-validator';

export class CreateActivityDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsDateString()
  date: string;

  @IsInt()
  categoryId: number;
}
