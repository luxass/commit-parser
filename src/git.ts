import { execSync } from "node:child_process";

function execCommand(cmd: string, cwd?: string) {
  return execSync(cmd, { encoding: "utf8", cwd }).trim();
}

/**
 * The format of git log.
 *
 * commit_short_hash | subject | author_name | author_email | author_date | body
 *
 * @see {@link https://git-scm.com/docs/pretty-formats | documentation} for details.
 */
const GIT_LOG_FORMAT = "----%n%h|%s|%an|%ae|%ad|%b";

/**
 * Retrieves raw git commits between two references.
 *
 * @param {string | undefined} from - The starting reference (commit, branch, tag). If undefined, it will fetch commits up to the `to` reference.
 * @param {string} [to] - The ending reference. Defaults to "HEAD".
 * @param {string?} cwd - The current working directory where the git command will be executed. If not provided, the command will run in the process's current directory.
 * @returns {string[]} An array of raw git commit strings.
 */
export function getRawGitCommitStrings(from: string | undefined, to: string = "HEAD", cwd?: string): string[] {
  const output = execCommand(`git --no-pager log "${from ? `${from}...${to}` : to}" --pretty="${GIT_LOG_FORMAT}"`, cwd);
  return output
    .split("----\n")
    .filter(Boolean);
}
