import { useState } from 'react';
import { Mic, ArrowUp, Phone } from 'lucide-react';

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

export default function ViewTransaction() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Sample data for the chart

  return (
    <div className="min-h-screen bg-[#0D0A14] text-white pb-[10rem]">
      {/* Header */}
      <Navbar></Navbar>
      <Chat
        type="transactions"
        initialMessageBot={'Hello, I am your avalcheck virtual assistant'}
      ></Chat>
      {/* Main Content */}
      {/* <main className="mx-auto max-w-4xl px-4 py-8 mt-10">
        <div className="mb-6 flex justify-end">
          <Card className="bg-gradient-to-b from-[#3d143d] to-[#2e0f31] p-4 text-gray-200 border-[#672f4c] border-2">
            Give me the transaction history for last month?
          </Card>
        </div>

        <div className="flex gap-4 items-start">
          <img
            src="/Home/icon.svg"
            alt="AI Assistant"
            width={40}
            height={40}
            className="rounded-xl"
          />
          <Card className="w-full">
            <ResponseGraficTranstaction></ResponseGraficTranstaction>
          </Card>
        </div>

        <div className="fixed bottom-0 left-4 right-4 mx-auto max-w-6xl">
          <div className="mx-auto mt-16 px-20 max-w-8xl">
            <div
              className="flex items-center gap-4 px-6 py-4 bg-black"
              style={{
                backgroundImage: "url('/Home/chatwallpaper.svg')",
                backgroundSize: '100%',
                backgroundRepeat: 'no-repeat',
                boxShadow: 'inset 0px -69px 50px -70px rgba(0, 0, 0, 1)',
              }}
            >
              <Mic className="h-6 w-6 text-gray-400 cursor-pointer" />
              <input
                type="text"
                placeholder="Ask me anything..."
                className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
              />
              <button className="rounded-full bg-[#16071e] p-2">
                <img src="/Home/chat_icon2.png" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main> */}
    </div>
  );
}
