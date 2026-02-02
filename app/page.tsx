'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMiniApp } from './providers/MiniAppProvider';
import { getDayId, formatDayId } from '@/lib/puzzle';

export default function Home() {
  const { context } = useMiniApp();
  const router = useRouter();
  const [dayId, setDayId] = useState(0);
  const [todayStatus, setTodayStatus] = useState<'unplayed' | 'solved' | 'failed'>('unplayed');
  const [streak, setStreak] = useState(0);

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

  const handlePlay = () => {
    router.push('/play');
  };

  return (
    <div className="min-h-screen flex flex-col">
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
                key={i}
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
          className="w-full max-w-xs py-4 bg-primary text-white rounded-xl font-bold text-lg
            hover:bg-primary-dark active:scale-98 transition-all mb-4"
        >
          {todayStatus === 'unplayed' ? 'Play Today' : 'View Result'}
        </button>

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
