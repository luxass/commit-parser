export interface GitCommitAuthor {
  /**
   * The author's name.
   */
  name: string;

  /**
   * The author's email.
   */
  email: string;
}

export interface RawGitCommit {
  /**
   * The commit message.
   */
  message: string;

  /**
   * The commit body.
   */
  body: string;

  /**
   * The short hash of the commit.
   */
  shortHash: string;

  /**
   * The full hash of the commit.
   */
  hash: string;

  /**
   * The author of the commit.
   */
  author: GitCommitAuthor;

  /**
   * The commit date as a string.
   */
  date: string;
}

export interface Reference {
  /**
   * The type of the reference (issue or pull request).
   */
  type: "issue" | "pull-request";

  /**
   * The value of the reference (e.g., the issue or pull request number).
   */
  value: string;
}

export interface GitCommit extends Omit<RawGitCommit, "author"> {
  /**
   * Whether the commit follows conventional commit guidelines.
   */
  isConventional: boolean;

  /**
   * Whether the commit introduces a breaking change.
   */
  isBreaking: boolean;

  /**
   * The type of the commit (e.g., feat, fix, chore).
   * If this is a non-conventional commit, this will be an empty string.
   */
  type: string;

  /**
   * The scope of the commit (e.g., core, ui).
   */
  scope: string;

  /**
   * The description of the commit.
   */
  description: string;

  /**
   * List of references (issues, pull requests) mentioned in the commit message.
   */
  references: Reference[];

  /**
   * List of all authors (primary + co-authors)
   */
  authors: GitCommitAuthor[];
}
