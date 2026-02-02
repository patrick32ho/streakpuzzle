#!/usr/bin/env node

/**
 * Secrets Check Script
 * Scans the repository for common secret patterns to prevent accidental commits.
 * Run: npm run secrets:check
 */

const fs = require('fs');
const path = require('path');

// Patterns that might indicate secrets
const SECRET_PATTERNS = [
  // Private key patterns
  /-----BEGIN (RSA |EC |DSA |OPENSSH |PGP |)PRIVATE KEY-----/i,
  /-----BEGIN ENCRYPTED PRIVATE KEY-----/i,
  
  // Ethereum/crypto private keys (64 hex chars, often with 0x prefix)
  /['"`]0x[a-fA-F0-9]{64}['"`]/,
  
  // Generic API keys and tokens
  /['"`]sk_live_[a-zA-Z0-9]{24,}['"`]/i,  // Stripe live keys
  /['"`]pk_live_[a-zA-Z0-9]{24,}['"`]/i,  // Stripe live keys
  /['"`]ghp_[a-zA-Z0-9]{36}['"`]/,        // GitHub personal tokens
  /['"`]gho_[a-zA-Z0-9]{36}['"`]/,        // GitHub OAuth tokens
  /['"`]github_pat_[a-zA-Z0-9_]{22,}['"`]/i, // GitHub PATs
  
  // AWS
  /['"`]AKIA[0-9A-Z]{16}['"`]/,           // AWS access key IDs
  /['"`][a-zA-Z0-9/+=]{40}['"`]/,         // AWS secret keys (base64-ish, 40 chars)
  
  // Generic patterns
  /password\s*[:=]\s*['"`][^'"`\s]{8,}['"`]/i,
  /secret\s*[:=]\s*['"`][^'"`\s]{16,}['"`]/i,
  /api[_-]?key\s*[:=]\s*['"`][^'"`\s]{16,}['"`]/i,
  
  // Base64 encoded secrets (long base64 strings that might be secrets)
  /['"`][a-zA-Z0-9+/]{50,}={0,2}['"`]/,
];

// Files/directories to ignore
const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  '.next',
  'build',
  'dist',
  'coverage',
  'artifacts',
  'cache',
  '*.min.js',
  '*.min.css',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  '*.map',
  '*.png',
  '*.jpg',
  '*.jpeg',
  '*.gif',
  '*.svg',
  '*.ico',
  '*.woff',
  '*.woff2',
  '*.ttf',
  '*.eot',
];

// Known false positives to skip
const FALSE_POSITIVES = [
  'CHANGEME',
  'YOUR_KEY_HERE',
  'your-domain',
  'example.com',
  'localhost',
  '0x0000000000000000000000000000000000000000000000000000000000000001', // Hardhat default
  'BEGIN ENCRYPTED PRIVATE KEY', // Pattern in this script itself
  'BEGIN (RSA', // Pattern in this script itself
];

function shouldIgnore(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  return IGNORE_PATTERNS.some(pattern => {
    if (pattern.startsWith('*.')) {
      return normalized.endsWith(pattern.slice(1));
    }
    return normalized.includes(pattern);
  });
}

function isFalsePositive(match) {
  return FALSE_POSITIVES.some(fp => match.includes(fp));
}

function scanFile(filePath) {
  const issues = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, lineNum) => {
      SECRET_PATTERNS.forEach((pattern, patternIdx) => {
        const match = line.match(pattern);
        if (match && !isFalsePositive(match[0])) {
          issues.push({
            file: filePath,
            line: lineNum + 1,
            pattern: patternIdx,
            match: match[0].slice(0, 50) + (match[0].length > 50 ? '...' : ''),
          });
        }
      });
    });
  } catch (error) {
    // Skip files we can't read (binary, etc.)
  }
  
  return issues;
}

function walkDir(dir, results = []) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (shouldIgnore(fullPath)) {
        continue;
      }
      
      if (entry.isDirectory()) {
        walkDir(fullPath, results);
      } else if (entry.isFile()) {
        results.push(fullPath);
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }
  
  return results;
}

function main() {
  console.log('🔍 Scanning repository for potential secrets...\n');
  
  const rootDir = process.cwd();
  const files = walkDir(rootDir);
  
  console.log(`Scanning ${files.length} files...\n`);
  
  let allIssues = [];
  
  for (const file of files) {
    const issues = scanFile(file);
    allIssues = allIssues.concat(issues);
  }
  
  if (allIssues.length === 0) {
    console.log('✅ No potential secrets found!\n');
    console.log('Remember:');
    console.log('  - Never commit .env files');
    console.log('  - Use environment variables in production');
    console.log('  - Rotate keys if they were ever exposed');
    process.exit(0);
  } else {
    console.log(`⚠️  Found ${allIssues.length} potential secret(s):\n`);
    
    allIssues.forEach(issue => {
      const relativePath = path.relative(rootDir, issue.file);
      console.log(`  📄 ${relativePath}:${issue.line}`);
      console.log(`     Match: ${issue.match}`);
      console.log('');
    });
    
    console.log('Please review these files and ensure no real secrets are committed.');
    console.log('If these are false positives, update scripts/check-secrets.js\n');
    
    // Exit with error for CI/CD
    process.exit(1);
  }
}

main();
