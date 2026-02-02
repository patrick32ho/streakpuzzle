'use client';

import { TOKEN_MAP, TokenId, FeedbackType, FEEDBACK_COLORS, SEQUENCE_LENGTH } from '@/lib/puzzle';

interface GuessRowProps {
  guess: TokenId[];
  feedback?: FeedbackType[];
  isCurrentRow?: boolean;
  animate?: boolean;
}

export function GuessRow({
  guess,
  feedback,
  isCurrentRow = false,
  animate = false,
}: GuessRowProps) {
  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: SEQUENCE_LENGTH }).map((_, idx) => {
        const tokenId = guess[idx];
        const fb = feedback?.[idx];
        const token = tokenId ? TOKEN_MAP[tokenId] : null;
        
        return (
          <div
            key={idx}
            className={`
              w-12 h-12 sm:w-14 sm:h-14
              rounded-lg
              flex items-center justify-center
              text-2xl sm:text-3xl
              border-2
              transition-all duration-200
              ${!token && isCurrentRow ? 'border-gray-500 border-dashed' : 'border-transparent'}
              ${animate && fb ? 'animate-flip' : ''}
            `}
            style={{
              backgroundColor: fb 
                ? FEEDBACK_COLORS[fb] 
                : token 
                  ? token.color 
                  : 'rgba(255,255,255,0.1)',
              animationDelay: animate ? `${idx * 100}ms` : '0ms',
            }}
          >
            {token && <span>{token.emoji}</span>}
          </div>
        );
      })}
    </div>
  );
}
