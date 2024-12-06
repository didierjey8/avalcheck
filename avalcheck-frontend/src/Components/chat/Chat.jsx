import React from 'react';
import { Mic, ArrowUp, Phone } from 'lucide-react';
import {
  useEffect,
  useState,
  useContext,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import chatService from '../../Services/ChatService';
import ChatModules from './ChatModules';
import { data } from 'autoprefixer';
import { ToastContainer, toast } from 'react-toastify';
import { ConfirmToast } from 'react-confirm-toast';
import { ethers } from 'ethers';
import 'react-toastify/dist/ReactToastify.css';

import { AuthContext } from '../../Context/context';

import { useSendTransaction, useWriteContract, useAccount } from 'wagmi';

import { useAppKit } from '@reown/appkit/react';
import { id } from 'ethers/lib/utils';

const chatServiceInstance = new chatService();

const Card = ({ children, className, ...props }) => (
  <div className={`rounded-2xl ${className}`} {...props}>
    {children}
  </div>
);

const ChatInput = ({
  setConfirmDeleteChat,
  firstLoad,
  handleSendMessage,
  disabled,
  showPrompts,
  setShowPrompts,
  messages,
  scrollToBottom
}) => {
  const [message, setMessage] = useState('');
  const inputChat = useRef(null);

  //funcion para enviar el mensaje a presionar enter desde el teclado
  const sendMessage = (e) => {
    if (e.key === 'Enter' && handleSendMessage) {
      handleSendMessage(e.target.value);
      setMessage('');
    }
  };

  // useEffect que escucha el evento de presionar enter
  useEffect(() => {
    document.addEventListener('keydown', sendMessage);
    return () => {
      document.removeEventListener('keydown', sendMessage);
    };
  }, []);

  useEffect(() => {
    if (!disabled) inputChat.current.focus();
  }, [disabled]);

  return (
    <div className="fixed bottom-0 left-2 right-2 sm:left-4 sm:right-4 mx-auto max-w-full sm:max-w-6xl">
      <div className="mx-auto mt-6 sm:mt-0 px-4 sm:px-20 max-w-full sm:max-w-8xl">
        <div className="flex space-x-4">
          {messages?.length >= 2 && setShowPrompts && !showPrompts && (
            <button
              onClick={() => {
                setShowPrompts(true);
                setTimeout(() => {
                  scrollToBottom();
                }, 100);
              }}
              className="flex items-center px-4 py-2 bg-gradient-to-b from-[#3d143d88] to-[#2e0f3185] 
                  border-[#672f4c91] border-2 rounded-lg
                    hover:opacity-90 transition-all duration-200
                    whitespace-nowrap 
                    hover:border-[#672f4c] hover:shadow-lg hover:shadow-[#672f4c50] 
                    hover:from-[#3d143dcc] hover:to-[#2e0f31dc]
                    mx-auto mb-2.5"
            >
              <img
                src={'/images/brands/brian_logo.png'}
                alt={`Logo for Brianknows`}
                className="w-6 h-6 rounded-full mr-2"
              />
              <p className="text-[#d4d3d3] text-sm md:text-base ">
                {'Show me suggested actions'}
              </p>
            </button>
          )}
          {messages?.length >= 2 && setShowPrompts && (
            <button
              onClick={() => setConfirmDeleteChat(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-b from-[#3d143d88] to-[#2e0f3185] 
                  border-[#672f4c91] border-2 rounded-lg
                    hover:opacity-90 transition-all duration-200
                    whitespace-nowrap 
                    hover:border-[#672f4c] hover:shadow-lg hover:shadow-[#672f4c50] 
                    hover:from-[#3d143dcc] hover:to-[#2e0f31dc]
                    mb-2.5"
            >
              <img
                src={'/images/brands/deleteIcon.png'}
                alt={`Logo for Brianknows`}
                className="w-6 h-6 rounded-full mr-2"
              />
              <p className="text-[#d4d3d3] text-sm md:text-base ">
                {'Delete history chat'}
              </p>
            </button>
          )}
        </div>
        <div
          className="flex items-center gap-2 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 bg-black"
          style={{
            backgroundImage: "url('/Home/chatwallpaper.svg')",
            backgroundSize: '100%',
            backgroundRepeat: 'no-repeat',
            boxShadow: 'inset 0px -69px 50px -70px rgba(0, 0, 0, 1)',
          }}
        >
          {/* <Mic className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 cursor-pointer" /> */}
          <input
            value={message}
            disabled={disabled}
            ref={inputChat}
            onChange={(e) => setMessage(e.target.value)}
            type="text"
            placeholder="Ask me anything..."
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-sm sm:text-base"
          />
          <button
            disabled={disabled}
            className="rounded-full bg-[#16071e] p-2 sm:p-3"
            onClick={() => handleSendMessage(message)}
          >
            <img src="/Home/chat_icon2.png" className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ChatMessages = ({ messages, showModules, onMessagesChange }) => {
  useEffect(() => {
    if (onMessagesChange) {
      onMessagesChange(messages);
    }
  }, [messages, onMessagesChange]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 mt-10 w-full">
      {messages.map((message, index) => {
        if (message?.sender === 'user') {
          return (
            <div key={index} className="mb-6 flex justify-end">
              <Card className="bg-gradient-to-b from-[#3d143d] to-[#2e0f31] p-4 text-gray-200 border-[#672f4c] border-2">
                <p className="whitespace-normal break-words">
                  {message.message}
                </p>
              </Card>
            </div>
          );
        }

        if (message?.sender === 'bot') {
          const shouldShowModule = showModules.id == message.id;

          return (
            <div key={index} className="mb-6 flex gap-4 items-start">
              <img
                src="/Home/icon.svg"
                alt="AI Assistant"
                width={40}
                height={40}
                className="rounded-xl"
              />
              <Card className="bg-[#20152a] p-4 text-gray-200 border-[#261d2e] border-2 w-full">
                <div
                  className="whitespace-pre-line break-words"
                  dangerouslySetInnerHTML={{ __html: message.message }}
                ></div>
                {message.module && (
                  <ChatModules
                    type={message.module.type}
                    data={message.module.data}
                  />
                )}
              </Card>
            </div>
          );
        }

        if (message?.sender === 'bot-loading') {
          return (
            <div key={index} className="mb-6 flex gap-4">
              <img
                src="/Home/icon.svg"
                alt="AI Assistant"
                width={40}
                height={40}
                className="rounded-xl"
              />
              <Card className="p-4 text-gray-200">
                <img
                  src="/Home/loadingChat.svg"
                  className="w-10 h-10"
                  alt="Loading"
                />
              </Card>
            </div>
          );
        }

        return null;
      })}
    </main>
  );
};

const Chat = forwardRef(
  (
    {
      type,
      chatInitialData,
      initialMessageBot,
      onMessagesChange,
      showPrompts,
      setShowPrompts,
      setHidePrompts,
      initOper,
      firstLoad,
    },
    ref
  ) => {
    const fileInputRef = useRef(null);
    const containerRef = useRef(null);
    const { sendTransaction } = useSendTransaction();
    const { address: accountConnected } = useAccount();
    const { writeContract } = useWriteContract();
    const { token } = useContext(AuthContext);

    const [messages, setmessages] = useState([]);
    const [confirmDeleteChat, setConfirmDeleteChat] = useState(false);
    const [loadingMessages, setloadingMessages] = useState(false);
    const [nftToCreate, setNftToCreate] = useState(false);

    const [showModulesChat, setshowModulesChat] = useState({
      id: 0,
      show: false,
      type: '',
      data: {},
    });

    const modal = useAppKit();

    // funccion para hacer scroll al final de la pagina
    const scrollToBottom = () => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth',
      });
    };

    const handleSendMessage = (message) => {
      //el mensaje no se guarda, solo se reemplaza
      if (message === '') {
        return;
      }

      if (setHidePrompts) setHidePrompts(true);

      const newMessage = [
        {
          id: messages.length + 1,
          message: message,
          sender: 'user',
        },
        {
          id: messages.length + 2,
          message: '...',
          sender: 'bot-loading',
        },
      ];

      setmessages((prevMessages) => [
        ...prevMessages,
        newMessage[0],
        newMessage[1],
      ]);

      setTimeout(() => {
        scrollToBottom();
      }, 100);

      if (type === 'surveys') {
        sendMessageWithSurveys(message);
      }
      if (type === 'certificate') {
        sendMessageWithGetCertified(message);
      }
      if (type === 'creation') {
        sendMessageCreation(message);
      }
      if (type === 'transactions') {
        sendMessageTransactions(message);
      }

      return;
    };

    //funcion para enviar el mensaje diferenciados por tipo
    const sendMessageWithSurveys = (message) => {
      chatServiceInstance
        .sendMessage({ data: { message: message, origin: 'surveys' }, token })
        .then((response) => {
          const newResponse = {
            id: messages.length + 1,
            message: response.data.data,
            sender: 'bot',
          };

          if (response.data.surveys) {
            Object.assign(newResponse, {
              module: {
                show: true,
                data: response.data.surveys,
                type: 'surveys',
              },
            });
          }

          setmessages((prevMessages) => [
            ...prevMessages.slice(0, -1),
            newResponse,
          ]);
          setTimeout(() => {
            scrollToBottom();
          }, 100);
        })
        .catch((error) => {
          toast.error(`Algo salió mal - ${error.response.data.message}`);
          console.log(error);
        })
        .finally(() => {
          setloadingMessages(false);
        });
    };
    const sendMessageWithGetCertified = (message) => {
      chatServiceInstance
        .sendMessage({
          data: { message: message, origin: 'certificate', level: 'BASIC' },
          token,
        })
        .then((response) => {
          const newResponse = {
            id: messages.length + 1,
            message: response.data.data,
            sender: 'bot',
          };

          if (response.data.surveys) {
            Object.assign(newResponse, {
              module: {
                show: true,
                data: response.data.surveys,
                type: 'certified',
              },
            });
          }

          setmessages((prevMessages) => [
            ...prevMessages.slice(0, -1),
            newResponse,
          ]);
          setTimeout(() => {
            scrollToBottom();
          }, 100);
        })
        .catch((error) => {
          toast.error(`Algo salió mal - ${error.response.data.message}`);
          console.log(error);
        })
        .finally(() => {
          setloadingMessages(false);
        });
    };

    const sendMessageTransactions = (message) => {
      chatServiceInstance
        .sendMessageTransactions({
          data: { message: message },
          token,
        })
        .then((response) => {
          const newResponse = {
            id: messages.length + 1,
            message: '',
            sender: 'bot',
          };

          if (response.data.data) {
            Object.assign(newResponse, {
              module: {
                show: true,
                data: response.data.data,
                type: 'transactions',
              },
            });
          }

          setmessages((prevMessages) => [
            ...prevMessages.slice(0, -1),
            newResponse,
          ]);
          setTimeout(() => {
            scrollToBottom();
          }, 100);
        })
        .catch((error) => {
          toast.error(`Algo salió mal - ${error.response.data.message}`);
          console.log(error);
        })
        .finally(() => {
          setloadingMessages(false);
        });
    };
    //STAKING
    const aaveLendingPoolABI = [
      {
        inputs: [
          { internalType: 'address', name: 'asset', type: 'address' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
          { internalType: 'address', name: 'onBehalfOf', type: 'address' },
          { internalType: 'uint16', name: 'referralCode', type: 'uint16' },
        ],
        name: 'deposit',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
      },
    ];

    const wrapAvaxAddressToken = '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7';
    const lendingPoolAddress = '0x4F01AeD16D97E3aB5ab2B501154DC9bb0F1A5A2C';

    //SWAP
    const routerAddressSwapAvaxtoUSDT =
      '0x60aE616a2155Ee3d9A68541Ba4544862310933d4';
    const routerABISwapTokentoToken = [
      {
        inputs: [
          { internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
          { internalType: 'address[]', name: 'path', type: 'address[]' },
          { internalType: 'address', name: 'to', type: 'address' },
          { internalType: 'uint256', name: 'deadline', type: 'uint256' },
        ],
        name: 'swapExactAVAXForTokens',
        outputs: [
          { internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' },
        ],
        stateMutability: 'payable',
        type: 'function',
      },
      {
        inputs: [
          { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
          { internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
          { internalType: 'address[]', name: 'path', type: 'address[]' },
          { internalType: 'address', name: 'to', type: 'address' },
          { internalType: 'uint256', name: 'deadline', type: 'uint256' },
        ],
        name: 'swapExactTokensForTokens',
        outputs: [
          { internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ];

    const tokenABI = [
      {
        inputs: [
          { internalType: 'address', name: 'spender', type: 'address' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
        ],
        name: 'approve',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ];

    let firstMessage = true;

    const sendMessageCreation = (message) => {
      chatServiceInstance
        .sendMessageCreation({
          data: { message: message, firstMessage },
          token,
        })
        .then(async (response) => {
          const newResponse = {
            id: messages.length + 1,
            message: response.data.data,
            sender: 'bot',
          };

          firstMessage = false;

          setNftToCreate(false);

          switch (response.data.action.operation) {
            case 'WALLET':
              const wallet = await ethers.Wallet.createRandom();

              const address = wallet.address;

              const publicKeyHex = wallet.publicKey;

              const privateKeyHex = wallet.privateKey;

              const mnemonic = wallet.mnemonic.phrase;

              Object.assign(newResponse, {
                module: {
                  show: true,
                  data: {
                    address: address,
                    mnemonic: mnemonic,
                    xpriv: privateKeyHex,
                    xpub: publicKeyHex,
                  },
                  type: 'create_wallet',
                },
              });

              //setshowModulesChat();
              break;
            case 'TX':
              if (response.data.extra?.result) {
                let payload = response.data.extra?.result[0].data.steps[0];

                sendTransaction({
                  to: payload.to,
                  data: payload.data,
                  value: payload.value,
                  gasLimit: payload.gasLimit,
                });
              }
              break;
            case 'SWAP':
              //modal.open({ view: 'Swap' });
              if (response.data.extra?.tokenFrom) {
                await writeContract({
                  address: response.data.extra?.tokenFrom,
                  abi: tokenABI,
                  functionName: 'approve',
                  args: [
                    routerAddressSwapAvaxtoUSDT,
                    ethers.utils.parseUnits(
                      response.data.extra?.amountTo.toString(),
                      6
                    ),
                  ],
                });

                writeContract({
                  address: routerAddressSwapAvaxtoUSDT,
                  abi: routerABISwapTokentoToken,
                  functionName: 'swapExactTokensForAVAX',
                  args: [
                    ethers.utils.parseUnits(
                      response.data.extra?.amountTo.toString(),
                      6
                    ),
                    ethers.utils.parseUnits('0.01', 6),
                    [
                      response.data.extra?.tokenFrom,
                      response.data.extra?.tokenTo,
                    ],
                    accountConnected,
                    Math.floor(Date.now() / 1000) + 60 * 10, // Deadline (10 minutos)
                  ],
                });
              }
              break;
            case 'BUY_CRYPTO':
              modal.open({ view: 'OnRampProviders' });
              break;
            case 'STAKING_FUNDS':
            case 'SAVING_FUNDS':
              if (Number(response.data.extra?.amountTo)) {
                writeContract({
                  address: lendingPoolAddress,
                  abi: aaveLendingPoolABI,
                  functionName: 'deposit',
                  args: [
                    wrapAvaxAddressToken,
                    ethers.utils.parseUnits(
                      response.data.extra?.amountTo.toString(),
                      6
                    ),
                    accountConnected,
                    0,
                  ],
                });
              }
              break;
            case 'CREATE_NFT_UPLOAD':
              setNftToCreate(response.data.extra);
              break;
            case 'QUERY_TX_ADDRESS':
              if (
                response.data.extra &&
                response.data.action.data.addressQueryTx
              ) {
                Object.assign(newResponse, {
                  show: true,
                  module: {
                    show: true,
                    data: response.data.extra,
                    type: 'transactions',
                  },
                  type: 'transactions',
                });
              }
              console.log('newResponse');
              console.log(newResponse);
              break;
          }

          setmessages((prevMessages) => [
            ...prevMessages.slice(0, -1),
            newResponse,
          ]);
          setTimeout(() => {
            scrollToBottom();
          }, 100);
        })
        .catch((error) => {
          console.log(error);
          toast.error(`Algo salió mal - ${error.response.data.message}`);
        })
        .finally(() => {
          setloadingMessages(false);
        });
    };

    const readHistoryChat = async () => {
      const initialMessages = localStorage.getItem('initialMessage');
      if (initialMessages) {
        handleSendMessage(initialMessages);
        localStorage.removeItem('initialMessage');
      }

      let historyChat = await chatServiceInstance.readMessagesCreation({
        token,
      });
      historyChat = historyChat.data.data;

      if (initOper) initOper(historyChat);

      let historyChatFormated = [];

      if (historyChat.length) {
        historyChat.map((chat, posChat) => {
          chat.data = chat.data ? JSON.parse(chat.data) : {};
          if (chat.origin == 'USER') {
            historyChatFormated.push({
              id: messages.length + (posChat + 1),
              message: chat.message,
              sender: 'user',
            });
          } else if (chat.origin == 'BOT') {
            let newBotResponse = {
              id: messages.length + (posChat + 1),
              message: chat.data.data,
              sender: 'bot',
            };

            historyChatFormated.push(newBotResponse);

            switch (chat.data.action.operation) {
              case 'WALLET':
                Object.assign(newBotResponse, {
                  module: {
                    show: true,
                    data: {
                      address: '*****************',
                      mnemonic:
                        '*** *** *** *** *** *** *** *** *** *** *** ***',
                      xpriv: '*****************',
                      xpub: '*****************',
                    },
                    type: 'create_wallet',
                  },
                });
                break;
              case 'QUERY_TX_ADDRESS':
                if (chat.data.extra) {
                  Object.assign(newBotResponse, {
                    show: true,
                    module: {
                      show: true,
                      data: chat.data.extra,
                      type: 'transactions',
                    },
                    type: 'transactions',
                  });
                }
                break;
            }
          }
        });

        setmessages((prevMessages) => [
          prevMessages[0],
          ...historyChatFormated,
        ]);

        setTimeout(() => {
          if(type!="certificate") scrollToBottom();
        }, 100);
      }
    };

    useEffect(() => {
      readHistoryChat();
    }, []);

    useEffect(() => {
      if (type === 'certified_result') {
        setmessages([
          {
            id: 1,
            message: initialMessageBot,
            sender: 'bot',
            module: {
              show: true,
              type: type,
              data: chatInitialData,
            },
          },
        ]);
      }
    }, [type]);

    const [surveyInitChat, setsurveyInitChat] = useState(false);

    useEffect(() => {
      if (initialMessageBot && type !== 'certified_result') {
        setmessages([
          {
            id: 1,
            message: initialMessageBot,
            sender: 'bot',
          },
        ]);
      } else if (type !== 'certified_result') {
        setmessages([]);
      }

      if (type === 'surveys' && !surveyInitChat) {
        setsurveyInitChat(true);
        sendMessageWithSurveys('hi');
      }

      const handleClick = (event) => {
        if (event.target.classList.contains('upload-file-nft')) {
          event.preventDefault();
          fileInputRef.current.click();
        }
      };

      const container = containerRef.current;
      container?.addEventListener('click', handleClick);

      return () => {
        container?.removeEventListener('click', handleClick);
      };
    }, []);

    useImperativeHandle(ref, () => ({
      handleSendMessage,
    }));

    const handleFileChange = async (event) => {
      const files = event.target.files;

      if (files.length === 0) {
        fileInputRef.current.click();
        return;
      }

      const formData = new FormData();
      formData.append('message', JSON.stringify(nftToCreate));
      formData.append('imageToNFT', files[0]);
      formData.append('action', 'CREATE_NFT_UPLOAD');

      const newMessage = [
        {
          id: messages.length + 2,
          message: '...',
          sender: 'bot-loading',
        },
      ];

      setmessages((prevMessages) => [
        ...prevMessages.slice(0, -1),
        newMessage[0],
      ]);

      setTimeout(() => {
        scrollToBottom();
      }, 100);

      const response = await chatServiceInstance.sendMessageCreation({
        data: formData,
        token,
        contentType: 'multipart/form-data',
      });

      const newResponse = {
        id: messages.length + 1,
        message: response.data.data,
        sender: 'bot',
      };

      firstMessage = false;

      setNftToCreate(false);

      setmessages((prevMessages) => [
        ...prevMessages.slice(0, -1),
        newResponse,
      ]);
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    };

    const deleteHistoryChat = () => {
      chatServiceInstance.removeMessagesCreation({ token });

      setmessages([
        {
          id: 1,
          message: 'Hello, I am your avalcheck virtual assistant',
          sender: 'bot',
        },
      ]);
      setShowPrompts(true);
    };

    return (
      <div
        className="bg-[#0D0A14] text-white pb-[5rem] w-full"
        id="scroll"
        ref={containerRef}
      >
        <ToastContainer theme="dark" position="top-right" />
        <ConfirmToast
          customFunction={deleteHistoryChat}
          asModal={true}
          theme={'dark'}
          showCloseIcon={false}
          buttonYesText={'Yes'}
          toastText={'Do you want to delete your history chat?'}
          setShowConfirmToast={setConfirmDeleteChat}
          showConfirmToast={confirmDeleteChat}
        />
        <ChatMessages
          messages={messages}
          showModules={showModulesChat}
          onMessagesChange={onMessagesChange}
        ></ChatMessages>
        <ChatInput
          scrollToBottom={scrollToBottom}
          setConfirmDeleteChat={setConfirmDeleteChat}
          firstLoad={firstLoad}
          messages={messages}
          showPrompts={showPrompts}
          setShowPrompts={setShowPrompts}
          disabled={messages[messages.length - 1]?.message == '...'}
          handleSendMessage={handleSendMessage}
        ></ChatInput>
        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={(event) => handleFileChange(event)}
        />
      </div>
    );
  }
);

export { ChatInput, Chat };
