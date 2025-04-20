import { describe, expect, it } from "vitest";
import { parseCommit, parseRawCommit } from "../src/parse";

describe("parseRawCommit", () => {
  it("should parse a basic commit correctly", () => {
    const rawCommit = "abc123|feat: add new feature|John Doe|john@example.com|1609459200";
    const result = parseRawCommit(rawCommit);

    expect(result).toEqual({
      shortHash: "abc123",
      message: "feat: add new feature",
      author: {
        name: "John Doe",
        email: "john@example.com",
      },
      data: "1609459200",
      body: "",
    });
  });

  it("should handle commit with body", () => {
    const rawCommit = "def456|fix: bug fix|Jane Smith|jane@example.com|1609545600|This is the first line|This is the second line";
    const result = parseRawCommit(rawCommit);

    expect(result).toEqual({
      shortHash: "def456",
      message: "fix: bug fix",
      author: {
        name: "Jane Smith",
        email: "jane@example.com",
      },
      data: "1609545600",
      body: "This is the first line\nThis is the second line",
    });
  });

  it("should handle commit with empty body parts", () => {
    const rawCommit = "ghi789|chore: update deps|Alex Johnson|alex@example.com|1609632000||Additional info";
    const result = parseRawCommit(rawCommit);

    expect(result).toEqual({
      shortHash: "ghi789",
      message: "chore: update deps",
      author: {
        name: "Alex Johnson",
        email: "alex@example.com",
      },
      data: "1609632000",
      body: "Additional info",
    });
  });

  it("should handle commit with no body", () => {
    const rawCommit = "jkl012|docs: update readme|Sam Wilson|sam@example.com|1609718400";
    const result = parseRawCommit(rawCommit);

    expect(result).toEqual({
      shortHash: "jkl012",
      message: "docs: update readme",
      author: {
        name: "Sam Wilson",
        email: "sam@example.com",
      },
      data: "1609718400",
      body: "",
    });
  });
});

describe("parseCommit", () => {
  it("should parse a conventional commit correctly", () => {
    const rawCommit = parseRawCommit("abc123|feat: add new feature|John Doe|john@example.com|1609459200");
    const result = parseCommit(rawCommit);

    expect(result).toEqual({
      shortHash: "abc123",
      message: "feat: add new feature",
      authors: [{
        name: "John Doe",
        email: "john@example.com",
      }],
      data: "1609459200",
      body: "",
      type: "feat",
      scope: "",
      description: "add new feature",
      isBreaking: false,
      isConventional: true,
      references: [],
    });
  });

  it("should parse a conventional commit with scope", () => {
    const rawCommit = parseRawCommit("def456|feat(ui): add button component|Jane Smith|jane@example.com|1609545600");
    const result = parseCommit(rawCommit);

    expect(result).toEqual({
      shortHash: "def456",
      message: "feat(ui): add button component",
      authors: [{
        name: "Jane Smith",
        email: "jane@example.com",
      }],
      data: "1609545600",
      body: "",
      type: "feat",
      scope: "ui",
      description: "add button component",
      isBreaking: false,
      isConventional: true,
      references: [],
    });
  });

  it("should detect breaking changes from '!' symbol", () => {
    const rawCommit = parseRawCommit("ghi789|feat!: breaking API change|Alex Johnson|alex@example.com|1609632000");
    const result = parseCommit(rawCommit);

    expect(result).toEqual({
      shortHash: "ghi789",
      message: "feat!: breaking API change",
      authors: [{
        name: "Alex Johnson",
        email: "alex@example.com",
      }],
      data: "1609632000",
      body: "",
      type: "feat",
      scope: "",
      description: "breaking API change",
      isBreaking: true,
      isConventional: true,
      references: [],
    });
  });

  it("should detect breaking changes from body", () => {
    const rawCommit = parseRawCommit("jkl012|feat: update user API|Sam Wilson|sam@example.com|1609718400|BREAKING CHANGES: User model has changed");
    const result = parseCommit(rawCommit);

    expect(result).toEqual({
      shortHash: "jkl012",
      message: "feat: update user API",
      authors: [{
        name: "Sam Wilson",
        email: "sam@example.com",
      }],
      data: "1609718400",
      body: "BREAKING CHANGES: User model has changed",
      type: "feat",
      scope: "",
      description: "update user API",
      isBreaking: true,
      isConventional: true,
      references: [],
    });
  });

  it("should extract PR and issue references", () => {
    const rawCommit = parseRawCommit("mno345|fix: resolve crash, closes #123 (#456)|Dev User|dev@example.com|1609804800");
    const result = parseCommit(rawCommit);

    expect(result).toEqual({
      shortHash: "mno345",
      message: "fix: resolve crash, closes #123 (#456)",
      authors: [{
        name: "Dev User",
        email: "dev@example.com",
      }],
      data: "1609804800",
      body: "",
      type: "fix",
      scope: "",
      description: "resolve crash, closes #123",
      isBreaking: false,
      isConventional: true,
      references: [
        { type: "pull-request", value: "#456" },
        { type: "issue", value: "#123" },
      ],
    });
  });

  it("should handle co-authors in commit body", () => {
    const rawCommit = parseRawCommit("pqr678|feat: collaborative feature|Main Author|main@example.com|1609891200|Some description\n\nCo-authored-by: Contributor One <contrib1@example.com>\nCo-authored-by: Contributor Two <contrib2@example.com>");
    const result = parseCommit(rawCommit);

    expect(result).toEqual({
      shortHash: "pqr678",
      message: "feat: collaborative feature",
      authors: [
        { name: "Main Author", email: "main@example.com" },
        { name: "Contributor One", email: "contrib1@example.com" },
        { name: "Contributor Two", email: "contrib2@example.com" },
      ],
      data: "1609891200",
      body: "Some description\n\nCo-authored-by: Contributor One <contrib1@example.com>\nCo-authored-by: Contributor Two <contrib2@example.com>",
      type: "feat",
      scope: "",
      description: "collaborative feature",
      isBreaking: false,
      isConventional: true,
      references: [],
    });
  });

  it("should handle non-conventional commits", () => {
    const rawCommit = parseRawCommit("stu901|Update readme with examples|Random User|random@example.com|1609977600");
    const result = parseCommit(rawCommit);

    expect(result).toEqual({
      shortHash: "stu901",
      message: "Update readme with examples",
      authors: [{
        name: "Random User",
        email: "random@example.com",
      }],
      data: "1609977600",
      body: "",
      type: "",
      scope: "",
      description: "Update readme with examples",
      isBreaking: false,
      isConventional: false,
      references: [],
    });
  });
});
