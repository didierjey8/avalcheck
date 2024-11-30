import axios from 'axios';
import * as puppeteer from 'puppeteer';
import { JwtService } from '@nestjs/jwt';
import { certificateLevel } from '@prisma/client';
import { SubmitAnswersDto } from './submit-answers.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class CertificatesService {
  constructor(private readonly jwtService: JwtService, private prisma: PrismaService) {}

  async getQuestionsWithAnswers(level: certificateLevel) {
    const questions = await this.prisma.certificatequestions.findMany({
      where: { level: level },
      select: {
        id: true,
        level: true,
        question: true,
        certificatequestionanswers: {
          select: {
            id: true,
            answer: true
          },
          orderBy: {
            id: 'asc',
          },
        }
      },
    });

    const shuffledQuestions = this.shuffleArray(questions);

    const questionsWithRandomAnswers = shuffledQuestions.map(question => {
      const shuffledAnswers = this.shuffleArray(question.certificatequestionanswers);
      return {
        ...question,
        certificatequestionanswers: shuffledAnswers,
      };
    });

    return questionsWithRandomAnswers;
  }

  private shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  async evaluateAnswers(level: certificateLevel, submitAnswersDto: SubmitAnswersDto, token: string) {
    const questions = await this.prisma.certificatequestions.findMany({
      where: { level },
      include: { certificatequestionanswers: true },
    });

    
    if (questions.length !== submitAnswersDto.answers.length) {
      throw new BadRequestException('Incorrect number of answers provided');
    }

    const correctAnswersMap = questions.reduce((acc, question) => {
      const correctAnswer = question.certificatequestionanswers.find(ans => ans.valid);
      acc[question.id] = correctAnswer?.id;
      return acc;
    }, {});

    let correctCount = 0;

    submitAnswersDto.answers.forEach(({ questionId, answerId }) => {
      if (correctAnswersMap[questionId] === answerId) {
        correctCount++;
      }
    });

    const score = (correctCount / questions.length) * 100;

    const decoded = this.jwtService.verify(token);
    const user = await this.prisma.users.findUnique({ where: { id: Number(decoded.id) } });

    let PDFCertificate = false;
    let PNGCertificate = false;
    
    //if(score>70)
    PDFCertificate = await this.generateCertificatePDF(level,user.wallet_address, score, 'pdf');
    PNGCertificate = await this.generateCertificatePDF(level,user.wallet_address, score, 'png');

    const options = {
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.CROSSMINT_KEY, 
        'Content-Type': 'application/json'
      },
      body: `{"metadata":{"name":"AVALANCHE CERTIFICATE OF ACHIEVEMENT ${level.toLocaleLowerCase()} - BY AVALCHECK NFT","image":"${PNGCertificate}","description":"For successfully completing the Avalanche 9000 examination, demonstrating exceptional knowledge in subnet deployment, cross-chain communication, and ${level.toLocaleLowerCase()} smart contract development within the Avalanche ecosystem.","attributes":[{"display_type":"number","trait_type":"scrore","value":"${score}"}]},"recipient":"avalanche:${user.wallet_address}","sendNotification":true,"locale":"en-US","reuploadLinkedFiles":true,"compressed":true}`
    };
    ``
    let NFTCertificate;
    
    try {
      const response = await fetch(`https://www.crossmint.com/api/2022-06-09/collections/${process.env.CROSSMINT_COLLECTION_NFT_ID}/nfts`, options);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      NFTCertificate = await response.json();
      NFTCertificate = NFTCertificate?.onChain?.contractAddress;
      NFTCertificate = `https://snowtrace.io/nft/${NFTCertificate}/1?chainid=43114&type=erc721`;

    } catch (error) {
      console.error('Error fetching NFT Certificate:', error.message || error);
    }

    return { score, PDFCertificate, PNGCertificate, NFTCertificate };
  }

  private async generateCertificatePDF(level: string, address: string, score: number, format: string) {
    const htmlContent = `<!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              padding:0;
              background-color: #f0f0f0;
              font-family: Arial, sans-serif;
            }

            .certificate {
              position: relative;
              width: 800px;
              padding: 40px;
              background: white;
              border: 2px solid #ccc;
            }

            .border-design {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              border: 20px solid transparent;
              border-image: linear-gradient(45deg, #ff0000, #ffa500) 1;
            }

            .diagonal-lines {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              overflow: hidden;
              pointer-events: none;
            }

            .diagonal-line {
              position: absolute;
              background: #ffd700;
              height: 3px;
              width: 200px;
              transform: rotate(45deg);
            }

            .diagonal-line:nth-child(1) { top: 50px; left: -100px; }
            .diagonal-line:nth-child(2) { top: 50px; right: -100px; }
            .diagonal-line:nth-child(3) { bottom: 50px; left: -100px; }
            .diagonal-line:nth-child(4) { bottom: 50px; right: -100px; }

            .content {
              position: relative;
              text-align: center;
              z-index: 1;
            }

            .title {
              color: #dc3545;
              font-size: 36px;
              margin: 0;
              font-weight: bold;
            }

            .subtitle {
              color: #ffa500;
              font-size: 24px;
              margin: 10px 0 30px;
            }

            .recipient {
              color: #ffa500;
              font-size: 24px;
              font-family: monospace;
              margin: 20px 0;
              word-break: break-all;
              padding: 0 40px;
            }

            .description {
              color: #666;
              font-size: 16px;
              margin: 20px auto;
              max-width: 600px;
              line-height: 1.5;
            }

            .score {
              font-size: 24px;
              color: #dc3545;
              font-weight: bold;
              margin: 20px 0;
            }

            .signature-section {
              display: flex;
              justify-content: space-around;
              margin-top: 50px;
            }

            .signature-line {
              width: 200px;
              border-top: 1px solid #000;
              padding-top: 10px;
              margin-top: 20px;
            }

            .award-seal {
              position: absolute;
              top: 20px;
              right: 20px;
              width: 100px;
              height: 100px;
              background: #dc3545;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 14px;
              text-align: center;
              padding: 10px;
              box-shadow: 0 0 0 5px #dc3545, 0 0 0 7px white;
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="border-design"></div>
            <div class="diagonal-lines">
              <div class="diagonal-line"></div>
              <div class="diagonal-line"></div>
              <div class="diagonal-line"></div>
              <div class="diagonal-line"></div>
            </div>
            <div class="content">
              <h1 class="title">CERTIFICATE</h1>
              <h2 class="subtitle">OF ACHIEVEMENT</h2>
              <div>This certificate is proudly presented to</div>
              <div class="recipient">${address}</div>
              <p class="description">
                For successfully completing the Avalanche 9000 examination, demonstrating 
                exceptional knowledge in subnet deployment, cross-chain communication, 
                and <b>${level.toLocaleLowerCase()}</b> smart contract development within the Avalanche ecosystem.
              </p>
              <div class="score">
                Final Score: ${score}/100
              </div>
              <div class="signature-section">
                <div>
                  <div class="signature-line"></div>
                  <div>${new Date().toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}</div>
                </div>
                <div>
                  <div class="signature-line"></div>
                  <div>Protocol Director</div>
                </div>
              </div>
            </div>
            <div class="award-seal"><b>${level.toUpperCase()}</b>!</div>
          </div>
        </body>
        </html>`;

      const browser = await puppeteer.connect({ browserWSEndpoint: process.env.BROWSERWSENDPOINT });
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle2' });
      let formData, blob;

      if(format=="pdf"){
        const pdfBuffer = await page.pdf({ landscape: true });
        formData = new FormData();
        blob = new Blob([pdfBuffer], { type: 'application/pdf' });
        formData.append('file', blob, 'certificate.pdf');
      }else if(format=="png"){
        await page.setViewport({ width: 1200, height: 800 });
        const pngBuffer = await page.screenshot({ type: 'png', fullPage: true, omitBackground: true });
        formData = new FormData();
        blob = new Blob([pngBuffer], { type: 'image/png' });
        formData.append('file', blob, 'certificate.png');
      }

      await browser.close();

      const baseUrl = `${process.env.URL_CONEX_STAR}/fileblocks`;
      
      const response = await axios.post(
        baseUrl,
        formData,
        {
          headers: {
            "Authorization": `Bearer ${process.env.AUTH_CONEXION_STAR}`
          }
        }
      );

    return response.data.data.imgeUrlOpenWindows;
  }
}
