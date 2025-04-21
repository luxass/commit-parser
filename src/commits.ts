import type { GitCommit } from "./types";
import { getRawGitCommitStrings } from "./git";
import { parseCommit, parseRawCommit } from "./parse";

export interface GetCommitsOptions {
  /**
   * The starting reference (commit, branch, tag). If undefined, it will fetch commits up to the `to` reference.
   * @default undefined
   */
  from?: string;

  /**
   * The ending reference. Defaults to "HEAD".
   * @default "HEAD"
   */
  to?: string;

  /**
   * The current working directory where the git command will be executed.
   * If not provided, the command will run in the process's current directory.
   * @default process.cwd()
   */
  cwd?: string;

  /**
   * The folder to provide to the git command.
   * This is useful when you only want to retrieve commits from a specific folder.
   * @default undefined
   */
  folder?: string;
}

/**
 * Retrieves a list of parsed git commits between two points in history.
 *
 * @param {GetCommitsOptions} options - Options for fetching and parsing git commits.
 *
 * @returns {GitCommit[]} An array of parsed GitCommit objects.
 */
export function getCommits(options: GetCommitsOptions): GitCommit[] {
  return getRawGitCommitStrings({
    from: options.from,
    to: options.to,
    cwd: options.cwd,
    folder: options.folder,
  })
    .map(parseRawCommit)
    .map(parseCommit);
}
