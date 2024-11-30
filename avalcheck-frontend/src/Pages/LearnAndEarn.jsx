import { useState } from 'react';
import Navbar from '../Components/Navbar';
import { Chat } from '../Components/chat/Chat';

export default function LearnAndEarn() {
  return (
    <div className="min-h-screen bg-[#0D0A14] text-white">
      <Navbar></Navbar>
      <Chat
        type="surveys"
        initialMessageBot={'Hello, I am your avalcheck virtual assistant'}
      ></Chat>
    </div>
  );
}
