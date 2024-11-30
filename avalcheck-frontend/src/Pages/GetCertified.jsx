import { Mic } from 'lucide-react';
import Navbar from '../Components/Navbar';
import { Chat } from '../Components/chat/Chat';
import { useNavigate } from 'react-router-dom';

const cardsQuestions = [
  {
    title: 'Normal',
    description: 'A great start to warm up!',
    image: '🌟',
    link: '/GetCertifiedQuestions',
    level: 'BASIC',
  },
  {
    title: 'Medium',
    description: 'Step it up for a bit more challenge!',
    image: '💪',
    link: '/GetCertifiedQuestions',
    level: 'MEDIUM',
  },
  {
    title: 'Hard',
    description: 'For the brave ones ready to go all in!',
    image: '🔥',
    link: '/GetCertifiedQuestions',
    level: 'ADVANCED',
  },
];

const Button = ({ children, className, ...props }) => (
  <button
    className={`px-4 py-2 rounded-lg transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

const CardsQuestions = ({ title, description, image, link, level }) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => {
        localStorage.setItem('Certification_Level', level);
        navigate(link);
      }}class="w-64 p-0.5 rounded-xl bg-gradient-to-br from-purple-800 to-black relative cursor-pointer transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500"
      style={{
        boxShadow: 'inset 0px -24px 40px black',
      }}
    >
      <div
        class="absolute inset-0 rounded-xl p-[2px] bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500"
        style={{
          boxShadow: 'inset 0px -24px 40px black',
        }}
      ></div>
      <div
        class="relative h-full bg-gradient-to-br from-[#2b0c33] to-[#200925] rounded-xl p-4 text-white text-left gap-5 flex flex-col"
        style={{
          boxShadow: 'inset 0px -10px 40px -20px black',
        }}
      >
        <div class="flex flex-row items-center justify-between">
          <div
            className="rounded-lg w-12 h-12 text-2xl flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: image }}
          ></div>
          <span className="bg-[#3e2448] p-2 px-4 rounded-full">
            10 Questions
          </span>
        </div>
        <div>
          <h3 className="mb-2 text-xl font-semibold">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default function GetCertified() {
  return (
    <div className="bg-[#0F0814] text-white z-[1] relative min-h-screen">
      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 text-center max-w-8xl flex flex-col items-center">
        {/* Hero Section */}
        <div className="mb-24 space-y-8">
          <img
            src="/Home/iconKnoledge.svg"
            alt="AI Assistant Logo"
            width={64}
            height={64}
            className="mx-auto rounded-2xl"
          />
          <h1 className="text-4xl font-semibold sm:text-5xl max-w-2xl mx-auto">
            Hey there! Ready to test your knowledge? 🎉
          </h1>
          <p className="mx-auto max-w-2xl text-gray-400 text-xl">
            Before we begin, choose your challenge level:
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-6 max-w-6xl mx-auto sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <CardsQuestions
              title={cardsQuestions[0].title}
              description={cardsQuestions[0].description}
              image={cardsQuestions[0].image}
              link={cardsQuestions[0].link}
              level={cardsQuestions[0].level}
            />
            <CardsQuestions
              title={cardsQuestions[1].title}
              description={cardsQuestions[1].description}
              image={cardsQuestions[1].image}
              link={cardsQuestions[1].link}
              level={cardsQuestions[1].level}
            />
            <CardsQuestions
              title={cardsQuestions[2].title}
              description={cardsQuestions[2].description}
              image={cardsQuestions[2].image}
              link={cardsQuestions[2].link}
              level={cardsQuestions[2].level}
            />
        </div>
      </main>
      <Chat type={'certificate'} initialMessageBot={false} />
    </div>
  );
}
