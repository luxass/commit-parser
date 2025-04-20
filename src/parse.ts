import type { GitCommit, GitCommitAuthor, RawGitCommit, Reference } from "./types";

// https://www.conventionalcommits.org/en/v1.0.0/
// https://regex101.com/r/FSfNvA/1
// const ConventionalCommitRegex
//   = /(?<emoji>:.+:|(\uD83C[\uDF00-\uDFFF])|(\uD83D[\uDC00-\uDE4F\uDE80-\uDEFF])|[\u2600-\u2B55])?( *)(?<type>[a-z]+)(\((?<scope>.+)\))?(?<breaking>!)?: (?<description>.+)/i;
// const CoAuthoredByRegex = /co-authored-by:\s*(?<name>.+)(<(?<email>.+)>)/gi;
// const PullRequestRE = /\([ a-z]*(#\d+)\s*\)/g;
// const IssueRE = /(#\d+)/g;
// const BreakingRE = /breaking[ -]changes?:/i;

export function parseRawCommit(commit: string): RawGitCommit {
  const [shortHash, message, authorName, authorEmail, data, ..._body] = commit.split("|");
  const body = _body.filter(Boolean).join("\n");

  return {
    author: { name: authorName, email: authorEmail },
    body,
    data,
    message,
    shortHash,
  };
}

export function parseCommit(_rawCommit: RawGitCommit): GitCommit {
  return {} as GitCommit;
}
