import { useContext, useEffect, useState } from 'react';
import Navbar from '../Components/Navbar';
import CertifiedQuestionsService from '../Services/CertifiedQuestionsService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthContext } from '../Context/context';
import { Chat } from '../Components/chat/Chat';

const Button = ({ children, className, ...props }) => (
  <button
    className={`px-4 py-2 rounded-lg transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

const CertifiedQuestions = new CertifiedQuestionsService();

export default function GetCertifiedQuestions() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [questions, setquestions] = useState([]);
  const [saveAnswer, setsaveAnswer] = useState([]);
  const { token } = useContext(AuthContext);
  const [showFinalViewCertifies, setshowFinalViewCertifies] = useState(false);
  const [dataCertifiedFinal, setdataCertifiedFinal] = useState(null);
  const [loadingDataCertifiedFinal, setloadingDataCertifiedFinal] =
    useState(false);
  const handleAnswerSelect = (answerId) => {
    setSelectedAnswer(answerId);
  };

  const handleContinue = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setsaveAnswer([
        ...saveAnswer,
        {
          questionId: questions[currentQuestionIndex]?.id,
          answerId: selectedAnswer,
        },
      ]);

      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      setsaveAnswer([
        ...saveAnswer,
        {
          questionId: questions[currentQuestionIndex]?.id,
          answerId: selectedAnswer,
        },
      ]);

      sendAllAnswers({
        dataQuestions: [
          ...saveAnswer,
          {
            questionId: questions[currentQuestionIndex]?.id,
            answerId: selectedAnswer,
          },
        ],
      });
    }
  };

  const sendAllAnswers = ({ dataQuestions }) => {
    setloadingDataCertifiedFinal(true);

    CertifiedQuestions.sendAnswer({
      answers: dataQuestions,
      level: localStorage.getItem('Certification_Level'),
      token,
    })
      .then((response) => {
        console.log(response);
        toast.success('Respuestas enviadas con exito');
        setshowFinalViewCertifies(true);
        setdataCertifiedFinal(response.data);
      })
      .catch((error) => {
        toast.error(`Algo salió mal - ${error.response.data.message}`);
        console.log(error);
      })
      .finally(() => {
        console.log('finally');
        setloadingDataCertifiedFinal(false);
      });
  };

  const getQuestionsAndAnswers = () => {
    CertifiedQuestions.GetAnswerAndQuestion({
      level: localStorage.getItem('Certification_Level'),
      token,
    })
      .then((response) => {
        console.log(response);
        setquestions(response.data);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        console.log('finally');
      });
  };

  useEffect(() => {
    getQuestionsAndAnswers();
  }, []);

  if (showFinalViewCertifies === true) {
    return (
      <>
        <div className="bg-[#0D0A14] w-screen h-screen">
          <Navbar></Navbar>
          <Chat
            type="certified_result"
            chatInitialData={dataCertifiedFinal}
            initialMessageBot={' '}
          ></Chat>
        </div>
      </>
    );
  } else {
    return (
      <div className="bg-[#0D0A14]">
        <ToastContainer theme="dark" position="top-right" />
        <Navbar></Navbar>
        <div className="min-h-[calc(100vh-17vh)] text-white p-6 mt-20">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span>{questions[currentQuestionIndex]?.level}</span>
              </div>
              <div className="h-1 bg-gray-800 rounded-full">
                <div
                  style={{
                    width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                  }}
                  className="rounded-full bg-gradient-to-r from-[#bd557f] to-[#3a0ad5] h-full"
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="flex flex-row items-start gap-4">
              <img
                src="/Home/icon.svg"
                alt="Blockchain Icon"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <div className="bg-[#1c1325] rounded-3xl p-6 space-y-6 border-[#2c2434] border-2 w-full">
                {/* Question Header */}
                <div className="flex gap-3">
                  <h2 className="text-sm">
                    {questions[currentQuestionIndex]?.question}
                  </h2>
                </div>

                {/* Answer Options */}
                <div className="space-y-3">
                  {questions[
                    currentQuestionIndex
                  ]?.certificatequestionanswers.map((answer) => (
                    <button
                      key={answer.id}
                      onClick={() => handleAnswerSelect(answer.id)}
                      className={`w-full text-sm text-left p-4 rounded-xl transition-colors flex flex-row items-center ${
                        selectedAnswer === answer.id
                          ? 'bg-[#331836] border-2 border-[#8c3675]'
                          : 'bg-[#2A2433] hover:bg-[#2A2433]/80'
                      }`}
                    >
                      <div className="flex items-center justify-center mr-3">
                        <div
                          className={`relative flex items-center justify-center w-6 h-6 rounded-full ${
                            selectedAnswer === answer.id
                              ? 'bg-gradient-to-r from-pink-500 to-purple-600'
                              : 'border-2 border-gray-600'
                          }`}
                        >
                          <div
                            className={`w-3 h-3 rounded-full transition-colors ${
                              selectedAnswer === answer.id
                                ? 'bg-white'
                                : 'bg-transparent'
                            }`}
                          ></div>
                        </div>
                      </div>
                      {answer.answer}
                    </button>
                  ))}
                </div>

                {/* Continue Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      if (loadingDataCertifiedFinal === false) {
                        handleContinue();
                      }
                    }}
                    disabled={selectedAnswer === null}
                    className={`px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition-opacity flex items-center gap-2 ${
                      selectedAnswer === null
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    } ${
                      loadingDataCertifiedFinal === true
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    {loadingDataCertifiedFinal === true ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Sending answers...
                      </>
                    ) : (
                      <>
                        {currentQuestionIndex === questions.length - 1
                          ? 'Finish'
                          : 'Continue'}
                      </>
                    )}

                    {loadingDataCertifiedFinal === false && (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
