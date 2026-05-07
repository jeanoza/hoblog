import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';

@Injectable()
export class StorageService {
  private readonly storage: Storage;
  private readonly bucketName: string;

  constructor() {
    this.storage = new Storage({
      keyFilename: process.env.GCS_KEY_FILE,
      projectId: process.env.GCS_PROJECT_ID,
    });
    this.bucketName = process.env.GCS_BUCKET_NAME ?? '';
  }

  async getSignedUploadUrl(destination: string, contentType: string): Promise<string> {
    const [url] = await this.storage
      .bucket(this.bucketName)
      .file(destination)
      .getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + 15 * 60 * 1000,
        contentType,
      });
    return url;
  }

  getPublicUrl(destination: string): string {
    return `https://storage.googleapis.com/${this.bucketName}/${destination}`;
  }

  async deleteFile(destination: string): Promise<void> {
    await this.storage.bucket(this.bucketName).file(destination).delete({ ignoreNotFound: true });
  }
}
