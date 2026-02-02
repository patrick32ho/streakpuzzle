'use client';

import Link from 'next/link';
import { TOKENS, FEEDBACK_EMOJI, FEEDBACK_COLORS, MAX_ATTEMPTS, SEQUENCE_LENGTH } from '@/lib/puzzle';

export default function HowToPlayPage() {
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
          How to Play
        </h1>
      </header>

      <main className="flex-1 px-4 pb-8 overflow-auto">
        {/* Intro */}
        <section className="mb-8">
          <p className="text-gray-300 leading-relaxed">
            Guess the secret {SEQUENCE_LENGTH}-token sequence in {MAX_ATTEMPTS} tries.
            A new puzzle appears every day!
          </p>
        </section>

        {/* Token set */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-white mb-3">The Tokens</h2>
          <p className="text-gray-400 text-sm mb-3">
            Each puzzle uses these 8 tokens:
          </p>
          <div className="flex flex-wrap gap-2">
            {TOKENS.map(token => (
              <div
                key={token.id}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                style={{ backgroundColor: token.color }}
              >
                {token.emoji}
              </div>
            ))}
          </div>
        </section>

        {/* Feedback */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-white mb-3">Feedback</h2>
          <p className="text-gray-400 text-sm mb-3">
            After each guess, each token shows feedback:
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                style={{ backgroundColor: FEEDBACK_COLORS.correct }}
              >
                🔴
              </div>
              <div>
                <p className="text-white font-medium">
                  Green {FEEDBACK_EMOJI.correct}
                </p>
                <p className="text-gray-400 text-sm">
                  Correct token in correct position
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                style={{ backgroundColor: FEEDBACK_COLORS.wrongPos }}
              >
                🔵
              </div>
              <div>
                <p className="text-white font-medium">
                  Yellow {FEEDBACK_EMOJI.wrongPos}
                </p>
                <p className="text-gray-400 text-sm">
                  Token exists but in wrong position
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                style={{ backgroundColor: FEEDBACK_COLORS.absent }}
              >
                🟡
              </div>
              <div>
                <p className="text-white font-medium">
                  Gray {FEEDBACK_EMOJI.absent}
                </p>
                <p className="text-gray-400 text-sm">
                  Token is not in the solution
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Duplicates */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-white mb-3">Duplicates</h2>
          <p className="text-gray-400 text-sm">
            Tokens can appear multiple times in the solution. 
            Feedback accounts for this: each occurrence in your guess 
            is matched against available occurrences in the solution.
          </p>
        </section>

        {/* Hard Mode */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-white mb-3">Hard Mode ★</h2>
          <p className="text-gray-400 text-sm">
            In Hard Mode, you must use revealed hints in subsequent guesses:
          </p>
          <ul className="text-gray-400 text-sm mt-2 list-disc list-inside space-y-1">
            <li>Green tokens must stay in the same position</li>
            <li>Yellow tokens must be included somewhere</li>
          </ul>
        </section>

        {/* Streaks & Rewards */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-white mb-3">Streaks & Rewards</h2>
          <p className="text-gray-400 text-sm mb-3">
            Build your streak by solving puzzles on consecutive days.
            Connect your wallet to claim:
          </p>
          <ul className="text-gray-400 text-sm list-disc list-inside space-y-1">
            <li>Daily completion badges (non-transferable)</li>
            <li>7, 14, 30-day streak badges</li>
            <li>Special frames for exceptional performance</li>
          </ul>
        </section>

        {/* CTA */}
        <Link
          href="/play"
          className="block w-full py-4 bg-primary text-white text-center rounded-xl font-bold
            hover:bg-primary-dark active:scale-98 transition-all"
        >
          Play Now
        </Link>
      </main>
    </div>
  );
}
