#!/usr/bin/env node
/**
 * Build locally (with correct GitHub Pages base path) and push dist to the
 * gh-pages branch. Use when you want to deploy from your machine instead of
 * GitHub Actions.
 *
 * Requires: GitHub Pages set to "Deploy from a branch" → gh-pages branch.
 * Run: npm run deploy
 */

import { copyFileSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { getOriginInfo } from './lib/get-repo-name.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function run(cmd, opts = {}) {
  execSync(cmd, { stdio: 'inherit', cwd: ROOT, ...opts });
}

const { owner, repoName } = getOriginInfo();
const basePath = `/${repoName}/`;

console.log(`[deploy] Building with base: ${basePath}`);
run(`npm run build`, { env: { ...process.env, BASE_PATH: basePath } });

// GitHub Pages has no SPA fallback: missing paths return 404. Serving our app as
// 404.html means any direct link (e.g. /repo/todo/step1) still loads the SPA
// and React Router can handle the URL.
copyFileSync(path.join(ROOT, 'dist', 'index.html'), path.join(ROOT, 'dist', '404.html'));
console.log('[deploy] Copied index.html → 404.html for client-side route support.');

console.log('[deploy] Pushing dist to gh-pages branch...');
run(`npx gh-pages -d dist`);
console.log('[deploy] Done. Site will update at your GitHub Pages URL shortly.');
console.log(`[deploy] If you use ...github.io/${repoName}/, check: https://${owner}.github.io/${repoName}/`);