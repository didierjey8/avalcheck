import { certificateLevel } from '@prisma/client';
import { SubmitAnswersDto } from './submit-answers.dto';
import { JwtAuthGuard } from '../jwt-auth/jwt-auth.guard';
import { CertificatesService } from './certificates.service';
import { Controller, Get, Res, Param, UseGuards, Post, ParseEnumPipe, Body, Request } from '@nestjs/common';

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get('quiz/:level')
  async getQuestions(@Param('level') level: certificateLevel) {
    return this.certificatesService.getQuestionsWithAnswers(level);
  }

  @Post('submit/:level')
  @UseGuards(JwtAuthGuard)
  async submitAnswers(
    @Param('level', new ParseEnumPipe(certificateLevel)) level: certificateLevel,
    @Body() submitAnswersDto: SubmitAnswersDto,
    @Request() req
  ) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.certificatesService.evaluateAnswers(level, submitAnswersDto, token);
  }
}
