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
      {}
    </div>
  );
}
