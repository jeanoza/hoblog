import { IsString, MinLength } from 'class-validator';

export class RenameCategoryDto {
  @IsString()
  @MinLength(1)
  name: string;
}
