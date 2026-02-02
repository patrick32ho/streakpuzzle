'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi';
import { parseEther } from 'viem';
import { base } from 'wagmi/chains';
import { useMiniApp } from './providers/MiniAppProvider';
import { getDayId, formatDayId } from '@/lib/puzzle';

// Tracking address - receives 0 ETH transactions to count players
const TRACKING_ADDRESS = '0x0000000000000000000000000000000000000001';

export default function Home() {
  const { context } = useMiniApp();
  const router = useRouter();
  const { isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const [dayId, setDayId] = useState(0);
  const [todayStatus, setTodayStatus] = useState<'unplayed' | 'solved' | 'failed'>('unplayed');
  const [streak, setStreak] = useState(0);
  const [showTxModal, setShowTxModal] = useState(false);

  const { 
    sendTransaction, 
    data: hash,
    isPending: isSending,
    error: txError,
    reset: resetTx
  } = useSendTransaction();
  
  const { isLoading: isConfirming, isSuccess: txSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    const currentDayId = getDayId();
    setDayId(currentDayId);

    // Check localStorage for today's status
    const storageKey = `grid_of_day_${currentDayId}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.status === 'won') {
          setTodayStatus('solved');
        } else if (data.status === 'lost') {
          setTodayStatus('failed');
        }
        if (data.result?.streak?.current) {
          setStreak(data.result.streak.current);
        }
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Navigate to play when transaction succeeds
  useEffect(() => {
    if (txSuccess) {
      router.push('/play');
    }
  }, [txSuccess, router]);

  const handlePlay = async () => {
    // If already played today, just view result
    if (todayStatus !== 'unplayed') {
      router.push('/play');
      return;
    }

    // If wallet connected, send tracking transaction on Base mainnet
    if (isConnected) {
      setShowTxModal(true);
      try {
        // Switch to Base mainnet if not already on it
        if (chainId !== base.id) {
          await switchChain({ chainId: base.id });
        }
        
        sendTransaction({
          to: TRACKING_ADDRESS as `0x${string}`,
          value: parseEther('0'),
          chainId: base.id, // Force Base mainnet
          // Encode dayId in the data field for tracking
          data: `0x504c4159${dayId.toString(16).padStart(8, '0')}` as `0x${string}`, // "PLAY" + dayId
        });
      } catch (err) {
        console.error('Failed to send transaction:', err);
      }
    } else {
      // No wallet - go straight to play
      router.push('/play');
    }
  };

  const handleSkipTx = () => {
    setShowTxModal(false);
    resetTx();
    router.push('/play');
  };

  const handleCloseTxModal = () => {
    setShowTxModal(false);
    resetTx();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Transaction Modal */}
      {showTxModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full text-center">
            {isSending && (
              <>
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Confirm Transaction</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Sign a free transaction to join today&apos;s game and be counted on the leaderboard!
                </p>
                <p className="text-xs text-gray-500">Cost: 0 ETH (only gas)</p>
              </>
            )}
            
            {isConfirming && (
              <>
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Confirming...</h3>
                <p className="text-gray-400 text-sm">
                  Waiting for transaction confirmation
                </p>
              </>
            )}
            
            {txError && (
              <>
                <div className="text-4xl mb-4">❌</div>
                <h3 className="text-xl font-bold text-white mb-2">Transaction Failed</h3>
                <p className="text-gray-400 text-sm mb-4">
                  You can still play without the transaction
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleCloseTxModal}
                    className="flex-1 py-3 bg-gray-700 text-white rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSkipTx}
                    className="flex-1 py-3 bg-primary text-white rounded-lg font-medium"
                  >
                    Play Anyway
                  </button>
                </div>
              </>
            )}
            
            {!isSending && !isConfirming && !txError && !txSuccess && (
              <button
                onClick={handleSkipTx}
                className="text-gray-400 hover:text-white text-sm underline"
              >
                Skip and play without tracking
              </button>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="p-4 text-center">
        <h1 className="text-2xl font-bold text-white mb-1">
          Grid of the Day
        </h1>
        <p className="text-gray-400 text-sm">
          {formatDayId(dayId)}
        </p>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Logo/Preview */}
        <div className="mb-8">
          <div className="flex gap-2">
            {['R', 'O', 'Y', 'G', 'B'].map((id, i) => (
              <div
                key={id}
                className="w-12 h-12 rounded-lg animate-bounce-in"
                style={{
                  backgroundColor: ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6'][i],
                  animationDelay: `${i * 100}ms`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="text-center mb-8">
          {todayStatus === 'unplayed' && (
            <>
              <p className="text-xl text-gray-300 mb-2">
                Hey {context?.user?.displayName || 'Player'}!
              </p>
              <p className="text-gray-400">
                Ready to solve today&apos;s puzzle?
              </p>
            </>
          )}
          {todayStatus === 'solved' && (
            <>
              <p className="text-xl text-success mb-2">
                ✓ Today&apos;s puzzle solved!
              </p>
              <p className="text-gray-400">
                Come back tomorrow for a new challenge
              </p>
            </>
          )}
          {todayStatus === 'failed' && (
            <>
              <p className="text-xl text-error mb-2">
                Today&apos;s puzzle completed
              </p>
              <p className="text-gray-400">
                Try again tomorrow!
              </p>
            </>
          )}
        </div>

        {/* Streak Card */}
        {streak > 0 && (
          <div className="bg-gray-800 rounded-xl p-4 mb-8 flex items-center gap-3">
            <span className="text-3xl">🔥</span>
            <div>
              <p className="text-white font-bold text-lg">{streak} Day Streak</p>
              <p className="text-gray-400 text-sm">Keep it going!</p>
            </div>
          </div>
        )}

        {/* Play Button */}
        <button
          onClick={handlePlay}
          disabled={isSending || isConfirming}
          className="w-full max-w-xs py-4 bg-primary text-white rounded-xl font-bold text-lg
            hover:bg-primary-dark active:scale-98 transition-all mb-4 disabled:opacity-50"
        >
          {todayStatus === 'unplayed' ? 'Play Today' : 'View Result'}
        </button>

        {/* Wallet status hint */}
        {todayStatus === 'unplayed' && !isConnected && (
          <p className="text-xs text-gray-500 mb-2">
            Connect wallet in Profile to be tracked on-chain
          </p>
        )}

        {/* How to Play */}
        <Link
          href="/how-to-play"
          className="text-primary hover:underline text-sm"
        >
          How to play?
        </Link>
      </main>

      {/* Navigation */}
      <nav className="p-4 border-t border-gray-800">
        <div className="flex justify-around max-w-md mx-auto">
          <Link 
            href="/"
            className="flex flex-col items-center gap-1 text-primary"
          >
            <span className="text-xl">🏠</span>
            <span className="text-xs">Home</span>
          </Link>
          <Link 
            href="/leaderboard"
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-white"
          >
            <span className="text-xl">🏆</span>
            <span className="text-xs">Leaderboard</span>
          </Link>
          <Link 
            href="/profile"
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-white"
          >
            <span className="text-xl">👤</span>
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
