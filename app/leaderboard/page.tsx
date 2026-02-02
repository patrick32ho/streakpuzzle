'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDayId, formatDayId } from '@/lib/puzzle';
import type { LeaderboardEntry } from '@/lib/db';

type Scope = 'daily' | 'weekly';

export default function LeaderboardPage() {
  const [scope, setScope] = useState<Scope>('daily');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dayId] = useState(getDayId());

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/leaderboard?scope=${scope}&dayId=${dayId}`);
        const data = await res.json();
        setEntries(data.entries || []);
      } catch {
        setEntries([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [scope, dayId]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 
      ? `${minutes}m ${remainingSeconds}s` 
      : `${remainingSeconds}s`;
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
          Leaderboard
        </h1>
      </header>

      {/* Tab switcher */}
      <div className="px-4 mb-4">
        <div className="flex bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setScope('daily')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all
              ${scope === 'daily' 
                ? 'bg-primary text-white' 
                : 'text-gray-400 hover:text-white'
              }`}
          >
            Today {formatDayId(dayId)}
          </button>
          <button
            onClick={() => setScope('weekly')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all
              ${scope === 'weekly' 
                ? 'bg-primary text-white' 
                : 'text-gray-400 hover:text-white'
              }`}
          >
            This Week
          </button>
        </div>
      </div>

      {/* Leaderboard list */}
      <main className="flex-1 px-4 pb-4 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-2">No entries yet</p>
            <p className="text-sm text-gray-500">
              Be the first to solve today&apos;s puzzle!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, idx) => (
              <div
                key={entry.anonId}
                className={`flex items-center gap-3 p-3 rounded-lg
                  ${idx < 3 ? 'bg-gray-800' : 'bg-gray-900'}
                `}
              >
                {/* Rank */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${idx === 0 ? 'bg-yellow-500 text-black' : ''}
                  ${idx === 1 ? 'bg-gray-400 text-black' : ''}
                  ${idx === 2 ? 'bg-amber-700 text-white' : ''}
                  ${idx >= 3 ? 'bg-gray-700 text-gray-400' : ''}
                `}>
                  {idx + 1}
                </div>

                {/* Player info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {entry.displayName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {entry.attemptsUsed}/6 · {formatTime(entry.timeMs)}
                    {entry.mode === 'hard' && ' · ★'}
                  </p>
                </div>

                {/* Streak */}
                {entry.streak > 0 && (
                  <div className="text-sm text-orange-400">
                    🔥 {entry.streak}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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
            className="flex flex-col items-center gap-1 text-primary"
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
