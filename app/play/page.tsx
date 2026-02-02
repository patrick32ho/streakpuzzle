'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGameState, useShare } from '@/lib/hooks';
import {
  GameBoard,
  GameHeader,
  TokenPicker,
  ResultCard,
} from '@/app/components/game';

export default function PlayPage() {
  const _router = useRouter();
  const {
    dayId,
    mode,
    currentGuess,
    guessHistory,
    feedbackHistory,
    status,
    attemptsUsed,
    attemptsRemaining,
    isLoading,
    error,
    result,
    submitted,
    addToken,
    removeToken,
    clearGuess,
    submitGuess,
    submitResult,
    toggleMode,
    canSubmitGuess,
    canToggleMode,
  } = useGameState();
  
  const { share, copyToClipboard, copied } = useShare();

  // Auto-submit result when game ends
  useEffect(() => {
    if (status !== 'playing' && !submitted) {
      submitResult();
    }
  }, [status, submitted, submitResult]);

  const handleShare = () => {
    if (result) {
      share(result);
    }
  };

  const handleCopy = () => {
    if (result) {
      copyToClipboard(`${result.share.emojiGridText}\n\nPlay today: ${result.share.shareLink}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading puzzle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <Link 
          href="/"
          className="text-gray-400 hover:text-white p-2 -ml-2"
        >
          ← Back
        </Link>
        <Link 
          href="/how-to-play"
          className="text-gray-400 hover:text-white p-2 -mr-2"
        >
          ?
        </Link>
      </header>

      {/* Main game area */}
      <main className="flex-1 flex flex-col items-center px-4 pb-4">
        {status === 'playing' ? (
          <>
            {/* Game header */}
            <GameHeader
              dayId={dayId}
              mode={mode}
              attemptsUsed={attemptsUsed}
              attemptsRemaining={attemptsRemaining}
              canToggleMode={canToggleMode}
              onToggleMode={toggleMode}
            />

            {/* Game board */}
            <div className="flex-1 flex items-center py-4">
              <GameBoard
                currentGuess={currentGuess}
                guessHistory={guessHistory}
                feedbackHistory={feedbackHistory}
              />
            </div>

            {/* Error message */}
            {error && (
              <p className="text-error text-sm mb-4 animate-shake">
                {error}
              </p>
            )}

            {/* Token picker */}
            <TokenPicker
              onSelect={addToken}
              onBackspace={removeToken}
              onClear={clearGuess}
              onSubmit={submitGuess}
              canSubmit={canSubmitGuess}
            />
          </>
        ) : (
          /* Result view */
          <div className="flex-1 flex items-center py-4">
            <ResultCard
              status={status}
              result={result}
              attemptsUsed={attemptsUsed}
              onShare={handleShare}
              onCopy={handleCopy}
              copied={copied}
            />
          </div>
        )}
      </main>
    </div>
  );
}
