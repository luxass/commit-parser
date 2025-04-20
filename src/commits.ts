import type { GitCommit } from "./types";
import { getRawGitCommitStrings } from "./git";
import { parseCommit, parseRawCommit } from "./parse";

/**
 * Retrieves a list of parsed git commits between two points in history.
 *
 * @param {string?} from - The starting point in git history. If omitted, will use the default git behavior.
 * @param {string?} to - The ending point in git history. If omitted, will use the default git behavior.
 * @param {string?} cwd - The current working directory in which to execute the git command. Defaults to process.cwd().
 * @returns {GitCommit[]} An array of parsed GitCommit objects.
 */
export function getCommits(from?: string, to?: string, cwd?: string): GitCommit[] {
  return getRawGitCommitStrings(from, to, cwd)
    .map(parseRawCommit)
    .map(parseCommit);
}
