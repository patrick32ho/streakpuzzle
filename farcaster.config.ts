const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

/**
 * Grid of the Day - MiniApp configuration
 * Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://docs.base.org/mini-apps/core-concepts/manifest}
 */
export const farcasterConfig = {
  accountAssociation: {
    // TODO: Generate these values using the Base Build Account Association tool
    // https://www.base.dev/preview?tab=account
    header: "",
    payload: "",
    signature: ""
  },
  miniapp: {
    version: "1",
    name: "Grid of the Day", 
    subtitle: "Daily Streak Puzzle", 
    description: "A Wordle-like daily puzzle with colors. Guess the 5-token sequence in 6 tries. Build streaks, climb leaderboards, earn badges!",
    screenshotUrls: [
      `${ROOT_URL}/screenshots/game.png`,
      `${ROOT_URL}/screenshots/result.png`,
      `${ROOT_URL}/screenshots/leaderboard.png`
    ],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#0a0a0a",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "games",
    tags: ["puzzle", "daily", "wordle", "streak", "game"],
    heroImageUrl: `${ROOT_URL}/hero.png`, 
    tagline: "Guess the daily code!",
    ogTitle: "Grid of the Day",
    ogDescription: "A viral daily puzzle game. Guess the 5-token code in 6 tries!",
    ogImageUrl: `${ROOT_URL}/api/og/today`,
  },
} as const;
