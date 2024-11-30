import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../jwt-auth/jwt.strategy';
import { JwtAuthGuard } from '../jwt-auth/jwt-auth.guard';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
      signOptions: { expiresIn: '50h' },
    }),
  ],
  providers: [CertificatesService, JwtStrategy, JwtAuthGuard],
  controllers: [CertificatesController]
})
export class CertificatesModule {}
