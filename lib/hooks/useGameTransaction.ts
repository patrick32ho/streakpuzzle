'use client';

import { useCallback, useState } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

// Address to receive tracking transactions (can be your own wallet or a dedicated tracking address)
const TRACKING_ADDRESS = process.env.NEXT_PUBLIC_TRACKING_ADDRESS || '0x0000000000000000000000000000000000000000';

export function useGameTransaction() {
  const { address, isConnected } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    sendTransaction, 
    data: hash,
    isPending: isSending,
    reset 
  } = useSendTransaction();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const sendGameStartTransaction = useCallback(async (): Promise<boolean> => {
    // If not connected, skip transaction and allow playing
    if (!isConnected || !address) {
      return true;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Send 0 ETH transaction with game data
      sendTransaction({
        to: TRACKING_ADDRESS as `0x${string}`,
        value: parseEther('0'),
        data: '0x47414d45' as `0x${string}`, // "GAME" in hex as identifier
      });
      
      return true;
    } catch (err) {
      console.error('Transaction error:', err);
      setError('Transaction failed');
      setIsProcessing(false);
      return false;
    }
  }, [isConnected, address, sendTransaction]);

  const resetTransaction = useCallback(() => {
    reset();
    setIsProcessing(false);
    setError(null);
  }, [reset]);

  return {
    sendGameStartTransaction,
    resetTransaction,
    isConnected,
    isProcessing: isProcessing || isSending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}
