import axios from 'axios';
import { JwtService } from '@nestjs/jwt';
import { certificateLevel } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(private readonly jwtService: JwtService, private readonly prisma: PrismaService) {}

  async authenticate(cellphone: string, walletAddress: string) {
    let user = await this.findByCellphone(cellphone);
    let payload = {};
    if (user && user.wallet_address === walletAddress && user.status === 'ACTIVE') {
      payload = { id: user.id, role: user.role };
    }else if(user && user.status === 'ACTIVE'){
      await this.prisma.users.update({
        where: { id: user.id },
        data: { wallet_address: walletAddress },
      });
      
      payload = { id: user.id, role: user.role };
    }else if(!user||user?.status === 'DELETED'){
      await this.prisma.users.create({
        data: {
          cellphone,
          wallet_address: walletAddress
        },
      });

      user = await this.findByCellphone(cellphone);
      
      payload = user ? { id: user.id, role: user.role } : {};
    }

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async findByCellphone(cellphone: string) {
    return this.prisma.users.findUnique({ where: { cellphone } });
  }

  async deactivateUser(token: string) {
    const decoded = this.jwtService.verify(token);
    
    const user = await this.prisma.users.findUnique({ where: { id: Number(decoded.id) } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.prisma.users.update({
      where: { id: Number(decoded.id) },
      data: { status: 'DELETED' },
    });
  }

  async chat(token: string, message: string, origin?: string, level?: certificateLevel) {
    const decoded = this.jwtService.verify(token);
    
    const user = await this.prisma.users.findUnique({ where: { id: Number(decoded.id) } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let OPENAI_CHAT:any = user.openai_chat;
    
    let PROMPT = message
    let headers = {
      "Authorization": `Bearer ${process.env.AUTH_CONEXION_STAR}`
    };
    
    if(!user.openai_chat){
      //CREATE PROMPT
      let dataPrompt = {
        nombre: "Standar avalanche network interaction with user: "+user.wallet_address+"-"+Date.now(),
        texto: "Standar avalanche network interaction with user: "+user.wallet_address+"-"+Date.now()
      };

      let responseCreatePrompt = await axios.post(`${process.env.URL_CONEX_STAR}/gpt/create-prompt`, dataPrompt, { headers });
      responseCreatePrompt = responseCreatePrompt.data.data?._id;
      
      let dataChat = {
        prompt_ref: responseCreatePrompt
      };

      let responseCreateChat = await axios.post(`${process.env.URL_CONEX_STAR}/gpt/create-chat`, dataChat, { headers });
      responseCreateChat = responseCreateChat.data.data?._id;

      OPENAI_CHAT = responseCreateChat;

      await this.prisma.users.update({
        where: { id: user.id },
        data: { openai_chat: OPENAI_CHAT },
      });

      PROMPT = `You are a avalanche network expert that needs to make clear questions about avalanche network to users.
      Please give short messages to the users no more than 25 tokens
      Talk just about the topic, don't talk about other topics
      Use the current date: ${new Date()}
      Be kind with users.
      The user message is: ${message}`;
    }
    
    const baseUrl = `${process.env.URL_CONEX_STAR}/gpt/send-message/${OPENAI_CHAT}`;

    const response = await axios.post(
      baseUrl,
      {
        content: PROMPT,
        model: "gpt-4-1106-preview"
      },
      { headers }
    );

    let data = response?.data.data.updatedChat.messages || [];

    data.sort((a, b) => {
      const dateA = new Date(a.date_create).getTime();
      const dateB = new Date(b.date_create).getTime();
      return dateB - dateA;
    });
    data = data[0]?.content;
    

    if(origin=="surveys"){
      let surveys:any = await this.prisma.surveys.findMany({
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
      });
  
      surveys = surveys.map(survey => {
        const attemptsCount = survey.surveyAnswers.length;
        let wonRegister = survey.surveyAnswers.filter(answer => answer.won);
            wonRegister = wonRegister[0];
        
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

      return {success: true, data, surveys};
    }else if(origin=="certificate"){
      let quiz:any = 'Please select a level quiz: BASIC, MEDIUM or ADVANCED';
      if(["BASIC","MEDIUM","ADVANCED"].indexOf(level)>=0){
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
    
        quiz = shuffledQuestions.map(question => {
          const shuffledAnswers = this.shuffleArray(question.certificatequestionanswers);
          return {
            ...question,
            certificatequestionanswers: shuffledAnswers,
          };
        });
      }
      return {success: true, data, quiz};
    }else{

      return {success: true, data};
    }

  }
  
  private shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  async createAvalancheOperation(
    token: string, 
    firstMessage: boolean, 
    message: string, 
    actionUser: string, 
    hash: string, 
    toAddress: string, 
    amountToSend: string, 
    fromPrivateKey: string, 
    nameL1: string, 
    tokenNameL1: string, 
    tokenSymbolL1: string
  ) {
    const decoded = this.jwtService.verify(token);
    
    const user = await this.prisma.users.findUnique({ where: { id: Number(decoded.id) } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let action:any = actionUser;

    if(!action){
      let OPENAI_CHAT_CREATION:any = user.openai_chat_creation;
      
      let PROMPT = `You are an expert in the Avalanche network who, based on the user's message, must determine if they want to create an L1, a Wallet, a Transaction, query a transaction, Save Funds, Stake Funds, Swap Tokens, Buy Cryptocurrency, Create contract, Explain contract or discuss another topic.
      
      Please provide brief messages to users, with a maximum of 50 tokens.

      Creating a transaction is different from swapping tokens.

      Respond only in the following JSON format:

      { 
        "operation": "QUERY_TX" // Here, use one of these options: L1, WALLET, TX, STAKING_FUNDS, SAVING_FUNDS, QUERY_TX, SWAP, BUY_CRYPTO, EXPLAIN_CONTRACT, CREATE_CONTRACT, or OTHER 
        "data": // This property must be a JSON object with the relevant data for each case. Details are explained below. 
      }

      For QUERY_TX, data should be:

      { 
        "hash": (hash of the transaction to query) 
      }

      For TX, data should be:

      { 
        "addressTo": (address to transfer founds),
        "amountTo": (amount to transfer),
        "tokenToTransfer": (name of the token to transfer)
      }
        
      For L1, data should be:

      { 
        "nameL1": (Name of L1),
        "tokenNameL1": (Name token of L1),
        "tokenSymbolL1": (Symbol token of L1)
      }
        
      For CREATE_CONTRACT, data should be:

      { 
        "contractSpecifications": (contract functionalities specifications)
      }

      For EXPLAIN_CONTRACT, data should be:

      { 
        "contractCode": (smartcontract code)
      }
        
      For STAKING_FUNDS, data should be:

      { 
        "amounTo": (avax amount to staking, never use another token, only AVAX)
      }

      For SAVING_FUNDS, data should be:

      { 
        "amounTo": (avax amount to saving, never use another token, only AVAX)
      }
        
      For SWAP, data should be:

      { 
        "tokenFromSymbol": (symbol token from on avalanche network, but user maybe send only address token, you translate to symbol),
        "tokenFrom": (address token from on avalanche network, but user maybe send only name, you translate to address),
        "amounTo": (token from amount to swap),
        "tokenTo": (address token to on avalanche network, but user maybe send only name, you translate to address),
        "tokenToSymbol": (symbol token to on avalanche network, but user maybe send only address token, you translate to symbol)
      }

      If any required data for the data object is missing, you must ask the user to provide it according to the specific case:

      For QUERY_TX, the user must provide the transaction hash.

      And the response must be:

      { 
        "operation": "QUERY_TX" // Here, use one of these options: L1, WALLET, TX, STAKING_FUNDS, SAVING_FUNDS, QUERY_TX, SWAP, BUY_CRYPTO, EXPLAIN_CONTRACT, CREATE_CONTRACT, or OTHER 
        "error": // Error message with instructions for the user 
      }

      Do not respond about other topics.

      After interpreting the user's message and identifying what they are looking for, limit your response strictly to one of the structures mentioned above.

      Use the current date: ${new Date()}

      The user's message is: ${message}

      In the response, do not add the word json; provide only the formatted JSON on string for process on JSON.parse.`;


      let headers = {
        "Authorization": `Bearer ${process.env.AUTH_CONEXION_STAR}`
      };
      
      if(!user.openai_chat_creation){
        //CREATE PROMPT
        let dataPrompt = {
          nombre: "Creation avalanche network interaction with user: "+user.wallet_address+"-"+Date.now(),
          texto: "Creation avalanche network interaction with user: "+user.wallet_address+"-"+Date.now()
        };

        let responseCreatePrompt = await axios.post(`${process.env.URL_CONEX_STAR}/gpt/create-prompt`, dataPrompt, { headers });
        responseCreatePrompt = responseCreatePrompt.data.data._id;
        
        let dataChat = {
          prompt_ref: responseCreatePrompt
        };

        let responseCreateChat = await axios.post(`${process.env.URL_CONEX_STAR}/gpt/create-chat`, dataChat, { headers });
        responseCreateChat = responseCreateChat.data.data._id;

        OPENAI_CHAT_CREATION = responseCreateChat;

        await this.prisma.users.update({
          where: { id: user.id },
          data: { openai_chat_creation: OPENAI_CHAT_CREATION },
        });
      }
      
      const baseUrl = `${process.env.URL_CONEX_STAR}/gpt/send-message/${OPENAI_CHAT_CREATION}`;

      const response = await axios.post(
        baseUrl,
        {
          content: PROMPT,
          model: "gpt-4-1106-preview"
        },
        { headers }
      );

      let data = response.data.data.updatedChat.messages;

      data.sort((a, b) => {
        const dateA = new Date(a.date_create).getTime();
        const dateB = new Date(b.date_create).getTime();
        return dateB - dateA;
      });
      action = JSON.parse(data[0].content);
    }
    
    let messageSend = "I'm sorry, but I'm currently set up to allow you to create a L1, a Wallet, a Transaction, query a transaction, Save Funds, Stake Funds, Swap Tokens, Buy Cryptocurrency, Create contract, Explain contract. I'm not configured to perform any other actions.";
    let extra: any = {};

    switch(action?.operation){
      case "L1":
        messageSend = action?.error ? action?.error : `Please enter:\n\n
          Name L1 \n
          Token Name L1 \n
          Token Symbol L1 \n
        `;

        nameL1 = action?.data?.nameL1 ? action?.data?.nameL1 : nameL1;
        tokenNameL1 = action?.data?.tokenNameL1 ? action?.data?.tokenNameL1 : tokenNameL1;
        tokenSymbolL1 = action?.data?.tokenSymbolL1 ? action?.data?.tokenSymbolL1 : tokenSymbolL1;

        if(nameL1&&tokenNameL1&&tokenSymbolL1){
          const baseChainID = 7687419;
          const randomNum = Math.random().toString().slice(2, 6).padStart(4, "0");
          const finalChainID = (baseChainID.toString() + randomNum).slice(0, 8);

          let data = JSON.stringify({
            "initialUser": "0x23543Ef3aabc52975339b095ff6Cf0DDe81a53BC",
            "name": nameL1,
            "tokenName": tokenNameL1,
            "symbol": tokenSymbolL1,
            "chainID": Number(finalChainID),
            "precompiles": {
              "deployerAllowList": false,
              "txAllowList": false,
              "nativeMinter": true
            }
          });
          
          let config = {
            method: 'POST',
            maxBodyLength: Infinity,
            url: 'https://l1s.gogopool.com/api/subnet',
            headers: { 
              'accept': 'application/json, text/plain, */*', 
              'accept-language': 'es-CO,es;q=0.9,en-US;q=0.8,en;q=0.7', 
              'baggage': 'sentry-environment=vercel-production,sentry-release=00ec4e13afca127cb48e2070f5b1a679e1724071,sentry-public_key=b31a3e7422042dd03f5874ff9fc58406,sentry-trace_id=09942777d7984eedab03a5407c40034c,sentry-replay_id=d497927438d24478a0c174c9338f8f00,sentry-sample_rate=1,sentry-sampled=true', 
              'content-type': 'application/json', 
              'cookie': 'crisp-client%2Fsession%2Ffae8388c-6cfc-42c6-813a-38e5b5889aac=session_5e8c691c-881b-4893-a996-31b5bead03f7; __Host-authjs.csrf-token=a861bb9882c4a7de626ae4460cd7f38c3d1e9510dc2e528867b395ad76ed7bc6%7C82048d1846b4ff97d900af10bf00ad68ebbd6acc0ffb582a377f812e5a0f997e; __Secure-authjs.callback-url=https%3A%2F%2Fl1s.gogopool.com; __Secure-authjs.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoicmhhSXFPVHFtby16SmoyYVRyeXJpVTY5NWtkSHlidWt2SE81bDVzM2xoZWZ3aGNfV2RTS0VwQ2dycENvSW9RMkNSb3RNb3ZKd3BqSzZfZXU5bEh6dGcifQ..DVpgPgPAPjT1pUN7tHWoWg.UNGFat0wGxeY-XsExM-73T3jRCausaes-hCsqU6p4-cVtaDlSJJQyZIFMxdmB3HnGnuCuxulf-Z0HpTQ5mDU5nE9yZPSmLH4vNxiT7NlUOYIMn38uPDM1MWgti5_Lq5_f8c1HHr_Vfgk685kSmQVE61dwMks7-qX69mEGXBbQLE4l9mjq-m7dgzXIyyyw-fj1dFBUFubgZT8VesaBcZ0EmMZedJK4pT26kHw0JdTImxH_EHixUx-q6izTi8yitCc3p7fE0fH-mvdQhNBadluyF9wEijRDpFadZ93VTec4TXT2mlYFaNcz8yJ13uvlATIHq8fwPzquq8luapXK7YtjeM04xr66nosPomUZYdnXBSiw-HRhRnXY88-LxqqJ3mF-RCLMIhdcxfAgIfNXu11jxeLyHsskQnufA9Umtg8HuIJ1iZakTPvcXSqpCkLxgtxLp_R3jMRoOfaX0NfTpyj6A1zRo4eeuO0j7z6icJW2-AarZhrpzXfLD25yeTbi-ZBmJkFlcMZDvLuEX8AAgcL12flDp2wkIXxEwN4KiGi3RRxsjImt7uaB_qz-fz0SCr9tmJQ-iKzxf5eflhoTSq3ZkDVfmcxwLxxJVW_5uwRy8oT-HVpAlQHULgK0h9KWKSBTsVkC1-J6F67g9WgwZcquxoiJKYVdIxw8eSWL9Zh1mybqsBZepdOpaeaSFBRB0kiRrYksrr26Cicc9ics2Ylsq3AWSJRuG9Dt9_2zvq05-g.gfN2apnZuucVsThu5WbpRd-I3IvehZHT9CpWROYd5AI', 
              'origin': 'https://l1s.gogopool.com', 
              'priority': 'u=1, i', 
              'referer': 'https://l1s.gogopool.com/launcher/deploy', 
              'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"', 
              'sec-ch-ua-mobile': '?0', 
              'sec-ch-ua-platform': '"Windows"', 
              'sec-fetch-dest': 'empty', 
              'sec-fetch-mode': 'cors', 
              'sec-fetch-site': 'same-origin', 
              'sentry-trace': '09942777d7984eedab03a5407c40034c-8479620df1a20a87-1', 
              'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
            },
            data : data
          };
          
          try {
            const response = await axios(config);
            extra = response.data;
            messageSend = `L1 ${nameL1} was created by gogopool!\n\n
              <b>blockchain_name</b>: ${extra.blockchain_name}\n\n
              <b>subnet_id</b>: ${extra.subnet_id}\n\n
              <b>blockchain_id</b>: ${extra.blockchain_id}\n\n
              <b>owner_addr</b>: ${extra.owner_addr}\n\n
              <b>vm_id</b>: ${extra.vm_id}\n\n
              <b>token_symbol</b>: ${extra.token_symbol}\n\n
              <b>token_name</b>: ${extra.token_name}\n\n
              <b>deployer_allow_list</b>: ${extra.deployer_allow_list}\n\n
              <b>tx_allow_list</b>: ${extra.tx_allow_list}\n\n
              <b>native_minter</b>: ${extra.native_minter}\n\n
              <b>network</b>: ${extra.network}\n\n
              <b>evm_chain_id</b>: ${extra.evm_chain_id}\n\n\n\n
              <b>URL EXPLORER</b>: <a href='https://devnet.l1launcher.com/ext/bc/${extra.subnet_id}/rpc' target='_BLANK'>https://devnet.l1launcher.com/ext/bc/${extra.subnet_id}/rpc</a>\n\n
              <b>URL RPC</b>: <a href='https://explorer.l1launcher.com/?rpc=https://devnet.l1launcher.com/ext/bc/${extra.subnet_id}/rpc' target='_BLANK'>https://explorer.l1launcher.com/?rpc=https://devnet.l1launcher.com/ext/bc/${extra.subnet_id}/rpc</a>\n\n
            `;
          } catch (error) {
            console.log('error');
            console.log(error.message);
            messageSend = `Error has occurred when create L1 ${nameL1}`;
          }
        }  
      break;
      case "WALLET":
        let xpub_main_avalanche_wallet = user.xpub_main_avalanche_wallet;
        let mnemonic_main_avalanche_wallet = user.mnemonic_main_avalanche_wallet;
        let created_address_avalanche_wallet = user.created_address_avalanche_wallet;

        if(!xpub_main_avalanche_wallet&&!mnemonic_main_avalanche_wallet&&!created_address_avalanche_wallet){
          const responseMainWalletAvalanche = await axios.get('https://api.tatum.io/v3/avalanche/wallet', {
            headers: {
              'Authorization': `Bearer ${process.env.API_KEY_TATUM}`,
              'Content-Type': 'application/json'
            }
          });

          xpub_main_avalanche_wallet = responseMainWalletAvalanche.data.xpub;
          mnemonic_main_avalanche_wallet = responseMainWalletAvalanche.data.mnemonic;
          
          const responseWalletAvalanche = await axios.get(`https://api.tatum.io/v3/avalanche/address/${xpub_main_avalanche_wallet}/0`, {
            headers: {
              'Authorization': `Bearer ${process.env.API_KEY_TATUM}`,
              'Content-Type': 'application/json'
            }
          });

          created_address_avalanche_wallet = responseWalletAvalanche.data.address;

          await this.prisma.users.update({
            where: { id: user.id },
            data: { 
              xpub_main_avalanche_wallet, 
              mnemonic_main_avalanche_wallet, 
              created_address_avalanche_wallet
            },
          });
        }
        
        const responsePrivWalletAvalanche = await axios.post(`https://api.tatum.io/v3/avalanche/wallet/priv`,{index: 0, mnemonic: mnemonic_main_avalanche_wallet}, {
          headers: {
            'Authorization': `Bearer ${process.env.API_KEY_TATUM}`,
            'Content-Type': 'application/json'
          }
        });

        messageSend = `The Avalanche account address from extended public key was created! \n\n
          XPUB: ${xpub_main_avalanche_wallet} \n
          MNEMONIC: ${mnemonic_main_avalanche_wallet} \n
          ADDRESS: ${created_address_avalanche_wallet} \n
          XPRIV: ${responsePrivWalletAvalanche.data.key} \n\n

          Store your wallet keys and backup information in a secure location: Consider a dedicated hardware wallet, a secure password manager, or another safe offline method. \n
          Do not share or save sensitive information in chats or unencrypted files: This includes private keys, recovery phrases, and passwords. \n
          Avoid sharing your information with others: No official service provider will ever ask for your private keys. \n
        `;
        
        extra = {
          xpub: xpub_main_avalanche_wallet,
          xpriv: responsePrivWalletAvalanche.data.key,
          mnemonic: mnemonic_main_avalanche_wallet,
          address: created_address_avalanche_wallet
        };
      break;
      case "TX":
        messageSend = action?.error ? action?.error : `Please enter:\n\n
        To wallet address \n
        Amount to send \n
        From private key \n
        `;
        
        toAddress = action?.data?.addressTo ? action?.data?.addressTo : toAddress;
        amountToSend = action?.data?.amountTo ? action?.data?.amountTo : amountToSend;
        let tokenToTransfer = action?.data?.tokenToTransfer;

        if(toAddress&&amountToSend&&tokenToTransfer){
          try{
            const responseTXAvalanche = await axios.post(`https://api.brianknows.org/api/v0/agent/transaction`, {
              prompt: `I want to transfer ${amountToSend} ${tokenToTransfer} to ${toAddress}`,
              address: toAddress,
              chainId: '43114'
            }, {
              headers: {
                'X-Brian-Api-Key': `${process.env.BRIAN_KNOWS_API_KEY}`,
                'Content-Type': 'application/json'
              }
            });
            extra = responseTXAvalanche.data;
            messageSend = `Transaction was generate with brianknows.`;
          }catch(error){
            messageSend = (error?.response?.data?.message||'')+" "+(error?.response?.data?.cause||'');
          }
        }

        /*if(toAddress&&amountToSend&&fromPrivateKey){
          try{
            const responseTXAvalanche = await axios.post(`https://api.tatum.io/v3/avalanche/transaction`, {
              currency: 'AVAX',
              amount: amountToSend,
              fromPrivateKey,
              to: toAddress
            }, {
              headers: {
                'Authorization': `Bearer ${process.env.API_KEY_TATUM}`,
                'Content-Type': 'application/json'
              }
            });
            extra = responseTXAvalanche.data;
            messageSend = `Transaction was sent! \n\n
              Transaction Hash: ${extra.TransactionHash} \n
              URL DETAILS: <a href="https://snowtrace.io/tx/${extra.TransactionHash}" target="_BLANK">https://snowtrace.io/tx/${extra.TransactionHash}</a>`;
          }catch(error){
            messageSend = (error?.response?.data?.message||'')+" "+(error?.response?.data?.cause||'');
          }
        }*/
      break;
      case "QUERY_TX":
        messageSend = action?.error ? action?.error : "Please enter the hash transaction";
        hash = action?.data?.hash ? action?.data?.hash : hash;

        if(hash){
          try{
            const responseQueryTXAvalanche = await axios.get(`https://api.tatum.io/v3/avalanche/transaction/${hash}`, {
              headers: {
                'Authorization': `Bearer ${process.env.API_KEY_TATUM}`,
                'Content-Type': 'application/json'
              }
            });
            extra = responseQueryTXAvalanche.data;
            messageSend = `
              Blockchain: C-Chain (${extra.chainId}) \n
              Transaction Hash: ${extra.transactionHash} \n
              Status: ${extra.status ? 'Success' : 'Failure'} \n
              Block: ${extra.blockNumber} \n
              From: ${extra.from} \n
              To: ${extra.to} \n
              URL DETAILS: <a href="https://snowtrace.io/tx/${hash}" taget="_BLANK">https://snowtrace.io/tx/${hash}</a>
            `;
          }catch(error){
            messageSend = (error?.response?.data?.message||'')+" Remember only query transactions on Avalanche C-Chain";
          }
        }
      break;
      case "STAKING_FUNDS":
        messageSend = action?.error && !Number(action?.data?.amountTo) ? action?.error : `Confirm your stake ${action?.data?.amountTo} AVAX with lending pool aave v2`;
        let amountToStaking = action?.data?.amountTo ? action?.data?.amountTo : 0;

        if(amountToStaking){
          extra = action?.data;
        }
      break;
      case "SAVING_FUNDS":
        messageSend = action?.error && !Number(action?.data?.amountTo) ? action?.error : `Confirm your saving ${action?.data?.amountTo} AVAX  with lending pool aave v2`;
        let amountToSaving = action?.data?.amountTo ? action?.data?.amountTo : 0;

        if(amountToSaving){
          extra = action?.data;
        }
      break;
      case "SWAP":
        let tokenFrom = action?.data?.tokenFrom ? action?.data?.tokenFrom : false;
        let tokenFromSymbol = action?.data?.tokenFromSymbol ? action?.data?.tokenFromSymbol : false;
        let amountTo = action?.data?.amountTo ? action?.data?.amountTo : false;
        let tokenTo = action?.data?.tokenTo ? action?.data?.tokenTo : false;
        let tokenToSymbol = action?.data?.tokenToSymbol ? action?.data?.tokenToSymbol : false;
        messageSend = action?.error ? action?.error : `Confirm your swap ${amountTo} ${tokenFromSymbol} to ${tokenToSymbol} with Trader Joe Contract`;

        if(tokenFrom&&amountTo&&tokenTo&&tokenFromSymbol&&tokenToSymbol){
          extra = action?.data;
        }
      break;
      case "CREATE_CONTRACT":
        messageSend = action?.error ? action?.error : "Please enter the contract functionalities specifications";
        let contractSpecifications = action?.data?.contractSpecifications ? action?.data?.contractSpecifications : "";

        if(contractSpecifications){
          try{
            const responseSmartcontract = await axios.post(`https://api.brianknows.org/api/v0/agent/smart-contract`, {
              prompt: contractSpecifications
            }, {
              headers: {
                'X-Brian-Api-Key': `${process.env.BRIAN_KNOWS_API_KEY}`,
                'Content-Type': 'application/json'
              }
            });
            extra = responseSmartcontract.data;
            messageSend = `Smartcontract solidity code was generate with brianknows. \n\n\n\n\n ${extra.result.contract}`;
          }catch(error){
            messageSend = (error?.response?.data?.message||'')+" "+(error?.response?.data?.cause||'');
          }
        }
      break;
      case "EXPLAIN_CONTRACT":
        messageSend = action?.error ? action?.error : "Please enter the contract code";
        let contractCode = action?.data?.contractCode ? action?.data?.contractCode : "";

        if(contractCode){
          try{
            const responseSmartcontract = await axios.post(`https://api.brianknows.org/api/v0/utils/explain`, {
              code: contractCode
            }, {
              headers: {
                'X-Brian-Api-Key': `${process.env.BRIAN_KNOWS_API_KEY}`,
                'Content-Type': 'application/json'
              }
            });
            extra = responseSmartcontract.data;
            messageSend = `Smartcontract solidity code was explain with brianknows. \n\n\n\n\n ${extra.result}`;
          }catch(error){
            messageSend = (error?.response?.data?.message||'')+" "+(error?.response?.data?.cause||'');
          }
        }
      break;
      case "SWAP":
      case "BUY_CRYPTO":
        messageSend = "Let's do it";
      break;
    }

    return {success: true, data: messageSend, action, extra};
  }
  
  async createAvalancheOperationBrianknows(
    token: string, 
    message: string, 
    actionUser: string, 
    toAddress: string,
    contractName: string,
    network: string
  ) {
    const decoded = this.jwtService.verify(token);
    
    const user = await this.prisma.users.findUnique({ where: { id: Number(decoded.id) } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let action = actionUser;

    let messageSend;
    let extra: any = {};

    switch(action){
      case "TX":
        if(toAddress&&message){
          try{
            const responseTXAvalanche = await axios.post(`https://api.brianknows.org/api/v0/agent/transaction`, {
              prompt: message,
              address: toAddress,
              chainId: (network=='fuji'?'43113':'43114')//AVALANCHE
            }, {
              headers: {
                'X-Brian-Api-Key': `${process.env.BRIAN_KNOWS_API_KEY}`,
                'Content-Type': 'application/json'
              }
            });
            extra = responseTXAvalanche.data;
            messageSend = `Transaction was generate with brianknows.`;
          }catch(error){
            messageSend = (error?.response?.data?.message||'')+" "+(error?.response?.data?.cause||'');
          }
        }
      break;
      case "CONTRACT":
        if(message){
          try{
            const responseSmartcontract = await axios.post(`https://api.brianknows.org/api/v0/agent/smart-contract`, {
              prompt: message
            }, {
              headers: {
                'X-Brian-Api-Key': `${process.env.BRIAN_KNOWS_API_KEY}`,
                'Content-Type': 'application/json'
              }
            });
            extra = responseSmartcontract.data;
            messageSend = `Smartcontract solidity code was generate with brianknows.`;
          }catch(error){
            messageSend = (error?.response?.data?.message||'')+" "+(error?.response?.data?.cause||'');
          }
        }
      break;
      case "COMPILE":
        if(message&&contractName){
          try{
            const responseSmartcontract = await axios.post(`https://api.brianknows.org/api/v0/utils/compile`, {
              code: message,
              contractName
            }, {
              headers: {
                'X-Brian-Api-Key': `${process.env.BRIAN_KNOWS_API_KEY}`,
                'Content-Type': 'application/json'
              }
            });
            extra = responseSmartcontract.data;
            messageSend = `Smartcontract solidity code was compile with brianknows.`;
          }catch(error){
            messageSend = (error?.response?.data?.message||'')+" "+(error?.response?.data?.cause||'');
          }
        }
      break;
      case "EXPLAIN":
        if(message){
          try{
            const responseSmartcontract = await axios.post(`https://api.brianknows.org/api/v0/utils/explain`, {
              code: message
            }, {
              headers: {
                'X-Brian-Api-Key': `${process.env.BRIAN_KNOWS_API_KEY}`,
                'Content-Type': 'application/json'
              }
            });
            extra = responseSmartcontract.data;
            messageSend = `Solidity code was explained with brianknows.`;
          }catch(error){
            messageSend = (error?.response?.data?.message||'')+" "+(error?.response?.data?.cause||'');
          }
        }
      break;
    }

    return {success: true, data: messageSend, action, extra};
  }

  async getTransactions(token: string, origin: string) {
    try {
      const decoded = this.jwtService.verify(token);
      
      const user = await this.prisma.users.findUnique({ where: { id: Number(decoded.id) } });

      if (!user) {
        throw new NotFoundException('User not found');
      }
      

      let urlGet = `https://api.routescan.io/v2/network/testnet/evm/all/address/${user.wallet_address}/transactions?ecosystem=avalanche&includedChainIds=43113&sort=desc&limit=250`;
      
      if(origin=="mainnet"){
        urlGet = `https://api.routescan.io/v2/network/mainnet/evm/all/address/${user.wallet_address}/transactions?ecosystem=avalanche&includedChainIds=43114&sort=desc&limit=250`;
      }

      const response = await axios.get(urlGet);
      const transactions = response.data.items;

      let txs = transactions.map(tx => {
        let avaxValue:any = parseFloat(tx.value) / Math.pow(10, 18);
            avaxValue = avaxValue.toFixed(4);
        
        return {
          amount: avaxValue,
          network: (origin=="mainnet"?"C-Chain":"Fuji-Testnet"),
          type: tx.from === user.wallet_address ? 'out' : 'in',
          hash: tx.id,
        };
      });
      
      return {
        success: true,
        data: txs
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Error fetching transactions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
