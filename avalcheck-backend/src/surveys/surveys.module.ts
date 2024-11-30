import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SurveysController } from './surveys.controller';
import { SurveysService } from './surveys.service';
import { JwtAuthGuard } from '../jwt-auth/jwt-auth.guard';
import { JwtStrategy } from '../jwt-auth/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
      signOptions: { expiresIn: '50h' },
    }),
  ],
  controllers: [SurveysController],
  providers: [SurveysService, JwtStrategy, JwtAuthGuard, PrismaService]
})
export class SurveysModule {}
