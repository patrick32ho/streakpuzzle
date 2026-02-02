'use client';

import { TokenId, FeedbackType, MAX_ATTEMPTS } from '@/lib/puzzle';
import { GuessRow } from './GuessRow';

interface GameBoardProps {
  currentGuess: TokenId[];
  guessHistory: TokenId[][];
  feedbackHistory: FeedbackType[][];
}

export function GameBoard({
  currentGuess,
  guessHistory,
  feedbackHistory,
}: GameBoardProps) {
  const currentRowIdx = guessHistory.length;
  
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIdx) => {
        const isCurrentRow = rowIdx === currentRowIdx;
        const isPastRow = rowIdx < currentRowIdx;
        
        let guess: TokenId[] = [];
        let feedback: FeedbackType[] | undefined;
        
        if (isPastRow) {
          guess = guessHistory[rowIdx];
          feedback = feedbackHistory[rowIdx];
        } else if (isCurrentRow) {
          guess = currentGuess;
        }
        
        return (
          <GuessRow
            key={rowIdx}
            guess={guess}
            feedback={feedback}
            isCurrentRow={isCurrentRow}
            animate={isPastRow && rowIdx === currentRowIdx - 1}
          />
        );
      })}
    </div>
  );
}
