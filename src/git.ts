import { execSync } from "node:child_process";

/** @internal */
function execCommand(cmd: string, cwd?: string): string {
  try {
    return execSync(cmd, {
      encoding: "utf8",
      cwd,
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch {
    return "";
  }
}

/**
 * The format of git log.
 *
 * commit_short_hash | subject | author_name | author_email | author_date | body
 *
 * @see {@link https://git-scm.com/docs/pretty-formats | documentation} for details.
 */
const GIT_LOG_FORMAT = "----%n%h|%s|%an|%ae|%ad|%b";

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
 * Retrieves raw git commits between two references.
 *
 * @param {GetRawGitCommitStringsOptions} options - Options for fetching raw git commits.
 *
 * @returns {string[]} An array of raw git commit strings.
 */
export function getRawGitCommitStrings(options: GetRawGitCommitStringsOptions): string[] {
  const {
    from,
    to = "HEAD",
    cwd,
    folder,
  } = options;

  const folderPath = folder ? ` -- ${folder}` : "";
  const output = execCommand(`git --no-pager log "${from ? `${from}...${to}` : to}" --pretty="${GIT_LOG_FORMAT}"${folderPath}`, cwd);
  return output
    .split("----\n")
    .filter(Boolean);
}
