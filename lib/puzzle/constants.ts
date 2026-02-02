/**
 * Token definitions for the Grid of the Day puzzle
 * 8 distinct tokens represented as emoji and color values
 */
export const TOKENS = [
  { id: 'R', emoji: '🔴', name: 'Red', color: '#EF4444' },
  { id: 'O', emoji: '🟠', name: 'Orange', color: '#F97316' },
  { id: 'Y', emoji: '🟡', name: 'Yellow', color: '#EAB308' },
  { id: 'G', emoji: '🟢', name: 'Green', color: '#22C55E' },
  { id: 'B', emoji: '🔵', name: 'Blue', color: '#3B82F6' },
  { id: 'P', emoji: '🟣', name: 'Purple', color: '#A855F7' },
  { id: 'K', emoji: '⚫', name: 'Black', color: '#171717' },
  { id: 'W', emoji: '⚪', name: 'White', color: '#F5F5F5' },
] as const;

export type TokenId = typeof TOKENS[number]['id'];

export const TOKEN_IDS = TOKENS.map(t => t.id) as TokenId[];

export const TOKEN_MAP = Object.fromEntries(
  TOKENS.map(t => [t.id, t])
) as Record<TokenId, typeof TOKENS[number]>;

// Game constants
export const SEQUENCE_LENGTH = 5;
export const MAX_ATTEMPTS = 6;

// Feedback types
export type FeedbackType = 'correct' | 'wrongPos' | 'absent';

export const FEEDBACK_EMOJI: Record<FeedbackType, string> = {
  correct: '🟩',
  wrongPos: '🟨',
  absent: '⬛',
};

export const FEEDBACK_COLORS: Record<FeedbackType, string> = {
  correct: '#22C55E',
  wrongPos: '#EAB308',
  absent: '#6B7280',
};

// Game modes
export type GameMode = 'normal' | 'hard';

// Game status
export type GameStatus = 'playing' | 'won' | 'lost';

// Day ID utilities
export function getDayId(date: Date = new Date()): number {
  // Use UTC date to ensure consistency across timezones
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  // Base date: Jan 1, 2024
  const baseDate = new Date(Date.UTC(2024, 0, 1));
  const diffTime = utcDate.getTime() - baseDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Day 1 = Jan 1, 2024
}

export function formatDayId(dayId: number): string {
  return `#${dayId}`;
}
