import axios from 'axios';
import { JwtService } from '@nestjs/jwt';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SurveysService {
  constructor(private readonly jwtService: JwtService, private prisma: PrismaService) {}

  async generateSurvey(token: string): Promise<any> {
    const decoded = this.jwtService.verify(token);
    
    let data:any = await this.prisma.surveys.findMany({
      where: {
        status: 'ACTIVE'
      },
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
            currency_gift: true
          },
          where: {
            created_by: Number(decoded.id)
          }
        }
      }
    }) || [];

    data = data.map(survey => {
      const attemptsCount = survey?.surveyAnswers?.length;
      let wonRegister = survey?.surveyAnswers?.filter(answer => answer.won);
          wonRegister = wonRegister ? wonRegister[0] : false;
      
      let wonResponse = wonRegister ? {
        tx_gift: wonRegister.tx_gift,
        tx_gift_url: wonRegister.tx_gift.indexOf("0x")>=0? `https://snowtrace.io/tx/${wonRegister.tx_gift}` : wonRegister.tx_gift,
        won_at: wonRegister.updated_at,
        amount_gift: wonRegister.amount_gift,
        address_gift: wonRegister.address_gift,
        currency_gift: wonRegister.currency_gift
      } : false;

      return {
        id: survey.id,
        topic: survey.topic,
        attemptsCount,
        won: wonResponse
      };
    });

    return {data};
  }

  async explainTopicAndQuestionOnCall(idQuestion: number, token: string): Promise<any> {
    const decoded = this.jwtService.verify(token);
    
    const survey = await this.prisma.surveys.findUnique({
      where: { id: Number(idQuestion) },
      select: { topic: true, question: true }
    });

    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    if (!Number(decoded.id)) {
      throw new NotFoundException('User not found');
    }

    const user = await this.prisma.users?.findUnique({ where: { id: Number(decoded?.id) } });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    const alreadyWon = await this.prisma.usersurveyanswers.findFirst({
      where: {
        id_question: Number(idQuestion),
        created_by: user.id,
        won: true
      }
    })

    if (alreadyWon) {
      throw new NotFoundException(`You already won this topic: ${survey.topic}. Please try with another.`);
    }   

    let PROMPT = `Use the current date: ${new Date()}. The phonenumber of the user is: ${user.cellphone}. The idQuestion is: ${idQuestion}.
    
    If there is not idQuestion you don't need to make question to the user.

    Please create a short question after your explanation of the topic that you have answered, to evaluate if the user has learned and if the answer of the user is correct   please set  the variable userAnswer into true when you make the http request for saving the answer, but if the response is incorrect please set the variable on false 
    So end the conversation and say in polite way thanks to the user
    So try to answer this when you start talking because the user already know the topic and when is talking to you he is waiting for your response so you dont need to ask to the user because you already have the topic that in this case is: ${survey.topic}`;
        
    const data = {
      lang: 'en',
      nameBot: "Cryptocall",
      name: 'Avalanche Student',
      idQuestion: idQuestion,
      number: (user.cellphone.indexOf("+")>=0 ? user.cellphone : '+'+user.cellphone),
      document: PROMPT
    };
  
    try {
      const response = await axios.post(`${process.env.URL_CALL}/call`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      return {success:true, data: response.data};
    } catch (error) {
      console.error('Error making the call:', error.message);
      throw error;
    }

  }

  async answerQuestionSurvey(idQuestion: number, user: string, answer: boolean): Promise<any> {
    const survey = await this.prisma.surveys.findUnique({
      where: { id: Number(idQuestion) },
      select: { question: true, topic: true }
    });

    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    let userR = await this.prisma.users?.findFirst({ where: { cellphone: user } });

    if (!userR) {
      throw new NotFoundException('User not found');
    }

    let transactionGiftHash;

    if(answer==true){
      try{
        const responseTXAvalanche = await axios.post(`https://api.tatum.io/v3/avalanche/transaction`, {
          currency: 'AVAX',
          amount: process.env.AMOUNT_GWEI_SEND_SURVEY,
          fromPrivateKey: process.env.VAULT_PRIVATE_KEY,
          to: userR.wallet_address
        }, {
          headers: {
            'Authorization': `Bearer ${process.env.API_KEY_TATUM}`,
            'Content-Type': 'application/json'
          }
        });
        transactionGiftHash = responseTXAvalanche.data.TransactionHash;
      }catch(error){
        transactionGiftHash = (error?.response?.data?.message||'')+" "+(error?.response?.data?.cause||'');
      }
    }

    await this.prisma.usersurveyanswers.create({
      data: {
        id_question: Number(idQuestion),       
        question: survey.question,
        won: (answer==true?true:false),
        address_gift: (answer==true?userR.wallet_address:""),
        amount_gift: (answer==true?process.env.AMOUNT_GWEI_SEND_SURVEY:""),
        currency_gift: (answer==true?"AVAX":""),
        tx_gift: (answer==true?transactionGiftHash:""),
        created_by: Number(userR.id),
        updated_by: Number(userR.id)
      }
    });

    return {success: true};
  }
}
