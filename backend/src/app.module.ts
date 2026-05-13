import { Module } from '@nestjs/common';
import { PrismaModule } from './common/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ActivityModule } from './modules/activity/activity.module';
import { CategoryModule } from './modules/category/category.module';
import { PhotoModule } from './modules/photo/photo.module';
import { TagModule } from './modules/tag/tag.module';
import { StorageModule } from './common/storage/storage.module';

@Module({
  imports: [
    PrismaModule,
    StorageModule,
    HealthModule,
    UserModule,
    AuthModule,
    ActivityModule,
    CategoryModule,
    PhotoModule,
    TagModule,
  ],
})
export class AppModule {}
