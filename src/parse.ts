import type { GitCommit, GitCommitAuthor, RawGitCommit, Reference } from "#types";

// https://www.conventionalcommits.org/en/v1.0.0/
// https://regex101.com/r/FSfNvA/1
const ConventionalCommitRegex
  = /(?<emoji>:.+:|(\uD83C[\uDF00-\uDFFF])|(\uD83D[\uDC00-\uDE4F\uDE80-\uDEFF])|[\u2600-\u2B55])?( *)(?<type>[a-z]+)(\((?<scope>.+)\))?(?<breaking>!)?: (?<description>.+)/i;
// eslint-disable-next-line regexp/no-super-linear-backtracking, regexp/no-misleading-capturing-group
const CoAuthoredByRegex = /co-authored-by:\s*(?<name>.+)(<(?<email>.+)>)/gi;
const PullRequestRE = /\([ a-z]*(#\d+)\s*\)/g;
const IssueRE = /(#\d+)/g;

/**
 * Parses a raw git commit string into a structured format.
 *
 * @param {string} commit - A raw git commit string delimited by '|' character
 * @returns {RawGitCommit} A structured representation of the git commit
 */
export function parseRawCommit(commit: string): RawGitCommit {
  const [shortHash, hash, message, authorName, authorEmail, date, ..._body] = commit.split("|");
  const body = _body.filter(Boolean).join("\n");

  return {
    author: { name: authorName, email: authorEmail },
    body,
    date,
    message,
    shortHash,
    hash,
  };
}

/**
 * Extracts references (pull requests and issues) from a commit description
 *
 * @param {string} description - The commit description to extract references from
 * @returns {object} Object containing references array and cleaned description
 */
function extractReferences(description: string, body?: string): { references: Reference[]; cleanedDescription: string } {
  const refs = new Map<string, Reference["type"]>();

  function append(text: string) {
    // Add PR's first so they take precedence.
    for (const match of text.matchAll(PullRequestRE)) {
      const value = match[1];
      refs.set(value, "pull-request");
    }

    // Add issues if not already present
    for (const match of text.matchAll(IssueRE)) {
      const value = match[1];
      if (!refs.has(value)) refs.set(value, "issue");
    }
  }

  append(description);
  if (body) append(body);

  const references: Reference[] = Array.from(refs, ([value, type]) => ({ type, value }));

  // cleanup description by removing pull request references
  const cleanedDescription = description.replace(PullRequestRE, "").trim();

  return { references, cleanedDescription };
}

/**
 * Extracts co-authors from commit body
 *
 * @param {string} body - The commit body to extract co-authors from
 * @param {GitCommitAuthor} primaryAuthor - The primary commit author
 * @returns {GitCommitAuthor[]} Array of all authors (primary + co-authors)
 */
function extractAuthors(body: string, primaryAuthor: GitCommitAuthor): GitCommitAuthor[] {
  const authors: GitCommitAuthor[] = [primaryAuthor];

  for (const match of body.matchAll(CoAuthoredByRegex)) {
    authors.push({
      name: (match.groups?.name || "").trim(),
      email: (match.groups?.email || "").trim(),
    });
  }

  return authors;
}

/**
 * Parses a raw git commit into a structured format with additional metadata
 *
 * @param {RawGitCommit} rawCommit - The raw git commit to parse
 * @returns {GitCommit} A structured representation of the git commit with additional metadata
 */
export function parseCommit(rawCommit: RawGitCommit): GitCommit {
  const { shortHash, hash, message, body, date: data } = rawCommit;

  // parse conventional commit format
  const match = message.match(ConventionalCommitRegex);
  const isConventional = match !== null;
  const type = match?.groups?.type || "";
  const scope = match?.groups?.scope;
  const rawDescription = match?.groups?.description || message;

  // check for breaking changes
  const isBreaking = Boolean(
    match?.groups?.breaking
    || /breaking[ -]changes?:/i.test(body),
  );

  // extract references from subject and body, then clean up subject description
  const { references, cleanedDescription } = extractReferences(rawDescription, body);

  // extract all authors (primary + co-authors)
  const authors = extractAuthors(body, rawCommit.author);

  return {
    authors,
    body,
    date: data,
    description: cleanedDescription,
    isBreaking,
    isConventional,
    message,
    references,
    scope,
    shortHash,
    hash,
    type,
  };
}
