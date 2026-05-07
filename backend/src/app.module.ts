import { Module } from '@nestjs/common';
import { PrismaModule } from './common/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ActivityModule } from './modules/activity/activity.module';
import { CategoryModule } from './modules/category/category.module';

@Module({
  imports: [PrismaModule, HealthModule, UserModule, AuthModule, ActivityModule, CategoryModule],
})
export class AppModule {}
