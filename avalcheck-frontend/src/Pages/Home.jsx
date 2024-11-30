import { Mic } from 'lucide-react';
import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import AuthService from '../Services/AuthService';
import { ToastContainer, toast } from 'react-toastify';
import { AuthContext } from '../Context/context';

import { useAppKit } from '@reown/appkit/react';
import { ChatInput } from '../Components/chat/Chat';

const authServiceInstance = new AuthService();

const cardsQuestions = [
  {
    title: 'Learn & Earn',
    description: 'Expand Your Blockchain Knowledge & Earn Rewards',
    image: '/Home/icon_category1.png',
    link: '/LearnAndEarn',
  },
  {
    title: 'Get Certified',
    description: 'Take quizzes, earn certifications.',
    image: '/Home/icon_category2.png',
    link: '/GetCertified',
  },
  {
    title: 'View Transaction',
    description: 'Monitor Your Wallet Transactions Seamlessly',
    image: '/Home/icon_category3.png',
    link: '/ViewTransaction',
  },
  {
    title: 'Create & Transact',
    description: 'Generate wallet addresses, initiate transactions, and more.',
    image: '/Home/icon_category4.png',
    link: '/CreateTransaction',
  },
];

const CardsQuestions = ({ title, description, image, link }) => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const modal = useAppKit();

  return (
    <div
      onClick={() => {
        if (isConnected) {
          navigate(link);
        } else {
          modal.open();
        }
      }}
      className="w-full max-w-[20rem] sm:max-w-[16rem] p-0.5 rounded-xl bg-gradient-to-br from-purple-800 to-black relative cursor-pointer transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500 mx-auto"
      style={{
        boxShadow: 'inset 0px -24px 40px black',
      }}
    >
      <div
        className="absolute inset-0 rounded-xl p-[2px] bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500"
        style={{
          boxShadow: 'inset 0px -24px 40px black',
        }}
      ></div>
      <div
        className="relative h-full bg-gradient-to-br from-[#2b0c33] to-[#200925] rounded-xl p-4 sm:p-5 lg:p-6 text-white text-left"
        style={{
          boxShadow: 'inset 0px -10px 40px -20px black',
        }}
      >
        <div className="mb-2 sm:mb-1 inline-block rounded-lg bg-yellow-400/10 p-2">
          <img
            src={image}
            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain"
            alt={title}
          />
        </div>
        <h3 className="mb-2 text-base sm:text-lg font-semibold line-clamp-2 break-words">{title}</h3>
        <p className="text-xs sm:text-sm text-gray-400 line-clamp-3 break-words">{description}</p>
      </div>
    </div>
  );
};

export default function Home() {
  const [message, setMessage] = useState('');
  const [phoneHotUser, setPhoneHotUser] = useState('');
  const navigate = useNavigate();
  const modal = useAppKit();
  const { address: accountConnected, isConnected } = useAccount();
  const { token, setToken, phoneUser, setPhoneUser } = useContext(AuthContext);

  const sendMessage = (e) => {
    if (e.key === 'Enter') {
      setMessage('');
      localStorage.setItem('initialMessage', e.target.value);
      navigate('/LearnAndEarn');
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', sendMessage);
    return () => {
      document.removeEventListener('keydown', sendMessage);
    };
  }, []);

  const authFn = async () => {
    let response = await authServiceInstance.auth({
      data: { cellphone: phoneHotUser, wallet_address: accountConnected },
    });
    setPhoneUser(phoneHotUser);
    setToken(response.data.access_token);
    localStorage.setItem('phone_user', phoneHotUser);
    localStorage.setItem('access_token', response.data.access_token);
    toast.success(`Account connected`);
  };

  useEffect(() => {
    if (isConnected && phoneHotUser && accountConnected && !token) {
      authFn();
    } else if (!isConnected && !accountConnected && token) {
      setToken('');
      setPhoneUser('');
      localStorage.removeItem('phone_user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('Certification_Level');
    }
  }, [isConnected, phoneHotUser, accountConnected]);

  return (
    <div className="text-white z-[1]">
      <ToastContainer theme="dark" position="top-right" />
      {/* Header */}
      <header className="p-4 sm:p-6 absolute inset-0">
        <a href="#" className="flex items-center gap-2">
          <img
            src="/Home/icon.svg"
            alt="Avalcheck Logo"
            width={32}
            height={32}
            className="rounded-lg w-8 h-8 sm:w-8 sm:h-8"
          />
          <span className="text-lg sm:text-xl font-semibold">Avalcheck</span>
        </a>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:py-10 text-center max-w-8xl min-h-screen overflow-y-auto sm:overflow-y-hidden">
        {/* Hero Section */}
        <div className="my-12 sm:mb-24 space-y-4 sm:space-y-8 relative z-20">
          <img
            src="/Home/icon.svg"
            alt="AI Assistant Logo"
            width={64}
            height={64}
            className="mx-auto rounded-2xl w-14 h-14 sm:w-16 sm:h-16"
          />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold">
            Your Blockchain AI Assistant
          </h1>
          <p className="mx-auto max-w-2xl text-gray-400 text-lg sm:text-xl px-4">
            I can help you with blockchain learning, transactions, and
            certifications.
          </p>
          {isConnected && (
            <div>
              <appkit-button />
            </div>
          )}
          <div className="w-fit mx-auto">
            <PhoneInput
              country={'us'}
              disabled={isConnected || phoneUser ? true : false}
              value={phoneHotUser ? phoneHotUser : phoneUser}
              inputStyle={{
                backgroundColor: '#220A29',
                border: '1px solid #C345A3',
                width: '100%',
                minWidth: '180px',
              }}
              buttonStyle={{
                backgroundColor: '#220A29',
                border: '1px solid #C345A3',
              }}
              dropdownStyle={{
                backgroundColor: '#220A29',
                border: '1px solid #C345A3',
              }}
              containerStyle={{
                backgroundColor: '#220A29',
              }}
              onChange={(phone) => setPhoneHotUser(phone)}
            />
          </div>
          {!isConnected && (
            <button
              className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-medium transition-all hover:opacity-90 cursor-pointer"
              style={{
                backgroundImage: "url('/Home/buttonwallpaper.svg')",
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                cursor: 'pointer',
              }}
              onClick={() => {
                if (phoneHotUser) modal.open();
              }}
            >
              Connect Wallet
            </button>
          )}
        </div>

        {/* Curved Gradient Line */}
        <div
          className="relative my-8 sm:my-16 z-[-2] h-[30rem] sm:h-[60rem] w-full mb-[-20rem] sm:mb-[-43rem] mt-[-8rem] sm:mt-[-18rem]"
          style={{
            backgroundImage: "url('/Home/PlanetWallpaper.svg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: 'inset 0px 0px 150px 64px rgba(0, 0, 0, 1)',
          }}
        ></div>

        {/* Feature Cards */}
        <div className="grid gap-4 sm:gap-6 pt-1 pb-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto px-4 place-items-center sm:place-items-start">

          {/* Learn & Earn Card */}
          <CardsQuestions
            title={cardsQuestions[0].title}
            description={cardsQuestions[0].description}
            image={cardsQuestions[0].image}
            link={cardsQuestions[0].link}
          ></CardsQuestions>

          <CardsQuestions
            title={cardsQuestions[1].title}
            description={cardsQuestions[1].description}
            image={cardsQuestions[1].image}
            link={cardsQuestions[1].link}
          ></CardsQuestions>

          {/* <CardsQuestions
            title={cardsQuestions[2].title}
            description={cardsQuestions[2].description}
            image={cardsQuestions[2].image}
            link={cardsQuestions[2].link}
          ></CardsQuestions> */}

          <CardsQuestions
            title={cardsQuestions[3].title}
            description={cardsQuestions[3].description}
            image={cardsQuestions[3].image}
            link={cardsQuestions[3].link}
          ></CardsQuestions>
        </div>

        {/* Voice Input Bar */}
        {isConnected && (
          <ChatInput></ChatInput>
          /*  <div className="bottom-6 left-4 right-4 mx-auto max-w-6xl">
            <div className="mx-auto mt-16 px-20  max-w-8xl">
              <div
                className="flex items-center gap-4  px-6 py-4"
                style={{
                  backgroundImage: "url('/Home/chatwallpaper.svg')",
                  backgroundSize: '100%',
                  backgroundRepeat: 'no-repeat',
                  boxShadow: 'inset 0px -69px 50px -70px rgba(0, 0, 0, 1)',
                }}
              >
                <Mic className="h-6 w-6 text-gray-400 cursor-pointer" />
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  type="text"
                  placeholder="Ask me anything..."
                  className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
                />
                <button
                  className="rounded-full bg-[#16071e] p-2"
                  onClick={() => handleSendMessage(message)}
                >
                  <img src="/Home/chat_icon2.png" className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div> */
        )}
      </main>
    </div>
  );
}
