import { IsString, IsMimeType } from 'class-validator';

export class GetUploadUrlDto {
  @IsString()
  @IsMimeType()
  contentType: string;
}
