import { useAccount } from 'wagmi';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/context';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [currentRoute, setcurrentRoute] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const { phoneUser } = useContext(AuthContext);

  const routes = [
    { path: '/', name: 'Home' },
    { path: '/LearnAndEarn', name: 'Learn & Earn' },
    { path: '/GetCertified', name: 'Get Certified' },
    // { path: '/ViewTransaction', name: 'View Transaction' },
    { path: '/CreateTransaction', name: 'Create & Transact' },
  ];

  const handleClickNavigate = (path) => {
    navigate(path);
    setIsDrawerOpen(false);
  };

  useEffect(() => {
    const currentRoute = window.location.pathname;
    setcurrentRoute(currentRoute);
  }, []);

  useEffect(() => {
    if (!isConnected) {
      navigate('/');
    }
  }, [isConnected]);

  // Prevent scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isDrawerOpen]);

  return (
    <>
      <div className="w-full h-16 sm:h-20"></div>

      <header className="border-b border-purple-900/20 px-2 sm:px-4 py-2 sm:py-3 bg-[#150623] border-2 border-[#2B1B38] fixed top-0 left-0 w-full z-50 shadow-lg">
        <div className="mx-auto flex w-full items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <img
              src="/Home/icon.svg"
              alt="Avalcheck Logo"
              width={32}
              height={32}
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg"
            />
            <span className="text-lg sm:text-xl font-semibold text-white">Avalcheck</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-10 xl:gap-20">
            <div className="flex gap-2 bg-black p-1 rounded-lg">
              {routes.map((route) => {
                if (route.path === currentRoute) {
                  return (
                    <div
                      key={route.path}
                      className="relative w-32 xl:w-40 h-10 flex items-center justify-center cursor-pointer"
                      onClick={() => handleClickNavigate(route.path)}
                    >
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-[#692932] via-[#300e37] to-[#2e0f3a] p-[2px]">
                        <div className="h-full w-full rounded-lg bg-gradient-to-r from-[#1c0922] to-black flex items-center justify-center">
                          <span className="text-white text-sm xl:text-base font-semibold">
                            {route.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <Button
                    key={route.path}
                    className="text-gray-400 hover:text-white hover:bg-purple-900/50 text-sm xl:text-base"
                    onClick={() => handleClickNavigate(route.path)}
                  >
                    {route.name}
                  </Button>
                );
              })}
            </div>
          </nav>

          <div className="flex items-center ">
            {isConnected && <appkit-button />}
            
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-white hover:bg-purple-900/20 rounded-lg transition-colors"
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            >
              {isDrawerOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Overlay */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#150623] border-r-2 border-[#2B1B38] z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="pt-20">
          <nav className="flex flex-col w-full">
            {routes.map((route) => (
              <button
                key={route.path}
                onClick={() => handleClickNavigate(route.path)}
                className={`w-full px-4 py-3 text-left transition-colors ${
                  route.path === currentRoute
                    ? 'bg-gradient-to-r from-[#692932] via-[#300e37] to-[#2e0f3a] text-white'
                    : 'text-gray-400 hover:bg-purple-900/20 hover:text-white'
                }`}
              >
                {route.name}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

const Button = ({ children, className, ...props }) => (
  <button
    className={`px-3 xl:px-4 py-2 rounded-lg transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Navbar;