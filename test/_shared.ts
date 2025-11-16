import type { GitCommit } from "#types";

export function makeFakeCommit(overrides: Partial<GitCommit> = {}): GitCommit {
  return {
    shortHash: "abc123",
    hash: "abc1234567890abcdef1234567890abcdef1234",
    message: "feat: add new feature",
    authors: [{ name: "John Doe", email: "john@example.com" }],
    date: "1609459200",
    body: "",
    type: "feat",
    scope: "core",
    description: "add new feature",
    isBreaking: false,
    isConventional: true,
    references: [],
    ...overrides,
  };
}
