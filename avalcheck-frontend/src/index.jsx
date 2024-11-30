import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { WagmiProvider } from 'wagmi'
import { createAppKit } from '@reown/appkit/react'
import { avalanche, avalancheFuji } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from "../src/Context/context";

const projectId = '168ca137105fbbd8d84af837ad5a9584'
const queryClient = new QueryClient()

const metadata = {
  name: 'AVALCHECK',
  description: 'AVALCHECK Conection',
  url:'',
  icons:[]
}

const wagmiAdapter = new WagmiAdapter({
  networks: [avalanche, avalancheFuji],
  projectId
});

createAppKit({
  themeMode: 'dark',
  adapters: [wagmiAdapter],
  networks: [avalanche, avalancheFuji],
  metadata: metadata,
  projectId,
  features: {
    analytics: true,
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/*<ContextProvider>*/}
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
    {/*</ContextProvider>*/}
  </React.StrictMode>
);
