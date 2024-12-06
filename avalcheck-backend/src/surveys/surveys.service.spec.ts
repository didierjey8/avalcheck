import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException } from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('axios');
import axios from 'axios';

describe('SurveysService', () => {
  let service: SurveysService;
  let jwtService: JwtService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SurveysService,
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            surveys: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
            users: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
            },
            usersurveyanswers: {
              findFirst: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<SurveysService>(SurveysService);
    jwtService = module.get<JwtService>(JwtService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateSurvey', () => {
    it('should return a list of active surveys with transformed data', async () => {
      const mockToken = 'mockToken';
      const mockDecoded = { id: '1' };

      const mockSurveys:any = [
        {
          id: 1,
          topic: 'Sample Topic',
          surveyAnswers: [
            {
              won: true,
              tx_gift: '0x123',
              updated_at: new Date(),
              amount_gift: '10',
              address_gift: '0xabc',
              currency_gift: 'AVAX',
            },
          ],
        },
      ];

      jest.spyOn(jwtService, 'verify').mockReturnValue(mockDecoded);
      jest.spyOn(prismaService.surveys, 'findMany').mockResolvedValue(mockSurveys);

      const result = await service.generateSurvey(mockToken);

      expect(jwtService.verify).toHaveBeenCalledWith(mockToken);
      expect(prismaService.surveys.findMany).toHaveBeenCalledWith({
        where: { status: 'ACTIVE' },
        select: {
          id: true,
          topic: true,
          surveyAnswers: {
            select: {
              won: true,
              tx_gift: true,
              updated_at: true,
              amount_gift: true,
              address_gift: true,
              currency_gift: true,
            },
            where: { created_by: Number(mockDecoded.id) },
          },
        },
      });

      expect(result).toEqual({
        data: [
          {
            id: 1,
            topic: 'Sample Topic',
            attemptsCount: 1,
            won: {
              tx_gift: '0x123',
              tx_gift_url: 'https://snowtrace.io/tx/0x123',
              won_at: mockSurveys[0].surveyAnswers[0].updated_at,
              amount_gift: '10',
              address_gift: '0xabc',
              currency_gift: 'AVAX',
            },
          },
        ],
      });
    });

    it('should throw an error if token is invalid', async () => {
      const mockToken = 'invalidToken';

      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.generateSurvey(mockToken)).rejects.toThrow(
        new Error('Invalid token'),
      );
    });
  });

  describe('explainTopicAndQuestionOnCall', () => {
    it('should call external API with proper data and return success', async () => {
      const mockToken = 'mockToken';
      const idQuestion = 1;

      const mockSurvey:any = { topic: 'Sample Topic', question: 'Sample Question' };
      const mockUser:any = { id: 1, cellphone: '123456789' };

      jest.spyOn(jwtService, 'verify').mockReturnValue({ id: '1' });
      jest.spyOn(prismaService.surveys, 'findUnique').mockResolvedValue(mockSurvey);
      jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(axios, 'post').mockResolvedValue({ data: { success: true } });

      const result = await service.explainTopicAndQuestionOnCall(idQuestion, mockToken);

      expect(result).toEqual({ success: true, data: { success: true } });
      
    });
    
    it('should throw NotFoundException if survey is not found', async () => {
      const mockToken = 'mockToken';
      const idQuestion = 1;

      jest.spyOn(jwtService, 'verify').mockReturnValue({ id: '1' });
      jest.spyOn(prismaService.surveys, 'findUnique').mockResolvedValue(null);

      await expect(
        service.explainTopicAndQuestionOnCall(idQuestion, mockToken),
      ).rejects.toThrow(new NotFoundException('Survey not found'));
    });
  });

  describe('answerQuestionSurvey', () => {
    it('should create a new user survey answer and return success', async () => {
      const idQuestion = 1;
      const user = '123456789';
      const answer = true;

      const mockSurvey:any = { question: 'Sample Question', topic: 'Sample Topic' };
      const mockUser:any = { id: 1, wallet_address: '0xabc' };
      const mockTransaction = { TransactionHash: '0x123' };

      jest.spyOn(prismaService.surveys, 'findUnique').mockResolvedValue(mockSurvey);
      jest.spyOn(prismaService.users, 'findFirst').mockResolvedValue(mockUser);
      jest.spyOn(axios, 'post').mockResolvedValue({ data: mockTransaction });
      jest.spyOn(prismaService.usersurveyanswers, 'create').mockResolvedValue(null);

      const result = await service.answerQuestionSurvey(idQuestion, user, answer);

      expect(prismaService.usersurveyanswers.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            id_question: idQuestion,
            won: answer,
            tx_gift: mockTransaction.TransactionHash,
          }),
        }),
      );

      expect(result).toEqual({ success: true });
    });
    
    it('should throw NotFoundException if survey is not found', async () => {
      const idQuestion = 1;
      const user = '123456789';
      const answer = true;

      jest.spyOn(prismaService.surveys, 'findUnique').mockResolvedValue(null);

      await expect(
        service.answerQuestionSurvey(idQuestion, user, answer),
      ).rejects.toThrow(new NotFoundException('Survey not found'));
    });
  });
});
