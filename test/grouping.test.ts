import { groupByType } from "#grouping";
import { describe, expect, it } from "vitest";
import { makeFakeCommit } from "./_shared";

describe("groupByType", () => {
  it("groups conventional commits by type", () => {
    const commits = [
      makeFakeCommit({ type: "feat" }),
      makeFakeCommit({ type: "fix" }),
      makeFakeCommit({ type: "feat" }),
    ];

    const result = groupByType(commits);

    expect(result.get("feat")).toHaveLength(2);
    expect(result.get("fix")).toHaveLength(1);
  });

  it("groups non-conventional commits under custom key", () => {
    const commits = [
      makeFakeCommit({ type: "feat" }),
      makeFakeCommit({ isConventional: false, type: "" }),
    ];
    const result = groupByType(commits, { nonConventionalKey: "other" });
    expect(result.get("feat")).toHaveLength(1);
    expect(result.get("other")).toHaveLength(1);
  });

  it("skips non-conventional commits when includeNonConventional is false", () => {
    const commits = [
      makeFakeCommit({ type: "feat" }),
      makeFakeCommit({ isConventional: false, type: "" }),
    ];
    const result = groupByType(commits, { includeNonConventional: false });
    expect(result.get("feat")).toHaveLength(1);
    expect(result.has("misc")).toBe(false);
  });

  it("skips commits with missing type", () => {
    const commits = [
      makeFakeCommit({ type: "feat" }),
      makeFakeCommit({ type: "" }),
    ];
    const result = groupByType(commits);
    expect(result.get("feat")).toHaveLength(1);
    expect(result.has("")).toBe(false);
  });

  it("excludes specified type keys via excludeKeys", () => {
    const commits = [
      makeFakeCommit({ type: "feat" }),
      makeFakeCommit({ type: "fix" }),
      makeFakeCommit({ type: "docs" }),
      makeFakeCommit({ isConventional: false, type: "" }),
    ];

    const result = groupByType(commits, {
      excludeKeys: ["fix", "docs"],
    });

    expect(result.get("feat")).toHaveLength(1);
    expect(result.has("fix")).toBe(false);
    expect(result.has("docs")).toBe(false);
  });

  it("excludes nonConventionalKey via excludeKeys", () => {
    const commits = [
      makeFakeCommit({ type: "feat" }),
      makeFakeCommit({ isConventional: false, type: "" }),
    ];

    const result = groupByType(commits, {
      excludeKeys: ["misc"],
    });
    expect(result.get("feat")).toHaveLength(1);
    expect(result.has("misc")).toBe(false);
  });
});
