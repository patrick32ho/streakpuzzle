'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useMiniApp } from '@/app/providers/MiniAppProvider';

interface UserStats {
  totalGames: number;
  totalWins: number;
  currentStreak: number;
  bestStreak: number;
  hardModeWins: number;
}

export default function ProfilePage() {
  const { context } = useMiniApp();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    // Load stats from localStorage
    const anonId = localStorage.getItem('grid_of_day_anon_id');
    if (!anonId) return;

    // Aggregate stats from stored game data
    const statsData: UserStats = {
      totalGames: 0,
      totalWins: 0,
      currentStreak: 0,
      bestStreak: 0,
      hardModeWins: 0,
    };

    // Check recent games in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('grid_of_day_') && key !== 'grid_of_day_anon_id') {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '');
          if (data.status === 'won' || data.status === 'lost') {
            statsData.totalGames++;
            if (data.status === 'won') {
              statsData.totalWins++;
              if (data.mode === 'hard') {
                statsData.hardModeWins++;
              }
            }
            if (data.result?.streak) {
              statsData.currentStreak = data.result.streak.current;
              if (data.result.streak.best > statsData.bestStreak) {
                statsData.bestStreak = data.result.streak.best;
              }
            }
          }
        } catch {
          // Ignore parse errors
        }
      }
    }

    setStats(statsData);
  }, []);

  const handleConnect = () => {
    const connector = connectors[0];
    if (connector) {
      connect({ connector });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center">
        <Link 
          href="/"
          className="text-gray-400 hover:text-white p-2 -ml-2"
        >
          ← Back
        </Link>
        <h1 className="flex-1 text-center text-xl font-bold text-white -ml-8">
          Profile
        </h1>
      </header>

      <main className="flex-1 px-4 pb-4">
        {/* User info */}
        <div className="bg-gray-800 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-xl">
              {context?.user?.displayName?.charAt(0) || '?'}
            </div>
            <div>
              <p className="text-white font-medium">
                {context?.user?.displayName || 'Anonymous Player'}
              </p>
              {context?.user?.username && (
                <p className="text-gray-400 text-sm">
                  @{context.user.username}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="bg-gray-800 rounded-xl p-4 mb-4">
            <h2 className="text-white font-medium mb-3">Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-white">{stats.totalGames}</p>
                <p className="text-xs text-gray-400">Games Played</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-success">{stats.totalWins}</p>
                <p className="text-xs text-gray-400">Wins</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-orange-400">{stats.currentStreak}</p>
                <p className="text-xs text-gray-400">Current Streak</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-purple-400">{stats.bestStreak}</p>
                <p className="text-xs text-gray-400">Best Streak</p>
              </div>
            </div>
            {stats.hardModeWins > 0 && (
              <p className="text-center text-sm text-warning mt-3">
                ★ {stats.hardModeWins} Hard Mode {stats.hardModeWins === 1 ? 'Win' : 'Wins'}
              </p>
            )}
          </div>
        )}

        {/* Wallet */}
        <div className="bg-gray-800 rounded-xl p-4 mb-4">
          <h2 className="text-white font-medium mb-3">Wallet</h2>
          {isConnected && address ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                <span className="text-gray-300 font-mono text-sm">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
                <span className="text-success text-sm">Connected</span>
              </div>
              <button
                onClick={() => disconnect()}
                className="w-full py-2 border border-gray-600 text-gray-400 rounded-lg
                  hover:border-gray-500 hover:text-white transition-all"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-gray-400 text-sm">
                Connect your wallet to claim badges and frames onchain.
              </p>
              <button
                onClick={handleConnect}
                className="w-full py-3 bg-primary text-white rounded-lg font-medium
                  hover:bg-primary-dark active:scale-98 transition-all"
              >
                Connect Wallet
              </button>
            </div>
          )}
        </div>

        {/* Badges placeholder */}
        <div className="bg-gray-800 rounded-xl p-4">
          <h2 className="text-white font-medium mb-3">Badges & Frames</h2>
          <p className="text-gray-400 text-sm text-center py-6">
            {isConnected 
              ? 'Your badges and frames will appear here'
              : 'Connect wallet to view and claim rewards'
            }
          </p>
        </div>
      </main>

      {/* Navigation */}
      <nav className="p-4 border-t border-gray-800">
        <div className="flex justify-around max-w-md mx-auto">
          <Link 
            href="/"
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-white"
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
            className="flex flex-col items-center gap-1 text-primary"
          >
            <span className="text-xl">👤</span>
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
