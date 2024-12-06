import { useState, useRef, useEffect } from 'react';
import Navbar from '../Components/Navbar';
import { Chat } from '../Components/chat/Chat';

const Card = ({ children, className, ...props }) => (
  <div className={`rounded-2xl ${className}`} {...props}>
    {children}
  </div>
);

const Button = ({ children, className, ...props }) => (
  <button
    className={`px-4 py-2 rounded-lg transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default function CreateTransaction() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const [showPrompts, setShowPrompts] = useState(false);
  const chatRef = useRef(null);

  const prompts = [
    {
      prompt: 'Create L1',
      image: '/images/brands/gogoPool.webp',
      text: 'Create L1 with GogoPool',
    },
    {
      prompt: 'Create Wallet',
      image: '/images/brands/javaScript.png',
      text: 'Create Wallet with JavaScript',
    },
    {
      prompt: 'Query wallet transactions',
      image: '/images/brands/javaScript.png',
      text: 'Query Wallet Transactions with JavaScript',
    },
    {
      prompt: 'Make Transaction',
      image: '/images/brands/javaScript.png',
      text: 'Make Transaction with Javascript',
    },
    {
      prompt: 'Query Transaction',
      image: '/images/brands/javaScript.png',
      text: 'Query Transaction with JavaScript',
    },
    {
      prompt: 'Save Funds',
      image: '/images/brands/brian_logo.png',
      text: 'Save Funds with BrianKnows',
    },
    {
      prompt: 'Stake Funds',
      image: '/images/brands/aave-logo.jpg',
      text: 'Stake Funds with BrianKnows',
    },
    {
      prompt: 'Swap Tokens',
      image: '/images/brands/brian_logo.png',
      text: 'Swap Tokens with Joe',
    },
    {
      prompt: 'Mint NFT Asset',
      image: '/images/brands/crossmint.jpg',
      text: 'Mint NFT Asset with Crossmint',
    },
    {
      prompt: 'Buy Cryptocurrency',
      image: '/images/brands/meld.png',
      text: 'Buy Cryptocurrency with Meld',
    },
    {
      prompt: 'Create Contract',
      image: '/images/brands/brian_logo.png',
      text: 'Create Contract with BrianKnows',
    },
    {
      prompt: 'Explain Contract',
      image: '/images/brands/brian_logo.png',
      text: 'Explain Contract with BrianKnows',
    },
  ];

  const handlePromptSelect = (prompt) => {
    if (chatRef.current) {
      chatRef.current.handleSendMessage(prompt);
      setShowPrompts(false);
    }
  };

  const handleNewMessages = (messages) => {
    if(firstLoad==false) setShowPrompts(messages.length <= 1);
  };

  return (
    <div className="min-h-screen bg-[#0D0A14] text-white pb-[10rem]">
      <Navbar />
      <Chat
        ref={chatRef}
        type="creation"
        firstLoad={firstLoad}
        initOper={(messages)=>{
          if(messages.length<=6){ 
            setShowPrompts(true);
            setFirstLoad(false);
          }
        }}
        initialMessageBot={'Hello, I am your avalcheck virtual assistant'}
        onMessagesChange={handleNewMessages}
        setShowPrompts={()=>{
          setShowPrompts(true);
          setFirstLoad(true);
        }}
        setHidePrompts={()=>{
          setShowPrompts(false);
          setFirstLoad(false);
        }}
      />
      <div className="w-full max-w-4xl mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-3">
          {showPrompts &&
            prompts.map(({ prompt, image, text }, index) => (
              <button
                key={index}
                onClick={() => handlePromptSelect(prompt)}
                className="flex items-center px-4 py-2 bg-gradient-to-b from-[#3d143d88] to-[#2e0f3185] 
                  border-[#672f4c91] border-2 rounded-lg
                   hover:opacity-90 transition-all duration-200
                   whitespace-nowrap 
                   hover:border-[#672f4c] hover:shadow-lg hover:shadow-[#672f4c50] 
                   hover:from-[#3d143dcc] hover:to-[#2e0f31dc]"
              >
                <img
                  src={image}
                  alt={`Logo for ${prompt}`}
                  className="w-6 h-6 rounded-full mr-2"
                />
                <p className="text-[#d4d3d3] text-sm md:text-base ">{text}</p>
                <div className="text-[#672f4c00] text-sm md:text-base hidden ">
                  {prompt}
                </div>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
