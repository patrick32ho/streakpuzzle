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
    header: "eyJmaWQiOjIzNTA5OTAsInR5cGUiOiJhdXRoIiwia2V5IjoiMHg4MDUwOTYyYjEyMkIzMDFGQjIyM0FCNzMwYUIyRGRFNjNlNTAxZmNmIn0",
    payload: "eyJkb21haW4iOiJzdHJlYWtwdXp6bGUudmVyY2VsLmFwcCJ9",
    signature: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAmAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB2BTmdRwir3LZA3rbg6qA8QOyY4aBeiez7T6vV-5xt2hFOD5xVc1bVGeEWXUc_WNZll_2PYRoUQIMnFq0YJnjCgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAl8ZgIay2xclZzG8RWZzuWvO8j9R0fus3XxDee9lRlVy8dAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD3eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiTVhrVE90UDQzMDlBQU9QSXN0YWdydjhPd2JVUnh3MnFwZ0J0WlFSZDlmZyIsIm9yaWdpbiI6Imh0dHBzOi8va2V5cy5jb2luYmFzZS5jb20iLCJjcm9zc09yaWdpbiI6ZmFsc2UsIm90aGVyX2tleXNfY2FuX2JlX2FkZGVkX2hlcmUiOiJkbyBub3QgY29tcGFyZSBjbGllbnREYXRhSlNPTiBhZ2FpbnN0IGEgdGVtcGxhdGUuIFNlZSBodHRwczovL2dvby5nbC95YWJQZXgifQAAAAAAAAAAAA"
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
