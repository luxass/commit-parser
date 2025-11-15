import { exec, execSync } from "node:child_process";
import { quansync } from "quansync/macro";

/** @internal */
const execCommand = quansync({
  sync: (cmd: string, cwd?: string) => {
    return execSync(
      cmd,
      {
        encoding: "utf8",
        cwd,
        stdio: "pipe",
      },
    ).toString();
  },
  async: (cmd: string, cwd?: string) => {
    return new Promise<string>((resolve, reject) => {
      exec(cmd, { encoding: "utf8", cwd }, (error, stdout) => {
        if (error) reject(error);
        else resolve(stdout);
      });
    });
  },
});

/**
 * The format of git log.
 *
 * commit_short_hash | commit_hash | subject | author_name | author_email | author_date | body
 *
 * @see {@link https://git-scm.com/docs/pretty-formats | documentation} for details.
 */
const GIT_LOG_FORMAT = "----%n%h|%H|%s|%an|%ae|%ad|%b";

export interface GetRawGitCommitStringsOptions {
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
 * Retrieves raw git commit strings from a git repository.
 *
 * @param {GetRawGitCommitStringsOptions} options - Configuration options for fetching git commits
 * @returns {QuansyncFn<string[], [options: GetRawGitCommitStringsOptions]>} An array of raw git commit strings, or an empty array if no commits are found or an error occurs
 *
 * @example
 * ```typescript
 * // Get all commits up to HEAD
 * const commits = await getRawGitCommitStrings({ to: "HEAD" });
 *
 * // Get commits between two references
 * const commits = await getRawGitCommitStrings({ from: "v1.0.0", to: "HEAD" });
 *
 * // Get commits from a specific folder
 * const commits = await getRawGitCommitStrings({ to: "HEAD", folder: "src" });
 * ```
 *
 * @example
 * ```typescript
 * // Synchronous usage
 * const commits = getRawGitCommitStrings.sync({ from: "v1.0.0" });
 * ```
 */
export const getRawGitCommitStrings = quansync(function* (options: GetRawGitCommitStringsOptions) {
  const { from, to = "HEAD", cwd, folder } = options;
  const folderPath = folder ? ` -- ${folder}` : "";
  const cmd = `git --no-pager log "${from ? `${from}...${to}` : to}" --pretty="${GIT_LOG_FORMAT}"${folderPath}`;

  try {
    const stdout = yield* execCommand(cmd, cwd);
    return stdout.trim().split("----\n").filter(Boolean);
  } catch {
    return [];
  }
});
