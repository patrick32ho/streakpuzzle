'use client';

import { TOKEN_MAP, TokenId } from '@/lib/puzzle';

interface TokenButtonProps {
  tokenId: TokenId;
  onClick: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showEmoji?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-lg',
  md: 'w-12 h-12 text-2xl',
  lg: 'w-14 h-14 text-3xl',
};

export function TokenButton({
  tokenId,
  onClick,
  disabled = false,
  size = 'md',
  showEmoji = true,
}: TokenButtonProps) {
  const token = TOKEN_MAP[tokenId];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        rounded-lg
        flex items-center justify-center
        transition-all duration-150
        ${disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'active:scale-95 hover:scale-105 shadow-md hover:shadow-lg'
        }
      `}
      style={{ backgroundColor: token.color }}
      aria-label={token.name}
    >
      {showEmoji && <span>{token.emoji}</span>}
    </button>
  );
}
