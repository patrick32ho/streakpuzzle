import { TokenId, SEQUENCE_LENGTH, FeedbackType } from './constants';

/**
 * Wordle-style feedback algorithm with proper duplicate handling.
 * 
 * Algorithm:
 * 1. First pass: Mark exact matches (correct position) as 'correct'
 * 2. Second pass: For remaining guessed tokens, check if they exist
 *    in unmatched solution positions (handle duplicates correctly)
 * 
 * @param guess - Array of 5 token IDs guessed by the player
 * @param solution - Array of 5 token IDs (the secret)
 * @returns Array of 5 feedback types
 */
export function calculateFeedback(
  guess: TokenId[],
  solution: TokenId[]
): FeedbackType[] {
  if (guess.length !== SEQUENCE_LENGTH || solution.length !== SEQUENCE_LENGTH) {
    throw new Error(`Both guess and solution must have ${SEQUENCE_LENGTH} tokens`);
  }

  const feedback: FeedbackType[] = new Array(SEQUENCE_LENGTH).fill('absent');
  
  // Track which solution positions have been "used" for feedback
  const solutionUsed: boolean[] = new Array(SEQUENCE_LENGTH).fill(false);
  
  // Track which guess positions have been evaluated
  const guessEvaluated: boolean[] = new Array(SEQUENCE_LENGTH).fill(false);

  // First pass: Find exact matches (correct position)
  for (let i = 0; i < SEQUENCE_LENGTH; i++) {
    if (guess[i] === solution[i]) {
      feedback[i] = 'correct';
      solutionUsed[i] = true;
      guessEvaluated[i] = true;
    }
  }

  // Second pass: Find wrong position matches
  // For each unevaluated guess token, check if it exists in an unused solution position
  for (let i = 0; i < SEQUENCE_LENGTH; i++) {
    if (guessEvaluated[i]) continue; // Skip already matched

    const guessedToken = guess[i];
    
    // Look for this token in unused solution positions
    for (let j = 0; j < SEQUENCE_LENGTH; j++) {
      if (solutionUsed[j]) continue; // Skip already used solution positions
      
      if (solution[j] === guessedToken) {
        // Found a match in wrong position
        feedback[i] = 'wrongPos';
        solutionUsed[j] = true; // Mark this solution position as used
        break; // Only count once per guess position
      }
    }
    // If no match found, feedback remains 'absent'
  }

  return feedback;
}

/**
 * Check if the guess is completely correct
 */
export function isWinningGuess(feedback: FeedbackType[]): boolean {
  return feedback.every(f => f === 'correct');
}

/**
 * Convert guess array to string representation
 */
export function guessToString(guess: TokenId[]): string {
  return guess.join(',');
}

/**
 * Parse string representation back to guess array
 */
export function stringToGuess(str: string): TokenId[] {
  return str.split(',') as TokenId[];
}

/**
 * Validate hard mode constraints
 * In hard mode, any revealed hints must be used in subsequent guesses:
 * - 'correct' tokens must stay in the same position
 * - 'wrongPos' tokens must be included somewhere in the guess
 */
export function validateHardMode(
  previousGuesses: TokenId[][],
  previousFeedbacks: FeedbackType[][],
  newGuess: TokenId[]
): { valid: boolean; error?: string } {
  for (let attemptIdx = 0; attemptIdx < previousGuesses.length; attemptIdx++) {
    const prevGuess = previousGuesses[attemptIdx];
    const prevFeedback = previousFeedbacks[attemptIdx];

    for (let i = 0; i < SEQUENCE_LENGTH; i++) {
      // Check 'correct' constraint: token must stay in same position
      if (prevFeedback[i] === 'correct') {
        if (newGuess[i] !== prevGuess[i]) {
          return {
            valid: false,
            error: `Position ${i + 1} must be ${prevGuess[i]} (revealed as correct)`,
          };
        }
      }

      // Check 'wrongPos' constraint: token must be included somewhere
      if (prevFeedback[i] === 'wrongPos') {
        if (!newGuess.includes(prevGuess[i])) {
          return {
            valid: false,
            error: `Guess must include ${prevGuess[i]} (revealed as present)`,
          };
        }
        // Also ensure it's not in the same wrong position
        if (newGuess[i] === prevGuess[i]) {
          return {
            valid: false,
            error: `${prevGuess[i]} cannot be in position ${i + 1} (revealed as wrong position)`,
          };
        }
      }
    }
  }

  return { valid: true };
}
