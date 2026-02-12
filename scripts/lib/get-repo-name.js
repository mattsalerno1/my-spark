import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

function getOriginUrl() {
  try {
    return execSync('git config --get remote.origin.url', { encoding: 'utf-8', cwd: ROOT }).trim();
  } catch {
    throw new Error('Could not get remote.origin.url. Is this a git repo with origin set?');
  }
}

/**
 * Parse owner and repo name from origin URL (HTTPS or SSH).
 * @returns {{ owner: string, repoName: string }}
 * @throws {Error} If remote.origin.url is missing or URL cannot be parsed.
 */
export function getOriginInfo() {
  const origin = getOriginUrl();
  // Matches .../owner/repo or :owner/repo (SSH), optional .git
  const match = origin.match(/[/:]([^/]+)\/([^/]+?)(\.git)?$/);
  if (!match) {
    throw new Error(`Could not parse owner/repo from remote URL: ${origin}`);
  }
  return { owner: match[1], repoName: match[2] };
}

/**
 * Repo name from origin URL (e.g. "my-fork" for .../username/my-fork.git).
 * @returns {string}
 * @throws {Error} If remote.origin.url is missing or URL cannot be parsed.
 */
export function getRepoName() {
  return getOriginInfo().repoName;
}
