import type { GitCommit } from "./types";
import { getRawGitCommitStrings } from "./git";
import { parseCommit, parseRawCommit } from "./parse";

export function getCommits(from?: string, to?: string): GitCommit[] {
  return getRawGitCommitStrings(from, to)
    .map(parseRawCommit)
    .map(parseCommit);
}
