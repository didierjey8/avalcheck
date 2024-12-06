import { useState, useContext, useEffect } from 'react';
import Surveys from '../../Services/Surveys';
const SurveysService = new Surveys();
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Check, Download, Share2, ThumbsDown, ThumbsUp } from 'lucide-react';
import { ArrowDownLeft, ArrowUpRight, ChevronDown, Copy } from 'lucide-react';
import { AuthContext } from '../../Context/context';
import PhoneInput from 'react-phone-input-2';
import { useAccount } from 'wagmi';

const Card = ({ children, className, ...props }) => (
  <div className={`rounded-2xl ${className}`} {...props}>
    {children}
  </div>
);

const SurveysModules = ({ data }) => {
  const { phoneUser } = useContext(AuthContext);
  const { token } = useContext(AuthContext);
  const { isConnected } = useAccount();

  const SurveyAnswerQuestion = ({ idQuestion }) => {
    const data = {
      user: localStorage.getItem('phone_user') || phoneUser,
      idQuestion: idQuestion,
      answer: true,
    };
    SurveysService.SurveyAnswerQuestion({
      data: data,
      token,
    })
      .then((res) => {
        toast.success(`Answer sent successfully`);
      })
      .catch((err) => {
        toast.error(`Algo salió mal - ${err.response.data.message}`);
        console.log(err);
      })
      .finally(() => {
        console.log('finally');
      });
  };
  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-5 px-4 sm:px-0">
        <p className="text-sm sm:text-base whitespace-nowrap">
          I would call you to this number:{' '}
        </p>
        <div className="w-full sm:w-auto p-0 rounded-full bg-[#261833] overflow-hidden flex items-center justify-start pl-2 cursor-not-allowed relative text-white">
          <div className="absolute w-full h-full z-50"></div>
          <PhoneInput
            country={'us'}
            disabled={isConnected || phoneUser ? true : false}
            value={phoneUser ? phoneUser : ''}
            inputStyle={{
              backgroundColor: '#261833',
              border: '1px solid #261833',
              width: '100%',
              minWidth: '180px',
            }}
            buttonStyle={{
              backgroundColor: '#261833',
              border: '1px solid #261833',
            }}
            dropdownStyle={{
              backgroundColor: '#261833',
              border: '1px solid #261833',
            }}
            containerStyle={{
              backgroundColor: '#261833',
              width: '100%',
            }}
            onChange={(phone) => setPhoneHotUser(phone)}
          />
        </div>
      </div>

      <div className="flex gap-2 items-start sm:px-0">
        <ToastContainer theme="dark" position="top-right" />

        <Card className="w-full">
          <div className="bg-[#20152a] text-gray-200 w-full border-[#261d2e] border-2 rounded-xl mt-5 sm:mt-10">
            <div className="space-y-0">
              {data.map((topic, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p- border-[#332a3a] border-2 gap-4"
                >
                  <div className="flex flex-col items-start gap-2 sm:gap-4 w-full sm:w-auto">
                    <h3 className="font-medium text-white text-sm sm:text-base">
                      {topic.title}
                    </h3>
                    <p className="text-base sm:text-lg text-white font-bold">
                      Learn and earn {topic.topic}
                    </p>

                    <div className="flex flex-wrap gap-1 sm:gap-4">
                      <h2 className="text-xs sm:text-sm bg-[#2A2433] border-2 border-[#7627CB] rounded-full px-2 sm:px-3 py-1 w-fit min-w-[108px]">
                        Attemps : {topic.attemptsCount}
                      </h2>
                      <h2 className="text-xs sm:text-sm bg-gradient-to-r from-[#A46E61] via-[#7913D0] to-[#3B196C] text-white rounded-full px-2 sm:px-3 py-1 w-fit min-w-[100px]">
                        Earn : 0.001 Avax
                      </h2>
                    </div>
                  </div>

                  <div className="flex w-full sm:w-auto">
                    {topic.won === false ? (
                      <button
                        onClick={() =>
                          SurveyAnswerQuestion({ idQuestion: topic.id })
                        }
                        className="bg-[#2A2433] hover:bg-purple-900/50 flex items-center justify-center gap-2 rounded-full px-3 sm:px-5 py-2 sm:py-3 transition-colors w-full sm:w-auto text-sm sm:text-base"
                      >
                        <img
                          src="/Home/phoneIcon.svg"
                          className="h-5 w-5 sm:h-6 sm:w-6"
                        />
                        Call Me & Explain
                      </button>
                    ) : (
                      <button className="bg-[#1F0A1B] flex items-center justify-center gap-2 rounded-full px-3 sm:px-5 py-2 sm:py-3 cursor-not-allowed border-[#AE4F74] border-2 text-white w-full sm:w-auto text-sm sm:text-base">
                        <Check className="h-5 w-5 sm:h-6 sm:w-6 rounded-full" />
                        Topic has been answered
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between sm:justify-end text-xs text-gray-500 gap-2 sm:gap-4 px-3 sm:px-0">
            <span className="opacity-50">Just now</span>
            {/* <div className="flex flex-wrap gap-2 sm:gap-3">
              <button className="hover:text-gray-300">Copy</button>
              <button className="hover:text-gray-300">
                Regenerate response
              </button>
              <div className="flex gap-1">
                <span className="cursor-pointer">👎</span>
                <span className="cursor-pointer">👍</span>
              </div>
            </div> */}
          </div>
        </Card>
      </div>
    </>
  );
};

const CreateTransaction_CreateWalletModules = ({ data }) => {
  const [copied, setCopied] = useState(false);

  const recoveryPhrase = [
    'Chart',
    'frog',
    'jacket',
    'shoot',
    'history',
    'between',
    'flock',
    'gift',
    'device',
    'admit',
    'toss',
    'modify',
  ];

  // const handleCopy = async () => {
  //   try {
  //     await navigator.clipboard.writeText(recoveryPhrase.join(' '));
  //     setCopied(true);
  //     setTimeout(() => setCopied(false), 2000);
  //   } catch (err) {
  //     console.error('Failed to copy:', err);
  //   }
  // };

  const handleCopy = async () => {
    try {
      // Copy the mnemonic words from data with spaces between them
      const mnemonicPhrase = data?.mnemonic || '';
      await navigator.clipboard.writeText(mnemonicPhrase);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div>
      <div className="mx-auto w-full">
        <div className="flex gap-4 w-full">
          <div className="w-full">
            <div className="rounded-2xl w-full space-y-6 pt-5">
              <h1 className="text-white text-sm font-semibold bg-[#291E30] p-4 rounded-t-2xl break-all">
                Adress Wallet:{' '}
                <span className="text-gray-400">{data?.address}</span>
              </h1>
              <h1 className="text-white text-sm font-semibold bg-[#291E30] p-4 rounded-t-2xl break-all">
                Private Key: <span className="text-gray-400">{data?.xpriv}</span>
              </h1>
              <h1 className="text-white text-sm font-semibold bg-[#291E30] p-4 rounded-t-2xl break-all">
                Xpub: <span className="text-gray-400">{data?.xpub}</span>
              </h1>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data?.mnemonic.split(' ').map((word, index) => (
                  <div
                    key={index}
                    className="bg-[#291E30] rounded-xl p-4 flex items-center space-x-3"
                  >
                    <span className="text-gray-400">{index + 1}.</span>
                    <span className="text-white">{word}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end items-center pt-4 space-x-4">
              <span className="text-gray-400 text-sm">Just now</span>
              <button
                onClick={handleCopy}
                className="hover:bg-[#3A3443] transition-colors px-4 py-2 rounded-lg text-white text-sm"
              >
                {copied ? 'Copied!' : 'Copy Recovery Phrase'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResponseGraficTranstaction = ({ data }) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const values = [50, 65, 45, 90, 75, 60, 55];
  
  data = !data?.txs?.length ? [] : data;

  return (
    <div className="bg-[#1D1225] w-full">
      <div className="w-full mx-auto space-y-6">
        {/* AI Message */}
        <div className="flex gap-4 w-full">
          <div className="rounded-2xl w-full space-y-6">
            <p className="text-white">
              here is your transaction history for last month
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              <div className="bg-[#291E30] rounded-xl p-4">
                <p className="text-gray-400 text-sm">Total Transactions</p>
                <p className="text-white text-2xl font-semibold mt-1">
                  {data?.txs?.length}
                </p>
              </div>
              <div className="bg-[#291E30] rounded-xl p-4">
                <p className="text-gray-400 text-sm">Total Volume</p>
                <p className="text-white text-2xl font-semibold mt-1">
                  {(data?.volume||0).toFixed(4)} Avax
                </p>
              </div>
              <div className="bg-[#291E30] rounded-xl p-4">
                <p className="text-gray-400 text-sm">Gas Spent</p>
                <p className="text-white text-2xl font-semibold mt-1">
                  {(data?.gasUsed||0).toFixed(4)} Avax
                </p>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="space-y-4 w-full">
              <div className="flex justify-between items-center">
                <h3 className="text-white">Recent Transactions</h3>
                <button className="bg-[#2A2433] p-2 rounded-lg">
                  <Download className="h-4 w-4 text-gray-400" />
                </button>
              </div>

              {/* Transaction List */}
              <div className="space-y-2">
                {data?.txs?.map((transaction, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-[#291E30] rounded-xl p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-2 rounded-lg ${
                          transaction.type !== 'in'
                            ? 'bg-pink-500/20'
                            : 'bg-green-500/20'
                        }`}
                      >
                        {transaction.type !== 'in' ? (
                          <ArrowUpRight
                            className={`h-4 w-4 ${
                              transaction.type !== 'in'
                                ? 'text-pink-500'
                                : 'text-green-500'
                            }`}
                          />
                        ) : (
                          <ArrowDownLeft
                            className={`h-4 w-4 ${
                              transaction.type !== 'in'
                                ? 'text-pink-500'
                                : 'text-green-500'
                            }`}
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-white capitalize">
                          {transaction.type} {transaction.amount} Avax
                        </p>
                        <div className="flex flex-col items-start gap-1 text-sm text-gray-400">
                          <span>To: {transaction.hash}</span>
                          <span>Network: {transaction.network}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transactions Volume Chart */}
            <div className="space-y-4">
              {/* Chart */}
              {/* <div className=" w-full relative">
                <img src="/Home/chart1.svg" alt="" />
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CertifiedResultModules = ({ data }) => {
  const [isLoading, setIsLoading] = useState(true);

  const certificateData = data;

  const handleDownload = () => {
    window.open(certificateData.PDFCertificate, '_blank');
  };

  return (
    <div>
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-4">
          <div className="bg-[#1A1523] rounded-2xl w-full space-y-6">
            {/* Congratulations Message */}
            <div className="space-y-4">
              <p className="text-white text-lg">🎉 Congratulations! 🎉</p>
              <p className="text-white">
                You have successfully completed the quiz, scoring{' '}
                <span className="font-semibold">{data?.score} points</span> and
                demonstrating an impressive understanding of the material.
                We&apos;re thrilled to award you this Certificate of Achievement
                to recognize your knowledge and dedication.
                <br />
                <br />
                <br />
                {certificateData.NFTCertificate && (
                  <>
                    <b>NFT CERTIFICATE BY CROSSMINT:</b>{' '}
                    <a href={certificateData.NFTCertificate} target="_BLANK">
                      {certificateData.NFTCertificate}
                    </a>
                    <br />
                    <br />
                  </>
                )}
              </p>
            </div>

            {/* Certificate PDF */}
            <div className="relative aspect-[1.4/1] w-full bg-gray-800 rounded-lg overflow-hidden">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                </div>
              )}
              <iframe
                src={`${data?.PDFCertificate}#toolbar=0`}
                className="w-full h-full"
                onLoad={() => setIsLoading(false)}
              />
            </div>
            <br />
            <br />
            {certificateData.PDFCertificate && (
              <>
                <b>PDF CERTIFICATE:</b>{' '}
                <a href={certificateData.PDFCertificate} target="_BLANK">
                  {certificateData.PDFCertificate}
                </a>
                <br />
                <br />
              </>
            )}

            {certificateData.PNGCertificate && (
              <>
                <b>PNG CERTIFICATE:</b>{' '}
                <a href={certificateData.PNGCertificate} target="_BLANK">
                  {certificateData.PNGCertificate}
                </a>
                <br />
                <br />
              </>
            )}

            {/* Footer Actions */}
            <div className="flex justify-between items-center pt-4">
              <span className="text-gray-400 text-sm">Just now</span>
              <div className="flex items-center gap-3">
                <button className="bg-[#2A2433] hover:bg-[#3A3443] transition-colors px-4 py-2 rounded-lg text-white text-sm flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button
                  onClick={handleDownload}
                  className="bg-[#2A2433] hover:bg-[#3A3443] transition-colors px-4 py-2 rounded-lg text-white text-sm flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                {/* <div className="flex gap-2">
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <ThumbsDown className="w-5 h-5" />
                  </button>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <ThumbsUp className="w-5 h-5" />
                  </button>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatModules = ({ type, data }) => {
  if (type === 'surveys') {
    return <SurveysModules data={data}></SurveysModules>;
  }
  if (type === 'create_wallet') {
    return (
      <CreateTransaction_CreateWalletModules
        data={data}
      ></CreateTransaction_CreateWalletModules>
    );
  }
  if (type === 'certified_result') {
    return <CertifiedResultModules data={data}></CertifiedResultModules>;
  }
  if (type === 'transactions') {
    return (
      <ResponseGraficTranstaction data={data}></ResponseGraficTranstaction>
    );
  }

  return <div>ChatModules</div>;
};

export default ChatModules;
