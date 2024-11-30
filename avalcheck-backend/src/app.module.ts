import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { SurveysModule } from './surveys/surveys.module';
import { CertificatesModule } from './certificates/certificates.module';

@Module({
  imports: [PrismaModule, UsersModule, SurveysModule, CertificatesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
