#!/usr/bin/env node
/**
 * Watch project files and auto-build, deploy to gh-pages, and commit + push
 * source to the current branch (e.g. main) in one go (debounced).
 * Run: npm run watch:push (or node scripts/watch-and-push.js)
 *
 * Requires: GitHub Pages set to "Deploy from a branch" → gh-pages branch.
 */

import chokidar from 'chokidar';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { getOriginInfo } from './lib/get-repo-name.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const DEBOUNCE_MS = 8000;   // wait 8s after last change before build+deploy (bulk updates)
const COOLDOWN_MS = 15000;  // after a deploy, ignore new triggers for 15s to avoid loops
const COMMIT_MSG = 'chore: auto sync';

let timeout = null;
let cooldownUntil = 0;

function run(cmd, opts = {}) {
  try {
    execSync(cmd, { stdio: 'inherit', cwd: ROOT, ...opts });
    return true;
  } catch {
    return false;
  }
}

function buildAndDeploy() {
  cooldownUntil = Date.now() + COOLDOWN_MS;
  const { owner, repoName } = getOriginInfo();
  const basePath = `/${repoName}/`;
  console.log('\n[watch-and-push] Changes detected, building and deploying...');
  console.log(`[watch-and-push] Building with base: ${basePath}`);
  const buildOk = run('npm run build', { env: { ...process.env, BASE_PATH: basePath } });
  if (!buildOk) {
    console.error('[watch-and-push] Build failed.');
  } else if (run('npx gh-pages -d dist')) {
    console.log('[watch-and-push] Deployed dist to gh-pages.');
    console.log(`[watch-and-push] URL: https://${owner}.github.io/${repoName}/ (use trailing slash)`);
    console.log('[watch-and-push] If you don\'t see changes: Settings → Pages → Source = "Deploy from a branch" → gh-pages');
  } else {
    console.error('[watch-and-push] gh-pages push failed.');
  }

  // Always commit and push source to current branch (even if build failed) so work isn't lost
  run('git add -A');
  const hasStaged = run('git diff --staged --quiet', { stdio: 'pipe' }) === false;
  if (hasStaged) {
    if (run(`git commit -m "${COMMIT_MSG}"`) && run('git push')) {
      console.log('[watch-and-push] Committed and pushed source to current branch.');
    } else {
      console.error('[watch-and-push] Commit or push failed (e.g. push rejected).');
    }
  }

  console.log(`[watch-and-push] Cooldown ${COOLDOWN_MS / 1000}s — further changes will queue until then.\n`);
}

function schedule() {
  if (Date.now() < cooldownUntil) {
    return; // in cooldown, ignore (prevents loop from build writing generated files)
  }
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(buildAndDeploy, DEBOUNCE_MS);
}

// Watch source, config, and projects (avoids node_modules and reduces file handles)
const watchDirs = [
  path.join(ROOT, 'src'),
  path.join(ROOT, 'public'),
  path.join(ROOT, 'projects'),
  path.join(ROOT, '.github'),
  path.join(ROOT, 'index.html'),
  path.join(ROOT, 'vite.config.ts'),
  path.join(ROOT, 'tsconfig.json'),
  path.join(ROOT, 'package.json'),
];

const watcher = chokidar.watch(watchDirs, {
  persistent: true,
  ignoreInitial: true,
  usePolling: true,
  interval: 500,
});

watcher.on('change', (p) => {
  console.log(`[watch] ${path.relative(ROOT, p)}`);
  schedule();
});
watcher.on('add', (p) => {
  console.log(`[watch] + ${path.relative(ROOT, p)}`);
  schedule();
});
watcher.on('unlink', (p) => {
  console.log(`[watch] - ${path.relative(ROOT, p)}`);
  schedule();
});
watcher.on('error', (err) => {
  if (err.code === 'EMFILE') {
    console.error('[watch-and-push] Too many open files. Try: ulimit -n 10240');
  }
  console.error('[watch-and-push]', err.message);
});

function shutdown() {
  if (timeout) clearTimeout(timeout);
  watcher.close();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

const { owner, repoName } = getOriginInfo();
console.log(`[watch-and-push] Watching for changes (debounce ${DEBOUNCE_MS / 1000}s, cooldown ${COOLDOWN_MS / 1000}s after deploy). Will build, deploy to gh-pages, and commit + push source.`);
console.log(`[watch-and-push] Pages URL: https://${owner}.github.io/${repoName}/ (trailing slash required)`);
console.log('[watch-and-push] Require: Settings → Pages → Source = "Deploy from a branch" → branch gh-pages');
console.log('[watch-and-push] Edit files and wait a few seconds to auto-deploy.\n');
