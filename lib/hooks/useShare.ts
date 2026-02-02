'use client';

import { useCallback, useState } from 'react';
import type { SubmitResponse } from '../db';

export function useShare() {
  const [copied, setCopied] = useState(false);

  const share = useCallback(async (result: SubmitResponse) => {
    const text = `${result.share.emojiGridText}\n\nPlay today: ${result.share.shareLink}`;

    // Try Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Grid of the Day',
          text,
          url: result.share.shareLink,
        });
        return true;
      } catch {
        // User cancelled or share failed, fall through to clipboard
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch {
      return false;
    }
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch {
      return false;
    }
  }, []);

  return { share, copyToClipboard, copied };
}
