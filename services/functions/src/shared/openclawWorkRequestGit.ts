import {execFile} from 'node:child_process';
import {mkdir, mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {basename, dirname, join, posix} from 'node:path';
import {promisify} from 'node:util';

const execFileAsync = promisify(execFile);
const DEFAULT_BRANCH = 'main';
const DEFAULT_DOCS_DIR = 'wr';
const DEFAULT_AUTHOR_NAME = 'R2D4agent';
const DEFAULT_AUTHOR_EMAIL = 'pete@couldbe.net';
const PUSH_RETRY_COUNT = 3;

export interface OpenclawWorkRequestGitConfig {
  repo: string;
  branch: string;
  docsDir: string;
  authorName: string;
  authorEmail: string;
}

export interface PersistOpenclawTurnInput {
  requestId: string;
  messageId: string;
  userContent: string;
  previousAssistantContent: string | null;
  turnNumber: number;
  token: string;
  baseMarkdownContent?: string;
  config?: OpenclawWorkRequestGitConfig;
}

export interface PersistOpenclawTurnResult {
  repo: string;
  branch: string;
  docPath: string;
  commitSha: string;
  markdownContent: string;
}

interface GitCommandOptions {
  cwd?: string;
  authToken?: string;
}

export function loadOpenclawWorkRequestGitConfig(
  env: NodeJS.ProcessEnv = process.env
): OpenclawWorkRequestGitConfig | null {
  const DEFAULT_REPO = 'R2D4agent/workRequest';
  const repo = env.OPENCLAW_WORK_REQUEST_GIT_REPO?.trim() || DEFAULT_REPO;
  if (!repo) {
    return null;
  }

  return {
    repo,
    branch: env.OPENCLAW_WORK_REQUEST_GIT_BRANCH?.trim() || DEFAULT_BRANCH,
    docsDir: trimSlashes(env.OPENCLAW_WORK_REQUEST_GIT_DOCS_DIR?.trim() || DEFAULT_DOCS_DIR),
    authorName: env.OPENCLAW_WORK_REQUEST_GIT_AUTHOR_NAME?.trim() || DEFAULT_AUTHOR_NAME,
    authorEmail: env.OPENCLAW_WORK_REQUEST_GIT_AUTHOR_EMAIL?.trim() || DEFAULT_AUTHOR_EMAIL,
  };
}

export function buildOpenclawTurnMarkdown(input: {
  turnNumber: number;
  userContent: string;
  previousAssistantContent: string | null;
}): string {
  const cathyLine = input.previousAssistantContent ? `\n\n**Cathy:** ${input.previousAssistantContent}` : '';
  return `\n\n---\n\n**Turn ${input.turnNumber}**${cathyLine}\n\n**You:** ${input.userContent}`;
}

export async function persistOpenclawWorkRequestTurnToGit(
  input: PersistOpenclawTurnInput
): Promise<PersistOpenclawTurnResult | null> {
  const config = input.config ?? loadOpenclawWorkRequestGitConfig();
  if (!config) {
    return null;
  }

  const repoUrl = normalizeGitHubRepoUrl(config.repo);
  const relativeDocPath = buildWorkRequestDocPath(config.docsDir, input.requestId);
  const turnMarkdown = buildOpenclawTurnMarkdown(input);
  let lastError: unknown;

  for (let attempt = 1; attempt <= PUSH_RETRY_COUNT; attempt++) {
    const workspaceDir = await mkdtemp(join(tmpdir(), 'openclaw-wr-git-'));
    try {
      await git(['clone', '--depth', '1', '--branch', config.branch, repoUrl, workspaceDir], {
        authToken: input.token,
      });
      await git(['config', 'user.name', config.authorName], {cwd: workspaceDir});
      await git(['config', 'user.email', config.authorEmail], {cwd: workspaceDir});

      const absoluteDocPath = join(workspaceDir, relativeDocPath);
      const markdownContent = await appendToWorkRequestDoc(
        absoluteDocPath,
        turnMarkdown,
        input.baseMarkdownContent ?? ''
      );

      await git(['add', relativeDocPath], {cwd: workspaceDir});
      await git(['commit', '-m', buildCommitMessage(input.requestId, input.messageId, input.turnNumber)], {
        cwd: workspaceDir,
      });
      await git(['pull', '--rebase', 'origin', config.branch], {
        cwd: workspaceDir,
        authToken: input.token,
      });
      const commitSha = (await git(['rev-parse', 'HEAD'], {cwd: workspaceDir})).trim();
      await git(['push', 'origin', `HEAD:${config.branch}`], {
        cwd: workspaceDir,
        authToken: input.token,
      });
      return {
        repo: config.repo,
        branch: config.branch,
        docPath: relativeDocPath,
        commitSha,
        markdownContent,
      };
    } catch (error) {
      lastError = error;
    } finally {
      await rm(workspaceDir, {recursive: true, force: true});
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

async function appendToWorkRequestDoc(
  absoluteDocPath: string,
  turnMarkdown: string,
  baseMarkdownContent: string
): Promise<string> {
  await mkdir(dirname(absoluteDocPath), {recursive: true});

  let existing = baseMarkdownContent;
  try {
    existing = await readFile(absoluteDocPath, 'utf8');
    if (baseMarkdownContent && isTurnOnlyMarkdown(existing)) {
      existing = `${baseMarkdownContent}${baseMarkdownContent.endsWith('\n') ? '' : '\n'}${existing}`;
    }
  } catch (error) {
    if (!isNodeErrorCode(error, 'ENOENT')) {
      throw error;
    }
  }

  const separator = existing.length > 0 && !existing.endsWith('\n') ? '\n' : '';
  const markdownContent = `${existing}${separator}${turnMarkdown}`;
  await writeFile(absoluteDocPath, markdownContent, 'utf8');
  return markdownContent;
}

async function git(args: string[], options: GitCommandOptions = {}): Promise<string> {
  const authArgs = options.authToken ? buildGitAuthArgs(options.authToken) : [];
  try {
    const {stdout} = await execFileAsync('git', [...authArgs, ...args], {
      cwd: options.cwd,
      timeout: 120_000,
      maxBuffer: 1024 * 1024,
    });
    return stdout;
  } catch (error) {
    throw new Error(`git ${args[0] ?? 'command'} failed: ${formatGitError(error)}`);
  }
}

function buildGitAuthArgs(token: string): string[] {
  const credential = Buffer.from(`x-access-token:${token}`).toString('base64');
  return ['-c', `http.https://github.com/.extraheader=AUTHORIZATION: basic ${credential}`];
}

function normalizeGitHubRepoUrl(repo: string): string {
  if (repo.startsWith('https://')) {
    return repo;
  }

  return `https://github.com/${trimSlashes(repo)}.git`;
}

function buildWorkRequestDocPath(docsDir: string, requestId: string): string {
  const safeFileName = `${basename(requestId)}.md`;
  const safeDocsDir = trimSlashes(docsDir);
  return safeDocsDir ? posix.join(safeDocsDir, safeFileName) : safeFileName;
}

function buildCommitMessage(requestId: string, messageId: string, turnNumber: number): string {
  return `Persist OpenClaw work request ${requestId} turn ${turnNumber} (${messageId})`;
}

function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, '');
}

function isNodeErrorCode(error: unknown, code: string): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === code;
}

function formatGitError(error: unknown): string {
  if (typeof error !== 'object' || error === null) {
    return String(error);
  }

  const stderr = 'stderr' in error && typeof error.stderr === 'string' ? error.stderr.trim() : '';
  const stdout = 'stdout' in error && typeof error.stdout === 'string' ? error.stdout.trim() : '';
  const message = 'message' in error && typeof error.message === 'string' ? error.message : 'unknown error';
  return stderr || stdout || stripAuthorizationHeader(message);
}

function stripAuthorizationHeader(value: string): string {
  return value.replace(/AUTHORIZATION: basic [^\s'"]+/gi, 'AUTHORIZATION: basic [redacted]');
}

function isTurnOnlyMarkdown(value: string): boolean {
  return value.trimStart().startsWith('---');
}
