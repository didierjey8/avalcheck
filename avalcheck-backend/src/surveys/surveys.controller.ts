import { Controller, Get, Post, UseGuards, Param, Req, Body } from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { JwtAuthGuard } from '../jwt-auth/jwt-auth.guard';

@Controller('surveys')
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @Get('generate')
  @UseGuards(JwtAuthGuard) 
  async generateSurvey(@Req() req: any) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.surveysService.generateSurvey(token);
  }

  @Get('call-explain-topic/:id')
  @UseGuards(JwtAuthGuard) 
  async callUser(@Param('id') idQuestion: number, @Req() req: any) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.surveysService.explainTopicAndQuestionOnCall(idQuestion, token);
  }

  @Post('answer')
  async answerSurvey(@Body('idQuestion') idQuestion: number, @Body('user') user: string, @Body('answer') answer: boolean, @Req() req: any) {
    return this.surveysService.answerQuestionSurvey(idQuestion, user, answer);
  }
}
