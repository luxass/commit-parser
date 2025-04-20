import type { GitCommit } from "./types";
import { getRawGitCommits } from "./git";
import { parseCommit, parseRawCommit } from "./parse";

export function getCommits(from?: string, to?: string): GitCommit[] {
  return getRawGitCommits(from, to)
    .map(parseRawCommit)
    .map(parseCommit);
}
