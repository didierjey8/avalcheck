import { ethers } from "ethers";
import React, { useState } from 'react';
import { useAccount, useSendTransaction, useWriteContract, useSimulateContract } from 'wagmi';

function WagmiExample() {
  const { address: accountConnected, isConnected } = useAccount();
  const { data: hash, writeContract } = useWriteContract()

  const [loading, setLoading] = useState(false);

  const aaveLendingPoolABI = [
    {
      inputs: [
        { internalType: 'address', name: 'asset', type: 'address' },
        { internalType: 'uint256', name: 'amount', type: 'uint256' },
        { internalType: 'address', name: 'onBehalfOf', type: 'address' },
        { internalType: 'uint16', name: 'referralCode', type: 'uint16' },
      ],
      name: 'deposit',
      outputs: [],
      stateMutability: 'payable',
      type: 'function',
    },
  ];

  const lendingPoolAddress = "0x4F01AeD16D97E3aB5ab2B501154DC9bb0F1A5A2C";
    
  const handleSaving = async () => {
    setLoading(true);
    try {
      writeContract({
        address: lendingPoolAddress,
        abi: aaveLendingPoolABI,
        functionName: 'deposit',
        args: [
          "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7", 
          ethers.utils.parseUnits("10", 6),           
          accountConnected,                           
          0
        ],
      })
    } catch (error) {
      console.error('Error en el depósito:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    setLoading(true);

    const payload = {
        action: "TX",
        toAddress: "0x1102a4bc0448b3bbc91a8022b61b72d267d0933f",
        message: "Transfer 1 USDT to vitalik.eth"
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/create/brianknows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Nywicm9sZSI6IlVTRVIiLCJpYXQiOjE3MzI1NjUxNDAsImV4cCI6MTczMjc0NTE0MH0.2ihyadVYjlY-1rDvySCrr2Nccx-FBy0cj09sa4zu4ME',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to send request');
      }

      let data = await response.json();

      if (data) {
        let payload = data.extra.result[0].data.steps[0];

        sendTransaction({
          to: payload.to,
          data: payload.data,
          value: payload.value,
          gasLimit: payload.gasLimit,
        });
      }
    } catch (error) {
      alert('An error occurred while processing the transaction.');
    } finally {
      setLoading(false);
    }
  };

  //SWAP 1 AVAX TO USDT
  const routerAddressSwapAvaxtoUSDT = "0x60aE616a2155Ee3d9A68541Ba4544862310933d4";
  const routerABISwapAvaxtoUSDT = [
    {
      "inputs": [
        { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" },
        { "internalType": "address[]", "name": "path", "type": "address[]" },
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "deadline", "type": "uint256" },
      ],
      "name": "swapExactAVAXForTokens",
      "outputs": [{ "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }],
      "stateMutability": "payable",
      "type": "function",
    },
  ];

  const usdtABI = [
    {
      "inputs": [
        { "internalType": "address", "name": "spender", "type": "address" },
        { "internalType": "uint256", "name": "amount", "type": "uint256" },
      ],
      "name": "approve",
      "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
      "stateMutability": "nonpayable",
      "type": "function",
    },
  ];

  const usdtAddress = "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7";

  const handleSwapAvaxToUSDT = async () => {
    setLoading(true);
    try {
      writeContract({
        address: routerAddressSwapAvaxtoUSDT,
        abi: routerABISwapAvaxtoUSDT,
        functionName: 'swapExactAVAXForTokens',
        args: [
          ethers.utils.parseUnits("0", 6),
          [ethers.constants.AddressZero, usdtAddress],
          accountConnected,
          Math.floor(Date.now() / 1000) + 60 * 10, // Deadline (10 minutos)
        ],
        overrides: {
          value: ethers.utils.parseEther('1'), // Monto en AVAX a intercambiar
        },
      })
    } catch (error) {
      console.error('Error en el depósito:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapUSDTToAvax = async () => {
    setLoading(true);
    try {
      await writeContract({
        address: usdtAddress,
        abi: usdtABI,
        functionName: 'approve',
        args: [
          routerAddressSwapAvaxtoUSDT,
          ethers.utils.parseUnits('1', 6)
        ]
      })
      
      writeContract({
        address: routerAddressSwapAvaxtoUSDT,
        abi: routerABISwapAvaxtoUSDT,
        functionName: 'swapExactTokensForAVAX',
        args: [
          ethers.utils.parseUnits('1', 6),
          ethers.utils.parseUnits("0.1", 18),
          [usdtAddress, ethers.constants.AddressZero], // Ruta: USDT -> AVAX
          accountConnected, 
          Math.floor(Date.now() / 1000) + 60 * 10, // Deadline (10 minutos)
        ]
      })
    } catch (error) {
      console.error('Error en el depósito:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col justify-center items-center pt-[50px]">
      <w3m-button />
      
      {isConnected && (<>
        <button
          onClick={handleTransfer}
          className={`mt-4 px-4 py-2 rounded bg-blue-600 text-white ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Transfer 1 USDT to vitalik.eth'}
        </button>
        
        <button
          onClick={handleSaving}
          className={`mt-4 px-4 py-2 rounded bg-blue-600 text-white ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Saving/Staking 1 USDT to lending pool'}
        </button>
        
        <button
          onClick={handleSwapAvaxToUSDT}
          className={`mt-4 px-4 py-2 rounded bg-blue-600 text-white ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Swap 1 AVAX to USDT with Trader Joe'}
        </button>
        
        <button
          onClick={handleSwapUSDTToAvax}
          className={`mt-4 px-4 py-2 rounded bg-blue-600 text-white ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Swap 1 USDT to AVAX with Trader Joe'}
        </button>
      </>)}
    </div>
  );
}

export default WagmiExample;
