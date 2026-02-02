# Grid of the Day

A viral daily puzzle game for Base App - think Wordle meets Mastermind, but with colors!

Guess the secret 5-token sequence in 6 attempts. Build streaks, climb leaderboards, and earn onchain badges.

## Features

- **Daily Puzzle**: New puzzle every day at midnight UTC
- **Language-agnostic**: Uses colors/shapes instead of letters
- **Streak System**: Build consecutive day streaks
- **Leaderboards**: Daily and weekly rankings
- **Viral Sharing**: Share your results as emoji grids
- **Hard Mode**: For the extra challenge
- **Onchain Rewards** (optional):
  - Daily completion badges (soulbound)
  - 7/14/30-day streak badges
  - Cosmetic frames

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Platform**: Base App Mini App (Farcaster SDK)
- **Blockchain**: Base (Sepolia for testnet)
- **Contracts**: Solidity, Hardhat, OpenZeppelin

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and set your secrets:

```bash
# Generate secure random secrets
node -e "console.log('DAILY_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('COMMITMENT_SALT=' + require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Test in Base App

1. Deploy to Vercel or another hosting provider
2. Configure the manifest at `/.well-known/farcaster.json`
3. Use [base.dev/preview](https://base.dev/preview) to test
4. Post your app URL to Base App to publish

## Project Structure

```
grid-of-the-day/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── daily/         # GET daily puzzle metadata
│   │   ├── guess/         # POST validate a guess
│   │   ├── submit/        # POST submit final result
│   │   ├── leaderboard/   # GET leaderboard data
│   │   └── og/            # OG image generation
│   ├── components/        # React components
│   │   └── game/          # Game-specific components
│   ├── providers/         # Context providers
│   ├── play/              # Game page
│   ├── leaderboard/       # Leaderboard page
│   ├── profile/           # Profile page
│   └── how-to-play/       # Instructions
├── lib/                   # Shared utilities
│   ├── puzzle/            # Puzzle logic & algorithms
│   ├── db/                # Database utilities
│   ├── hooks/             # React hooks
│   └── contracts/         # Contract ABIs & addresses
├── contracts/             # Solidity smart contracts
├── scripts/               # Deploy & utility scripts
└── public/                # Static assets
```

## Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_URL` | Your app's public URL |
| `DAILY_SECRET` | Secret for puzzle generation (32 bytes hex) |
| `COMMITMENT_SALT` | Salt for puzzle commitment (32 bytes hex) |

### Optional (for onchain features)

| Variable | Description |
|----------|-------------|
| `SERVER_SIGNER_PRIVATE_KEY` | Private key for signing claims |
| `DEPLOYER_PRIVATE_KEY` | Private key for contract deployment |
| `NEXT_PUBLIC_CHAIN_ID` | `84532` (Sepolia) or `8453` (Mainnet) |
| `NEXT_PUBLIC_CONTRACT_BADGES` | GridBadges contract address |
| `NEXT_PUBLIC_CONTRACT_FRAMES` | GridFrames contract address |
| `BASESCAN_API_KEY` | For contract verification |

## Deploying Contracts

### 1. Compile Contracts

```bash
npx hardhat compile
```

### 2. Deploy to Base Sepolia

```bash
npx hardhat run scripts/deploy.ts --network baseSepolia
```

### 3. Update Environment

After deployment, set the contract addresses in your environment:

```bash
NEXT_PUBLIC_CONTRACT_BADGES=0x...
NEXT_PUBLIC_CONTRACT_FRAMES=0x...
```

## Security

### Secrets Safety

**NEVER commit secrets to git!** This repo is designed to be safe for public GitHub:

1. All secrets are in `.env.example` with placeholder values
2. `.gitignore` excludes all `.env*` files
3. Pre-commit hook runs `npm run secrets:check`
4. Daily solutions are generated server-side using HMAC

### Secret Types

| Secret | Purpose | Storage |
|--------|---------|---------|
| `DAILY_SECRET` | Generates unpredictable solutions | Vercel/hosting env |
| `COMMITMENT_SALT` | Puzzle verification | Vercel/hosting env |
| `SERVER_SIGNER_PRIVATE_KEY` | Signs onchain claims | Vercel/hosting env |
| `DEPLOYER_PRIVATE_KEY` | Contract deployment only | Local only |

### If Secrets Are Leaked

1. Immediately rotate the leaked secret
2. Redeploy contracts if `SERVER_SIGNER_PRIVATE_KEY` was exposed
3. Update all environments with new values

## Publishing to GitHub

```bash
# Initialize git (if not already)
git init

# Add files (secrets check runs automatically)
git add .

# Commit
git commit -m "Initial commit: Grid of the Day"

# Create GitHub repo and push
gh repo create grid-of-the-day --public
git push -u origin main
```

**Important**: NEVER add `.env` files to git!

## Publishing to Base App

1. Deploy to production (Vercel recommended)
2. Set all environment variables in Vercel dashboard
3. Get your `accountAssociation` credentials:
   - Go to [base.dev/preview?tab=account](https://base.dev/preview?tab=account)
   - Enter your app URL
   - Sign with your wallet
   - Copy the credentials to `farcaster.config.ts`
4. Redeploy after updating the config
5. Test with [base.dev/preview](https://base.dev/preview)
6. Post your app URL to Base App to publish!

## Game Rules

### How to Play

1. Each day there's a new secret 5-token sequence
2. You have 6 attempts to guess it
3. After each guess, you get feedback:
   - 🟩 **Green**: Token is correct and in the right position
   - 🟨 **Yellow**: Token is in the solution but wrong position
   - ⬛ **Gray**: Token is not in the solution

### Token Set

The game uses 8 tokens:
🔴 🟠 🟡 🟢 🔵 🟣 ⚫ ⚪

### Hard Mode

In Hard Mode, you must use revealed hints:
- Green tokens must stay in their position
- Yellow tokens must be included in your guess

### Duplicates

Tokens can appear multiple times. Feedback handles duplicates correctly (Wordle-style).

## API Reference

### GET /api/daily

Returns today's puzzle metadata (without solution).

```json
{
  "dayId": 123,
  "tokenSetVersion": 1,
  "puzzleCommitment": "abc123...",
  "issuedAt": 1704067200000,
  "signature": "def456..."
}
```

### POST /api/guess

Validate a single guess and get feedback.

```json
// Request
{ "dayId": 123, "guess": "R,G,B,Y,P" }

// Response
{ "valid": true, "feedback": ["correct", "wrongPos", "absent", "absent", "correct"], "solved": false }
```

### POST /api/submit

Submit final game result.

```json
// Request
{
  "anonId": "uuid",
  "dayId": 123,
  "mode": "normal",
  "attemptsUsed": 4,
  "solved": true,
  "timeMs": 45000,
  "guessHistory": ["R,G,B,Y,P", "R,G,B,Y,P", ...],
  "dailySignature": "..."
}

// Response
{
  "accepted": true,
  "solved": true,
  "attemptsUsed": 4,
  "rank": 42,
  "percentile": 85,
  "streak": { "current": 7, "best": 14 },
  "claimable": { "dailyBadge": true, "weeklyStreakBadge": 7 },
  "share": { "emojiGridText": "...", "shareLink": "..." }
}
```

### GET /api/leaderboard

Get leaderboard entries.

```
GET /api/leaderboard?scope=daily&dayId=123
GET /api/leaderboard?scope=weekly&dayId=123
```

## License

MIT

## Credits

Built for Base App hackathon. Inspired by Wordle and Mastermind.
