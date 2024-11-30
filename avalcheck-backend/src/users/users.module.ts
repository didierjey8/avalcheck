import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersController } from './users.controller';
import { JwtAuthGuard } from '../jwt-auth/jwt-auth.guard';
import { JwtStrategy } from '../jwt-auth/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
      signOptions: { expiresIn: '50h' },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy, JwtAuthGuard, PrismaService]
})
export class UsersModule {}