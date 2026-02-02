'use client';

import { TOKENS, TokenId } from '@/lib/puzzle';
import { TokenButton } from './TokenButton';

interface TokenPickerProps {
  onSelect: (tokenId: TokenId) => void;
  onBackspace: () => void;
  onClear: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  disabled?: boolean;
}

export function TokenPicker({
  onSelect,
  onBackspace,
  onClear,
  onSubmit,
  canSubmit,
  disabled = false,
}: TokenPickerProps) {
  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Token grid - 4x2 */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {TOKENS.map(token => (
          <TokenButton
            key={token.id}
            tokenId={token.id}
            onClick={() => onSelect(token.id)}
            disabled={disabled}
            size="lg"
          />
        ))}
      </div>
      
      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={onClear}
          disabled={disabled}
          className="flex-1 py-3 px-4 bg-gray-700 text-white rounded-lg font-semibold
            hover:bg-gray-600 active:scale-98 transition-all disabled:opacity-50"
        >
          Clear
        </button>
        <button
          onClick={onBackspace}
          disabled={disabled}
          className="py-3 px-6 bg-gray-700 text-white rounded-lg font-semibold
            hover:bg-gray-600 active:scale-98 transition-all disabled:opacity-50"
        >
          ⌫
        </button>
        <button
          onClick={onSubmit}
          disabled={disabled || !canSubmit}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all
            ${canSubmit && !disabled
              ? 'bg-primary text-white hover:bg-primary-dark active:scale-98'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
