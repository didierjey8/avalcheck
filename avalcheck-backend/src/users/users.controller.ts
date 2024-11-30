import { UsersService } from './users.service';
import { certificateLevel } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../jwt-auth/jwt-auth.guard';
import { Controller, Get, Post, Put, Body, UseGuards, Req, Param } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(private readonly prismaService: PrismaService, private readonly usersService: UsersService) {}
  
  @Post('signin')
  async login(@Body('cellphone') cellphone: string, @Body('wallet_address') walletAddress: string) {
    return this.usersService.authenticate(cellphone, walletAddress);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUsers() {
    return this.prismaService.users.findMany();
  }
  
  @UseGuards(JwtAuthGuard)
  @Put('deactivate')
  async deactivate(@Req() req: any) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.usersService.deactivateUser(token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('chat')
  async chat(@Req() req: any, @Body('message') message: string, @Body('origin') origin?: string, @Body('level') level?: certificateLevel) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.usersService.chat(token, message, origin, level);
  }
  
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createAvalancheOperation(
    @Req() req: any, 
    @Body('message') message: string, 
    @Body('firstMessage') firstMessage: boolean, 
    @Body('action') action: string, 
    @Body('hash') hash: string, 
    @Body('toAddress') toAddress: string, 
    @Body('amountToSend') amountToSend: string, 
    @Body('fromPrivateKey') fromPrivateKey: string,
    @Body('nameL1') nameL1: string,
    @Body('tokenNameL1') tokenNameL1: string,
    @Body('tokenSymbolL1') tokenSymbolL1: string
  ) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.usersService.createAvalancheOperation(token, firstMessage, message, action, hash, toAddress, amountToSend, fromPrivateKey, nameL1, tokenNameL1, tokenSymbolL1);
  }
  
  @UseGuards(JwtAuthGuard)
  @Post('create/brianknows')
  async createAvalancheOperationBrianknows(
    @Req() req: any, 
    @Body('message') message: string, 
    @Body('action') action: string, 
    @Body('toAddress') toAddress: string,
    @Body('contractName') contractName: string,
    @Body('network') network: string
  ) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.usersService.createAvalancheOperationBrianknows(token, message, action, toAddress, contractName, network);
  }

  @UseGuards(JwtAuthGuard)
  @Get('txs/:origin')
  async txs(@Param('origin') origin: string, @Req() req: any) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.usersService.getTransactions(token, origin);
  }
}