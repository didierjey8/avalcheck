import axios from 'axios';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, HttpException } from '@nestjs/common';
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            users: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('authenticate', () => {
    const mockUser:any = { id: 1, role: 'USER', wallet_address: '0x123', status: 'ACTIVE' };

    it('should return an access token if user exists and matches wallet address', async () => {
      jest.spyOn(prisma.users, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue('mockToken');
  
      const result = await service.authenticate('123456789', '0x123');
  
      expect(prisma.users.findUnique).toHaveBeenCalledWith({ where: { cellphone: '123456789' } });
      expect(jwtService.sign).toHaveBeenCalledWith({ id: 1, role: 'USER' });
      expect(result).toEqual({ access_token: 'mockToken' });
    });
  
    it('should update wallet address if user exists but address does not match', async () => {
      jest.spyOn(prisma.users, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prisma.users, 'update').mockResolvedValue({ ...mockUser, wallet_address: '0x1234' });
      jest.spyOn(jwtService, 'sign').mockReturnValue('mockToken');
  
      const result = await service.authenticate('123456789', '0x1234');
  
      expect(prisma.users.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { wallet_address: '0x1234' },
      });
      expect(result).toEqual({ access_token: 'mockToken' });
    });
  
    it('should create a new user if not found', async () => {
      jest.spyOn(prisma.users, 'findUnique').mockResolvedValue(null);
      const mockNewUser:any = { id: 8, role: 'USER', wallet_address: '0x12345' };
      jest.spyOn(prisma.users, 'create').mockResolvedValue(mockNewUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue('mockToken');
  
      const result = await service.authenticate('1234567890', '0x12345');
  
      expect(prisma.users.create).toHaveBeenCalledWith({
        data: { cellphone: '1234567890', wallet_address: '0x12345' },
      });
      expect(result).toEqual({ access_token: 'mockToken' });
    });
  });  

  describe('findByCellphone', () => {
    it('should return user if found', async () => {
      const mockUser:any = { id: 1, cellphone: '123456789' };
      jest.spyOn(prisma.users, 'findUnique').mockResolvedValue(mockUser);
  
      const result = await service.findByCellphone('123456789');
  
      expect(prisma.users.findUnique).toHaveBeenCalledWith({ where: { cellphone: '123456789' } });
      expect(result).toEqual(mockUser);
    });
  
    it('should return null if user not found', async () => {
      jest.spyOn(prisma.users, 'findUnique').mockResolvedValue(null);
  
      const result = await service.findByCellphone('987654321');
  
      expect(result).toBeNull();
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate user successfully', async () => {
      const mockUser:any = { id: 1, status: 'ACTIVE' };
      jest.spyOn(jwtService, 'verify').mockReturnValue({ id: 1 });
      jest.spyOn(prisma.users, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prisma.users, 'update').mockResolvedValue({ ...mockUser, status: 'DELETED' });
  
      const result = await service.deactivateUser('mockToken');
  
      expect(jwtService.verify).toHaveBeenCalledWith('mockToken');
      expect(prisma.users.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prisma.users.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'DELETED' },
      });
      expect(result).toEqual({ ...mockUser, status: 'DELETED' });
    });
  
    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(jwtService, 'verify').mockReturnValue({ id: 1 });
      jest.spyOn(prisma.users, 'findUnique').mockResolvedValue(null);
  
      await expect(service.deactivateUser('mockToken')).rejects.toThrow(NotFoundException);
    });
  });

  describe('chat', () => {
    it('should return chat response successfully', async () => {
      const mockUser:any = { id: 1, openai_chat: 'mockChatId' };
      jest.spyOn(jwtService, 'verify').mockReturnValue({ id: 1 });
      jest.spyOn(prisma.users, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(axios, 'post').mockResolvedValue({ data: { data: { updatedChat: { messages: [{ content: 'response', date_create: new Date() }] } } } });
  
      const result = await service.chat('mockToken', 'Hello!');
  
      expect(jwtService.verify).toHaveBeenCalledWith('mockToken');
      expect(prisma.users.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(axios.post).toHaveBeenCalled();
      expect(result).toEqual({ success: true, data: 'response' });
    });
  
    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(jwtService, 'verify').mockReturnValue({ id: 1 });
      jest.spyOn(prisma.users, 'findUnique').mockResolvedValue(null);
  
      await expect(service.chat('mockToken', 'Hello!')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTransactions', () => {
    it('should fetch transactions successfully for testnet', async () => {
      jwtService.verify = jest.fn().mockReturnValue({ id: 1 });

      prisma.users.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        wallet_address: '0x123',
      });

      mockedAxios.get.mockResolvedValue({
        data: {
          items: [
            {
              value: '1000000000000000000',
              from: '0x456',
              id: '0x789',
            },
            {
              value: '2000000000000000000',
              from: '0x123',
              id: '0xabc',
            },
          ],
        },
      });

      const result = await service.getTransactions('valid_token', 'testnet');

      expect(result).toEqual({
        success: true,
        data: [
          {
            amount: '1.0000',
            network: 'Fuji-Testnet',
            type: 'in',
            hash: '0x789',
          },
          {
            amount: '2.0000',
            network: 'Fuji-Testnet',
            type: 'out',
            hash: '0xabc',
          },
        ],
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.routescan.io/v2/network/testnet/evm/all/address/0x123/transactions?ecosystem=avalanche&includedChainIds=43113&sort=desc&limit=250'
      );
    });

    it('should fetch transactions successfully for mainnet', async () => {
      jwtService.verify = jest.fn().mockReturnValue({ id: 1 });

      prisma.users.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        wallet_address: '0x123',
      });

      mockedAxios.get.mockResolvedValue({
        data: {
          items: [
            {
              value: '1000000000000000000',
              from: '0x456',
              id: '0x789',
            },
          ],
        },
      });

      const result = await service.getTransactions('valid_token', 'mainnet');

      expect(result).toEqual({
        success: true,
        data: [
          {
            amount: '1.0000',
            network: 'C-Chain',
            type: 'in',
            hash: '0x789',
          },
        ],
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.routescan.io/v2/network/mainnet/evm/all/address/0x123/transactions?ecosystem=avalanche&includedChainIds=43114&sort=desc&limit=250'
      );
    });

    it('should throw NotFoundException if user is not found', async () => {
      jwtService.verify = jest.fn().mockReturnValue({ id: 1 });
      prisma.users.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.getTransactions('valid_token', 'testnet')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw HttpException if axios fails', async () => {
      jwtService.verify = jest.fn().mockReturnValue({ id: 1 });
      prisma.users.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        wallet_address: '0x123',
      });

      mockedAxios.get.mockRejectedValue(new Error('Axios error'));

      await expect(service.getTransactions('valid_token', 'testnet')).rejects.toThrow(
        HttpException,
      );
      await expect(service.getTransactions('valid_token', 'testnet')).rejects.toThrow(
        'Error fetching transactions',
      );
    });

    it('should throw HttpException if JWT token is invalid', async () => {
      jwtService.verify = jest.fn().mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.getTransactions('invalid_token', 'testnet')).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw HttpException if user is not found', async () => {
      jwtService.verify = jest.fn().mockReturnValue({ id: 1 });
    
      prisma.users.findUnique = jest.fn().mockResolvedValue(null);
    
      await expect(service.getTransactions('valid_token', 'testnet')).rejects.toThrow(HttpException);
    });
  });

  describe('createAvalancheOperationBrianknows', () => {
    let service: UsersService;
    let jwtService: JwtService;
    let prismaService: PrismaService;
  
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UsersService,
          JwtService,
          {
            provide: PrismaService,
            useValue: {
              users: {
                findUnique: jest.fn(),
              },
            },
          },
        ],
      }).compile();
  
      service = module.get<UsersService>(UsersService);
      jwtService = module.get<JwtService>(JwtService);
      prismaService = module.get<PrismaService>(PrismaService);
    });
  
    it('should handle TX action successfully', async () => {
      const mockToken = 'mockToken';
      const mockDecoded = { id: 1 };
      jest.spyOn(jwtService, 'verify').mockReturnValue(mockDecoded);
  
      const mockUser = { id: 1, cellphone: '573173025584', wallet_address: 'bbbbbbb' };
      (prismaService.users.findUnique as jest.Mock).mockResolvedValue(mockUser);
  
      const mockResponseData = {
        transactionId: '123abc',
        status: 'success',
      };
      mockedAxios.post.mockResolvedValueOnce({ data: mockResponseData });
  
      const token = mockToken;
      const message = 'Send 5 AVAX to wallet xyz';
      const actionUser = 'TX';
      const toAddress = '0xWallet123';
      const contractName = '';
  
      const result = await service.createAvalancheOperationBrianknows(
        token,
        message,
        actionUser,
        toAddress,
        contractName,
      );
  
      expect(jwtService.verify).toHaveBeenCalledWith(mockToken);
      expect(prismaService.users.findUnique).toHaveBeenCalledWith({ where: { id: mockDecoded.id } });
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.brianknows.org/api/v0/agent/transaction',
        {
          prompt: message,
          address: toAddress,
          chainId: '43114'
        },
        {
          headers: {
            'X-Brian-Api-Key': process.env.BRIAN_KNOWS_API_KEY,
            'Content-Type': 'application/json',
          },
        },
      );
      expect(result).toEqual({
        success: true,
        data: 'Transaction was generate with brianknows.',
        action: 'TX',
        extra: mockResponseData,
      });
    });
    
    it('should handle error from TX action', async () => {
      const mockToken = 'mockToken';
      const mockDecoded = { id: 1 };
      jest.spyOn(jwtService, 'verify').mockReturnValue(mockDecoded);
  
      const mockUser = { id: 1, cellphone: '573173025584', wallet_address: 'bbbbbbb' };
      (prismaService.users.findUnique as jest.Mock).mockResolvedValue(mockUser);
  
      const mockErrorResponse = {
        response: {
          data: {
            message: 'Invalid wallet address',
            cause: 'Address format is incorrect',
          },
        },
      };
      mockedAxios.post.mockRejectedValueOnce(mockErrorResponse);
  
      const token = mockToken;
      const message = 'Send 5 AVAX to wallet xyz';
      const actionUser = 'TX';
      const toAddress = '0xInvalidWallet';
      const contractName = '';
  
      const result = await service.createAvalancheOperationBrianknows(
        token,
        message,
        actionUser,
        toAddress,
        contractName,
      );
  
      expect(jwtService.verify).toHaveBeenCalledWith(mockToken);
      expect(prismaService.users.findUnique).toHaveBeenCalledWith({ where: { id: mockDecoded.id } });
      expect(mockedAxios.post).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        data: 'Invalid wallet address Address format is incorrect',
        action: 'TX',
        extra: {},
      });
    });

    it('should handle CONTRACT action successfully', async () => {
      const mockToken = 'mockToken';
      const mockDecoded = { id: 1 };
      const mockUser:any = { id: 1, name: 'Test User' };
      const mockResponse = {
        data: { contract: 'contract code' },
      };
  
      jest.spyOn(jwtService, 'verify').mockReturnValue(mockDecoded);
      jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(mockUser);
      mockedAxios.post.mockResolvedValue(mockResponse);
  
      const result = await service.createAvalancheOperationBrianknows(
        mockToken,
        'Generate smart contract',
        'CONTRACT',
        '',
        '',
      );
  
      expect(jwtService.verify).toHaveBeenCalledWith(mockToken);
      expect(prismaService.users.findUnique).toHaveBeenCalledWith({ where: { id: mockDecoded.id } });
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.brianknows.org/api/v0/agent/smart-contract',
        { prompt: 'Generate smart contract' },
        {
          headers: {
            'X-Brian-Api-Key': process.env.BRIAN_KNOWS_API_KEY,
            'Content-Type': 'application/json',
          },
        },
      );
      expect(result).toEqual({
        success: true,
        data: 'Smartcontract solidity code was generate with brianknows.',
        action: 'CONTRACT',
        extra: mockResponse.data,
      });
    });

    it('should handle error from CONTRACT action', async () => {
      const mockToken = 'mockToken';
      const mockDecoded = { id: 1 };
      const mockUser:any = { id: 1, name: 'Test User' };
      const mockError = {
        response: {
          data: {
            message: 'Error message',
            cause: 'Some cause',
          },
        },
      };
  
      jest.spyOn(jwtService, 'verify').mockReturnValue(mockDecoded);
      jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(mockUser);
      mockedAxios.post.mockRejectedValue(mockError);
  
      const result = await service.createAvalancheOperationBrianknows(
        mockToken,
        'Generate smart contract',
        'CONTRACT',
        '',
        '',
      );
  
      expect(jwtService.verify).toHaveBeenCalledWith(mockToken);
      expect(prismaService.users.findUnique).toHaveBeenCalledWith({ where: { id: mockDecoded.id } });
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.brianknows.org/api/v0/agent/smart-contract',
        { prompt: 'Generate smart contract' },
        {
          headers: {
            'X-Brian-Api-Key': process.env.BRIAN_KNOWS_API_KEY,
            'Content-Type': 'application/json',
          },
        },
      );
      expect(result).toEqual({
        success: true,
        data: 'Error message Some cause',
        action: 'CONTRACT',
        extra: {},
      });
    });

    it('should handle COMPILE action successfully', async () => {
      const mockToken = 'mockToken';
      const mockDecoded = { id: 1 };
      const mockUser: any = { id: 1, name: 'Test User' };
      const mockResponse = {
        data: { bytecode: 'compiled bytecode' },
      };
    
      jest.spyOn(jwtService, 'verify').mockReturnValue(mockDecoded);
      jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(mockUser);
      mockedAxios.post.mockResolvedValue(mockResponse);
    
      const result = await service.createAvalancheOperationBrianknows(
        mockToken,
        'pragma solidity ^0.8.0; contract Test {}',
        'COMPILE',
        '',
        'Test',
      );
    
      expect(jwtService.verify).toHaveBeenCalledWith(mockToken);
      expect(prismaService.users.findUnique).toHaveBeenCalledWith({ where: { id: mockDecoded.id } });
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.brianknows.org/api/v0/utils/compile',
        {
          code: 'pragma solidity ^0.8.0; contract Test {}',
          contractName: 'Test',
        },
        {
          headers: {
            'X-Brian-Api-Key': process.env.BRIAN_KNOWS_API_KEY,
            'Content-Type': 'application/json',
          },
        },
      );
      expect(result).toEqual({
        success: true,
        data: 'Smartcontract solidity code was compile with brianknows.',
        action: 'COMPILE',
        extra: mockResponse.data,
      });
    });

    it('should handle error from COMPILE action', async () => {
      const mockToken = 'mockToken';
      const mockDecoded = { id: 1 };
      const mockUser:any = { id: 1, name: 'Test User' };
      const mockError = {
        response: {
          data: {
            message: 'Compilation error',
            cause: 'Syntax error',
          },
        },
      };
    
      jest.spyOn(jwtService, 'verify').mockReturnValue(mockDecoded);
      jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(mockUser);
      mockedAxios.post.mockRejectedValue(mockError);
    
      const result = await service.createAvalancheOperationBrianknows(
        mockToken,
        'pragma solidity ^0.8.0; contract Test {',
        'COMPILE',
        '',
        'Test',
      );
    
      expect(jwtService.verify).toHaveBeenCalledWith(mockToken);
      expect(prismaService.users.findUnique).toHaveBeenCalledWith({ where: { id: mockDecoded.id } });
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.brianknows.org/api/v0/utils/compile',
        {
          code: 'pragma solidity ^0.8.0; contract Test {',
          contractName: 'Test',
        },
        {
          headers: {
            'X-Brian-Api-Key': process.env.BRIAN_KNOWS_API_KEY,
            'Content-Type': 'application/json',
          },
        },
      );
      expect(result).toEqual({
        success: true,
        data: 'Compilation error Syntax error',
        action: 'COMPILE',
        extra: {},
      });
    });

    it('should handle EXPLAIN action successfully', async () => {
      const mockToken = 'mockToken';
      const mockDecoded = { id: 1 };
      const mockUser:any = { id: 1, name: 'Test User' };
      const mockResponse = {
        data: { explanation: 'This contract creates a simple counter.' },
      };
    
      jest.spyOn(jwtService, 'verify').mockReturnValue(mockDecoded);
      jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(mockUser);
      mockedAxios.post.mockResolvedValue(mockResponse);
    
      const result = await service.createAvalancheOperationBrianknows(
        mockToken,
        'pragma solidity ^0.8.0; contract Counter { uint256 count; }',
        'EXPLAIN',
        '',
        '',
      );
    
      expect(jwtService.verify).toHaveBeenCalledWith(mockToken);
      expect(prismaService.users.findUnique).toHaveBeenCalledWith({ where: { id: mockDecoded.id } });
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.brianknows.org/api/v0/utils/explain',
        {
          code: 'pragma solidity ^0.8.0; contract Counter { uint256 count; }',
        },
        {
          headers: {
            'X-Brian-Api-Key': process.env.BRIAN_KNOWS_API_KEY,
            'Content-Type': 'application/json',
          },
        },
      );
      expect(result).toEqual({
        success: true,
        data: 'Solidity code was explained with brianknows.',
        action: 'EXPLAIN',
        extra: mockResponse.data,
      });
    });

    it('should handle error from EXPLAIN action', async () => {
      const mockToken = 'mockToken';
      const mockDecoded = { id: 1 };
      const mockUser:any = { id: 1, name: 'Test User' };
      const mockError = {
        response: {
          data: {
            message: 'Explanation error',
            cause: 'Invalid syntax',
          },
        },
      };
    
      jest.spyOn(jwtService, 'verify').mockReturnValue(mockDecoded);
      jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(mockUser);
      mockedAxios.post.mockRejectedValue(mockError);
    
      const result = await service.createAvalancheOperationBrianknows(
        mockToken,
        'pragma solidity ^0.8.0; contract {',
        'EXPLAIN',
        '',
        '',
      );
    
      expect(jwtService.verify).toHaveBeenCalledWith(mockToken);
      expect(prismaService.users.findUnique).toHaveBeenCalledWith({ where: { id: mockDecoded.id } });
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.brianknows.org/api/v0/utils/explain',
        {
          code: 'pragma solidity ^0.8.0; contract {',
        },
        {
          headers: {
            'X-Brian-Api-Key': process.env.BRIAN_KNOWS_API_KEY,
            'Content-Type': 'application/json',
          },
        },
      );
      expect(result).toEqual({
        success: true,
        data: 'Explanation error Invalid syntax',
        action: 'EXPLAIN',
        extra: {},
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      const mockToken = 'mockToken';
      const mockDecoded = { id: 1 };
      jest.spyOn(jwtService, 'verify').mockReturnValue(mockDecoded);
      
      (prismaService.users.findUnique as jest.Mock).mockResolvedValue(null);
    
      const token = mockToken;
      const message = 'Send 5 AVAX to wallet xyz';
      const actionUser = 'TX';
      const toAddress = '0xWallet123';
      const contractName = '';
    
      await expect(
        service.createAvalancheOperationBrianknows(token, message, actionUser, toAddress, contractName),
      ).rejects.toThrow(NotFoundException);
    
      expect(jwtService.verify).toHaveBeenCalledWith(mockToken);
      expect(prismaService.users.findUnique).toHaveBeenCalledWith({ where: { id: mockDecoded.id } });
      //expect(mockedAxios.post).not.toHaveBeenCalled();
    });
  });
});
