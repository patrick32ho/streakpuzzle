'use client';

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  TokenId,
  FeedbackType,
  GameMode,
  GameStatus,
  MAX_ATTEMPTS,
  SEQUENCE_LENGTH,
} from '../puzzle';
import type { DailyMetadata, SubmitResponse } from '../db';

// Local storage keys
const STORAGE_KEY_PREFIX = 'grid_of_day_';
const ANON_ID_KEY = 'grid_of_day_anon_id';

interface GameState {
  dayId: number;
  mode: GameMode;
  currentGuess: TokenId[];
  guessHistory: TokenId[][];
  feedbackHistory: FeedbackType[][];
  status: GameStatus;
  startTime: number | null;
  endTime: number | null;
}

interface StoredGameState extends GameState {
  submitted: boolean;
  result?: SubmitResponse;
}

function getStorageKey(dayId: number): string {
  return `${STORAGE_KEY_PREFIX}${dayId}`;
}

function getAnonId(): string {
  if (typeof window === 'undefined') return '';
  
  let anonId = localStorage.getItem(ANON_ID_KEY);
  if (!anonId) {
    anonId = uuidv4();
    localStorage.setItem(ANON_ID_KEY, anonId);
  }
  return anonId;
}

function loadGameState(dayId: number): StoredGameState | null {
  if (typeof window === 'undefined') return null;
  
  const key = getStorageKey(dayId);
  const stored = localStorage.getItem(key);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function saveGameState(state: StoredGameState): void {
  if (typeof window === 'undefined') return;
  
  const key = getStorageKey(state.dayId);
  localStorage.setItem(key, JSON.stringify(state));
}

export function useGameState() {
  const [anonId, setAnonId] = useState<string>('');
  const [dailyMetadata, setDailyMetadata] = useState<DailyMetadata | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    dayId: 0,
    mode: 'normal',
    currentGuess: [],
    guessHistory: [],
    feedbackHistory: [],
    status: 'playing',
    startTime: null,
    endTime: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Initialize
  useEffect(() => {
    const init = async () => {
      setAnonId(getAnonId());
      
      // Fetch daily metadata
      try {
        const res = await fetch('/api/daily');
        const metadata: DailyMetadata = await res.json();
        setDailyMetadata(metadata);
        
        // Load or initialize game state
        const stored = loadGameState(metadata.dayId);
        if (stored) {
          setGameState({
            dayId: stored.dayId,
            mode: stored.mode,
            currentGuess: stored.currentGuess,
            guessHistory: stored.guessHistory,
            feedbackHistory: stored.feedbackHistory,
            status: stored.status,
            startTime: stored.startTime,
            endTime: stored.endTime,
          });
          setSubmitted(stored.submitted);
          if (stored.result) {
            setResult(stored.result);
          }
        } else {
          setGameState({
            dayId: metadata.dayId,
            mode: 'normal',
            currentGuess: [],
            guessHistory: [],
            feedbackHistory: [],
            status: 'playing',
            startTime: null,
            endTime: null,
          });
        }
      } catch (err) {
        setError('Failed to load daily puzzle');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    init();
  }, []);

  // Save game state whenever it changes
  useEffect(() => {
    if (gameState.dayId > 0) {
      saveGameState({
        ...gameState,
        submitted,
        result: result || undefined,
      });
    }
  }, [gameState, submitted, result]);

  // Add token to current guess
  const addToken = useCallback((token: TokenId) => {
    if (gameState.status !== 'playing') return;
    if (gameState.currentGuess.length >= SEQUENCE_LENGTH) return;
    
    setGameState(prev => {
      const newGuess = [...prev.currentGuess, token];
      return {
        ...prev,
        currentGuess: newGuess,
        startTime: prev.startTime || Date.now(),
      };
    });
  }, [gameState.status, gameState.currentGuess.length]);

  // Remove last token from current guess
  const removeToken = useCallback(() => {
    if (gameState.status !== 'playing') return;
    if (gameState.currentGuess.length === 0) return;
    
    setGameState(prev => ({
      ...prev,
      currentGuess: prev.currentGuess.slice(0, -1),
    }));
  }, [gameState.status, gameState.currentGuess.length]);

  // Clear current guess
  const clearGuess = useCallback(() => {
    if (gameState.status !== 'playing') return;
    
    setGameState(prev => ({
      ...prev,
      currentGuess: [],
    }));
  }, [gameState.status]);

  // Submit current guess
  const submitGuess = useCallback(async () => {
    if (gameState.status !== 'playing') return;
    if (gameState.currentGuess.length !== SEQUENCE_LENGTH) return;
    
    setError(null);
    
    try {
      // Get feedback from server
      const res = await fetch('/api/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayId: gameState.dayId,
          guess: gameState.currentGuess.join(','),
        }),
      });
      
      const data = await res.json();
      
      if (!data.valid) {
        setError(data.error || 'Invalid guess');
        return;
      }
      
      const feedback: FeedbackType[] = data.feedback;
      const solved = data.solved;
      
      const newGuessHistory = [...gameState.guessHistory, [...gameState.currentGuess]];
      const newFeedbackHistory = [...gameState.feedbackHistory, feedback];
      const attemptNumber = newGuessHistory.length;
      
      let newStatus: GameStatus = 'playing';
      let endTime: number | null = null;
      
      if (solved) {
        newStatus = 'won';
        endTime = Date.now();
      } else if (attemptNumber >= MAX_ATTEMPTS) {
        newStatus = 'lost';
        endTime = Date.now();
      }
      
      setGameState(prev => ({
        ...prev,
        currentGuess: [],
        guessHistory: newGuessHistory,
        feedbackHistory: newFeedbackHistory,
        status: newStatus,
        endTime,
      }));
      
    } catch (err) {
      setError('Failed to submit guess');
      console.error(err);
    }
  }, [gameState]);

  // Submit final result
  const submitResult = useCallback(async () => {
    if (gameState.status === 'playing') return;
    if (submitted) return;
    if (!dailyMetadata) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const timeMs = gameState.endTime && gameState.startTime
        ? gameState.endTime - gameState.startTime
        : 0;
      
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anonId,
          dayId: gameState.dayId,
          mode: gameState.mode,
          attemptsUsed: gameState.guessHistory.length,
          solved: gameState.status === 'won',
          timeMs,
          guessHistory: gameState.guessHistory.map(g => g.join(',')),
          dailySignature: dailyMetadata.signature,
        }),
      });
      
      const data: SubmitResponse = await res.json();
      
      if (data.accepted) {
        setResult(data);
        setSubmitted(true);
      } else {
        setError('Failed to submit result');
      }
    } catch (err) {
      setError('Failed to submit result');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }, [gameState, dailyMetadata, anonId, submitted]);

  // Toggle game mode
  const toggleMode = useCallback(() => {
    if (gameState.guessHistory.length > 0) return; // Can't change after starting
    
    setGameState(prev => ({
      ...prev,
      mode: prev.mode === 'normal' ? 'hard' : 'normal',
    }));
  }, [gameState.guessHistory.length]);

  return {
    anonId,
    dayId: gameState.dayId,
    mode: gameState.mode,
    currentGuess: gameState.currentGuess,
    guessHistory: gameState.guessHistory,
    feedbackHistory: gameState.feedbackHistory,
    status: gameState.status,
    startTime: gameState.startTime,
    attemptsUsed: gameState.guessHistory.length,
    attemptsRemaining: MAX_ATTEMPTS - gameState.guessHistory.length,
    isLoading,
    isSubmitting,
    error,
    result,
    submitted,
    addToken,
    removeToken,
    clearGuess,
    submitGuess,
    submitResult,
    toggleMode,
    canSubmitGuess: gameState.currentGuess.length === SEQUENCE_LENGTH && gameState.status === 'playing',
    canToggleMode: gameState.guessHistory.length === 0,
  };
}
