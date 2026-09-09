#!/usr/bin/env node
// scripts/deploy-gh-pages.mjs
// Copies the built dist/ into the gh-pages branch and pushes to trigger GitHub Pages.
// Run via: npm run deploy

import { execSync } from 'child_process';
import { cpSync, rmSync, existsSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';

const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'dist');
const worktreeDir = join(root, '..', '_gh_pages_deploy_tmp');

const run = (cmd, cwd = root) => {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit' });
};

try {
  // 1. Remove old worktree if it exists
  if (existsSync(worktreeDir)) {
    run(`git worktree remove "${worktreeDir}" --force`);
  }

  // 2. Create a fresh worktree for gh-pages
  run(`git fetch origin gh-pages`);
  run(`git worktree add "${worktreeDir}" gh-pages`);

  // 3. Remove old JS/CSS assets from gh-pages (keep images/audio/etc.)
  const ghAssets = join(worktreeDir, 'assets');
  if (existsSync(ghAssets)) {
    // Only delete .js and .css files — preserve images/webp/png/audio
    const { readdirSync, statSync, unlinkSync } = await import('fs');
    for (const file of readdirSync(ghAssets)) {
      if (file.endsWith('.js') || file.endsWith('.css')) {
        unlinkSync(join(ghAssets, file));
      }
    }
  } else {
    mkdirSync(ghAssets, { recursive: true });
  }

  // 4. Copy new dist into the worktree
  cpSync(join(dist, 'index.html'), join(worktreeDir, 'index.html'), { force: true });
  cpSync(join(dist, 'assets'), ghAssets, { recursive: true, force: true });

  // 5. Commit and push gh-pages
  run('git add -A', worktreeDir);
  try {
    run('git commit -m "deploy: sync dist to gh-pages"', worktreeDir);
  } catch {
    console.log('Nothing to commit on gh-pages.');
  }
  run('git push origin gh-pages --force', worktreeDir);

  console.log('\n✅ gh-pages deployed successfully!');
} finally {
  // 6. Clean up worktree
  try {
    run(`git worktree remove "${worktreeDir}" --force`);
  } catch {}
}
