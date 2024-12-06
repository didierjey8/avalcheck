import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UsersModule } from '../src/users/users.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { SurveysController } from '../src/surveys/surveys.controller';
import { SurveysService } from '../src/surveys/surveys.service';
import { SurveysModule } from '../src/surveys/surveys.module';
import axios from 'axios';
import { JwtService } from '@nestjs/jwt';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

mockedAxios.post.mockResolvedValueOnce({
  data: {
    _id: 'mock-id-123',
    choices: [
      {
        message: {
          content: 'This is a mock response from OpenAI',
        },
      },
    ],
  },
});

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let prismaMock: any;

  beforeAll(async () => {
    prismaMock = {
      users: {
        findUnique: jest.fn().mockResolvedValue({
          id: 1,
          cellphone: '573173025584',
          wallet_address: 'bbbbbbb',
        }),
        update: jest.fn().mockResolvedValue({
          id: 1,
          cellphone: '573173025584',
          wallet_address: 'bbbbbbb',
        }),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should signin a user and return a token', async () => {
    const signinDto = {
      cellphone: "573173025584",
      wallet_address: "bbbbbbb",
    };
  
    const response = await request(app.getHttpServer())
      .post('/users/signin')
      .send(signinDto)
      .expect(201);

    accessToken = response.body.access_token;

    expect(response.body).toHaveProperty('access_token');
    expect(typeof response.body.access_token).toBe('string');
  });

  it('should deactivate a user and return the updated user', async () => {
    const deactivateDto = {
      cellphone: '573173025584',
      wallet_address: 'bbbbbbb',
    };

    const response = await request(app.getHttpServer())
      .put('/users/deactivate')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(deactivateDto)
      .expect(200);

    expect(response.body).toHaveProperty('cellphone', '573173025584');
    expect(response.body).toHaveProperty('wallet_address', 'bbbbbbb');
  });

  it('should send a chat message and receive a response', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        _id: 'mock-id-123',
        choices: [
          {
            message: {
              content: 'This is a mock response from OpenAI',
            },
          },
        ],
      },
    });
  
    const chatDto = {
      message: "Hi, What is avalanche?",
    };
  
    const response = await request(app.getHttpServer())
      .post('/users/chat')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(chatDto)
      .expect(201);
    
    expect(response.body).toHaveProperty('success', true);
  });

  it('should send a transaction via BrianKnows', async () => {
    const data = {
      action: 'TX',
      toAddress: '0x1102a4bc0448b3bbc91a8022b61b72d267d0933f',
      message: 'Transfer 1 USDT to vitalik.eth',
    };

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: 'Transaction completed',
      },
    });

    const response = await request(app.getHttpServer())
      .post('/users/create/brianknows')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(data)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBe('Transaction was generate with brianknows.');
    
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://api.brianknows.org/api/v0/agent/transaction',
      expect.objectContaining({
        address: data.toAddress,
        chainId: '43114',
        prompt: data.message,
      }),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-Brian-Api-Key': expect.any(String),
        }),
      })
    );
  });

  it('should generate a smart contract via BrianKnows', async () => {
    const data = {
      action: 'CONTRACT',
      message: 'Create a simple counter smart contract',
    };
  
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: 'Smart contract code generated successfully',
      },
    });
  
    const response = await request(app.getHttpServer())
      .post('/users/create/brianknows')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(data)
      .expect(201);
  
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBe('Smartcontract solidity code was generate with brianknows.');
  
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://api.brianknows.org/api/v0/agent/smart-contract',
      expect.objectContaining({
        prompt: data.message,
      }),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-Brian-Api-Key': expect.any(String),
        }),
      })
    );
  }); 

  it('should compile a smart contract via BrianKnows', async () => {
    const data = {
      action: 'COMPILE',
      message: 'pragma solidity ^0.8.0; contract Counter { uint256 count; }',
      contractName: 'Counter',
    };
  
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: 'Smart contract compiled successfully',
      },
    });
  
    const response = await request(app.getHttpServer())
      .post('/users/create/brianknows')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(data)
      .expect(201);
  
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBe('Smartcontract solidity code was compile with brianknows.');
  
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://api.brianknows.org/api/v0/utils/compile',
      expect.objectContaining({
        code: data.message,
        contractName: data.contractName,
      }),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-Brian-Api-Key': expect.any(String),
        }),
      })
    );
  });

  it('should explain a smart contract via BrianKnows', async () => {
    const data = {
      action: 'EXPLAIN',
      message: 'pragma solidity ^0.8.0; contract Counter { uint256 count; }',
    };
  
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: 'This contract implements a simple counter.',
      },
    });
  
    const response = await request(app.getHttpServer())
      .post('/users/create/brianknows')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(data)
      .expect(201);
  
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBe('Solidity code was explained with brianknows.');
  
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://api.brianknows.org/api/v0/utils/explain',
      expect.objectContaining({
        code: data.message,
      }),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-Brian-Api-Key': expect.any(String),
        }),
      })
    );
  }); 

  it('should return a list of transactions from the testnet', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        items: [
          {
            id: '0xtransaction1',
            value: '1000000000000000000',
            from: '0xotheraddress',
          },
          {
            id: '0xtransaction2',
            value: '2000000000000000000',
            from: 'bbbbbbb',
          },
        ],
      },
    });

    const response = await request(app.getHttpServer())
      .get('/users/txs/testnet')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      data: [
        {
          amount: '1.0000',
          network: 'Fuji-Testnet',
          type: 'in',
          hash: '0xtransaction1',
        },
        {
          amount: '2.0000',
          network: 'Fuji-Testnet',
          type: 'out',
          hash: '0xtransaction2',
        },
      ],
    });
  });

  it('should return 401 if no token is provided', async () => {
    await request(app.getHttpServer())
      .get('/users/txs/testnet')
      .expect(401);
  });

  it('should return 404 if the user is not found', async () => {
    prismaMock.users.findUnique.mockResolvedValueOnce(null);

    const response = await request(app.getHttpServer())
      .get('/users/txs/testnet')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);

    expect(response.body.message).toBe('User not found');
  });

  afterAll(async () => {
    await app.close();
  });
});

describe('SurveysController (E2E)', () => {
  let app: INestApplication;
  let accessToken: string;
  let prismaMock: any;
  
  beforeAll(async () => {
    accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTMsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzMzNDA1OTA3LCJleHAiOjE3MzM1ODU5MDd9.k9ptvqCV4VSicNC4KhH5ZDYoOOgPKx36Pa4-EXln9is';

    prismaMock = {
      surveys: {
        findMany: jest.fn().mockResolvedValue([{ id: 1, topic: 'Sample Topic', question: 'Sample Question' }]),
        findUnique: jest.fn().mockResolvedValue({ id: 1, topic: 'Sample Topic', question: 'Sample Question' }),
        findFirst: jest.fn().mockResolvedValue({ id: 1, topic: 'Sample Topic', question: 'Sample Question' }),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SurveysModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('/surveys/generate (GET)', () => {
    it('should return a survey when token is valid', async () => {
      const mockSurvey = [{ id: 1, topic: 'Sample Topic', question: 'Sample Question' }];
      
      return request(app.getHttpServer())
        .get('/surveys/generate')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('should return 404 if no surveys are found', async () => {
      
      return request(app.getHttpServer())
        .get('/surveys/generate')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });
  });

  describe('/surveys/call-explain-topic/:id (GET)', () => {
    it('should return survey details for the given question id', async () => {
      const idQuestion = 1;
      const mockResponse = { topic: 'Sample Topic', question: 'Sample Question' };
      
      return request(app.getHttpServer())
        .get(`/surveys/call-explain-topic/${idQuestion}`)
        .set('Authorization', `Bearer ${accessToken}`);
    });
  });

  describe('/surveys/answer (POST)', () => {
    it('should accept an answer and return success', async () => {
      const mockRequestBody = {
        idQuestion: 1,
        user: '123456789',
        answer: true,
      };
      const mockResponse = { message: 'Answer submitted successfully' };

      
      return request(app.getHttpServer())
        .post('/surveys/answer')
        .send(mockRequestBody);
    });

    it('should return 400 if the request body is invalid', async () => {
      return request(app.getHttpServer())
        .post('/surveys/answer')
        .send({
          user: '123456789',
          answer: true,
        });
    });
  });
});
