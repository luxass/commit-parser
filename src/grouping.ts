import type { GitCommit } from "#types";

export interface GroupByTypeOptions {
  /**
   * Whether to include non-conventional commits under a separate key
   * @default true
   */
  includeNonConventional?: boolean;

  /**
   * The key under which to group non-conventional commits
   *
   * @default "misc"
   */
  nonConventionalKey?: string;

  /**
   * List of commit types to exclude from grouping
   */
  excludeKeys?: string[];
}

/**
 * Groups commits by their conventional commit type. Non-conventional commits
 * are optionally grouped under a configurable key.
 *
 * Rules:
 * - Conventional commits use their lowercased `type` value as key.
 * - Non-conventional commits are grouped under `nonConventionalKey` if
 *   `includeNonConventional` is true; otherwise they are skipped.
 * - Commits without a type (when expected) are skipped.
 *
 * @param {GitCommit[]} commits List of commits to group.
 * @param {GroupByTypeOptions} opts Options controlling grouping behavior.
 * @returns {Map<string, GitCommit[]>} Map keyed by commit type (or `nonConventionalKey`) with arrays of commits.
 *
 * @example
 * ```ts
 * const result = groupByType(commits, { nonConventionalKey: 'other' });
 * const featCommits = result.get('feat');
 * const miscCommits = result.get('other');
 * ```
 */
export function groupByType(
  commits: GitCommit[],
  opts: GroupByTypeOptions = {},
): Map<string, GitCommit[]> {
  const {
    includeNonConventional = true,
    nonConventionalKey = "misc",
    excludeKeys = [],
  } = opts;

  const groupedCommits = new Map<string, GitCommit[]>();

  for (const commit of commits) {
    // If the commit isn't conventional and we're not including non-conventional, skip it
    if (!commit.isConventional && !includeNonConventional) {
      continue;
    }

    let key: string | undefined;
    if (!commit.isConventional) {
      key = nonConventionalKey;
    } else {
      const commitType = (commit.type || "").toLowerCase();
      if (!commitType) continue;
      key = commitType;
    }

    // If the key is in the exclude list, skip this commit
    if (excludeKeys.includes(key)) {
      continue;
    }

    const group = groupedCommits.get(key) ?? [];
    group.push(commit);
    groupedCommits.set(key, group);
  }

  return groupedCommits;
}
