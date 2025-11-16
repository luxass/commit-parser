import { getRawGitCommitStrings } from "#git";
import { parseCommit, parseRawCommit } from "#parse";
import { quansync } from "quansync/macro";

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
 * Retrieves and parses git commits from a repository.
 *
 * @param {GetCommitsOptions} options - Options for fetching and parsing git commits.
 * @returns {QuansyncFn<GitCommit[], [options: GetCommitsOptions]>} An array of structured git commits.
 *
 * @example
 * ```typescript
 * // Get all commits up to HEAD
 * const commits = await getCommits({ to: "HEAD" });
 *
 * // Get commits between two references
 * const commits = await getCommits({ from: "v1.0.0", to: "HEAD" });
 * ```
 *
 * @example
 * ```typescript
 * // Synchronous usage
 * const commits = getCommits.sync({ from: "v1.0.0" });
 * ```
 */
export const getCommits = quansync(function* (options: GetCommitsOptions) {
  const rawCommits = yield* getRawGitCommitStrings({
    from: options.from,
    to: options.to,
    cwd: options.cwd,
    folder: options.folder,
  });

  return rawCommits.map(parseRawCommit).map(parseCommit);
});
