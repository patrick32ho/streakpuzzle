import { createHmac } from 'crypto';
import { TOKEN_IDS, TokenId, SEQUENCE_LENGTH } from './constants';

/**
 * Generate the daily solution using HMAC for security.
 * The solution is deterministic based on dayId but unpredictable without the secret.
 * 
 * @param dayId - The day number (1 = Jan 1, 2024)
 * @param secret - Server-side secret key (DAILY_SECRET env var)
 * @returns Array of 5 token IDs
 */
export function generateDailySolution(dayId: number, secret: string): TokenId[] {
  // Create HMAC signature of the dayId
  const hmac = createHmac('sha256', secret);
  hmac.update(`grid-of-the-day:${dayId}`);
  const hash = hmac.digest('hex');

  const solution: TokenId[] = [];
  
  // Use parts of the hash to select tokens
  // Each token selection uses 2 hex chars (8 bits) for good distribution
  for (let i = 0; i < SEQUENCE_LENGTH; i++) {
    const hexPart = hash.substring(i * 2, i * 2 + 2);
    const num = parseInt(hexPart, 16);
    const tokenIndex = num % TOKEN_IDS.length;
    solution.push(TOKEN_IDS[tokenIndex]);
  }

  return solution;
}

/**
 * Generate a commitment hash for the daily puzzle.
 * This proves the solution existed before players submitted guesses.
 * 
 * @param solution - The solution array
 * @param dayId - The day ID
 * @param salt - Random salt for additional security
 * @returns Commitment hash
 */
export function generatePuzzleCommitment(
  solution: TokenId[],
  dayId: number,
  salt: string
): string {
  const hmac = createHmac('sha256', salt);
  hmac.update(`commitment:${dayId}:${solution.join(',')}`);
  return hmac.digest('hex');
}

/**
 * Generate server signature for daily puzzle metadata.
 * This prevents clients from forging puzzle data.
 */
export function signDailyMetadata(
  dayId: number,
  commitment: string,
  secret: string
): string {
  const hmac = createHmac('sha256', secret);
  hmac.update(`sign:${dayId}:${commitment}`);
  return hmac.digest('hex');
}

/**
 * Verify server signature for daily puzzle metadata.
 */
export function verifyDailySignature(
  dayId: number,
  commitment: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = signDailyMetadata(dayId, commitment, secret);
  return signature === expectedSignature;
}

/**
 * Generate a mint signature for claiming badges/frames.
 * Used to authorize onchain claims.
 */
export function generateMintSignature(
  wallet: string,
  tokenType: 'daily' | 'weekly' | 'frame',
  tokenId: number | string,
  secret: string
): string {
  const hmac = createHmac('sha256', secret);
  hmac.update(`mint:${wallet.toLowerCase()}:${tokenType}:${tokenId}`);
  return hmac.digest('hex');
}
