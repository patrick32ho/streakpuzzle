#!/usr/bin/env node

/**
 * Setup Git Hooks
 * Creates a pre-commit hook that runs the secrets check
 */

const fs = require('fs');
const path = require('path');

const HOOKS_DIR = path.join(process.cwd(), '.git', 'hooks');
const PRE_COMMIT_PATH = path.join(HOOKS_DIR, 'pre-commit');

const PRE_COMMIT_SCRIPT = `#!/bin/sh
# Grid of the Day - Pre-commit hook
# Checks for accidental secret commits

echo "Running secrets check..."
npm run secrets:check

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Commit blocked: Potential secrets detected!"
    echo "Review the files above and remove any secrets."
    echo ""
    exit 1
fi

echo "✅ Secrets check passed"
`;

function main() {
  // Check if we're in a git repo
  if (!fs.existsSync(path.join(process.cwd(), '.git'))) {
    console.log('ℹ️  Not a git repository, skipping hook setup');
    return;
  }

  try {
    // Create hooks directory if it doesn't exist
    if (!fs.existsSync(HOOKS_DIR)) {
      fs.mkdirSync(HOOKS_DIR, { recursive: true });
    }

    // Write pre-commit hook
    fs.writeFileSync(PRE_COMMIT_PATH, PRE_COMMIT_SCRIPT, { mode: 0o755 });
    
    console.log('✅ Git pre-commit hook installed');
    console.log('   Secrets will be checked before each commit');
  } catch (error) {
    // Permission error is ok - happens in sandboxed environments
    console.log('ℹ️  Could not install git hook (permission denied)');
    console.log('   You can manually run: npm run secrets:check');
  }
}

main();
