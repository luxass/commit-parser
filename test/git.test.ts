import type { Mock } from "vitest";
import { execSync } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getRawGitCommits } from "../src/git";

vi.mock("node:child_process", () => ({
  execSync: vi.fn(),
}));

describe("getRawGitCommits", () => {
  const mockExecSync = execSync as unknown as Mock;

  beforeEach(() => {
    mockExecSync.mockReset();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should fetch commits with only the \"to\" parameter", () => {
    const sampleOutput
      = "abc123|Add feature|John Doe|john@example.com|Wed Apr 15 2025|This is commit body[GIT_COMMIT_END]\n"
        + "def456|Fix bug|Jane Smith|jane@example.com|Tue Apr 14 2025|Another commit message[GIT_COMMIT_END]\n";

    mockExecSync.mockReturnValue(sampleOutput);

    const result = getRawGitCommits(undefined, "main");

    expect(mockExecSync).toHaveBeenCalledWith(
      "git --no-pager log \"main\" --pretty=\"%h|%s|%an|%ae|%ad|%b[GIT_COMMIT_END]\"",
      { encoding: "utf8", cwd: undefined },
    );

    expect(result).toEqual([
      "abc123|Add feature|John Doe|john@example.com|Wed Apr 15 2025|This is commit body",
      "def456|Fix bug|Jane Smith|jane@example.com|Tue Apr 14 2025|Another commit message",
    ]);
  });

  it("should fetch commits between \"from\" and \"to\" parameters", () => {
    const sampleOutput = "abc123|Add feature|John Doe|john@example.com|Wed Apr 15 2025|Commit message[GIT_COMMIT_END]\n";

    mockExecSync.mockReturnValue(sampleOutput);

    const result = getRawGitCommits("v1.0.0", "v2.0.0");

    expect(mockExecSync).toHaveBeenCalledWith(
      "git --no-pager log \"v1.0.0...v2.0.0\" --pretty=\"%h|%s|%an|%ae|%ad|%b[GIT_COMMIT_END]\"",
      { encoding: "utf8", cwd: undefined },
    );

    expect(result).toEqual([
      "abc123|Add feature|John Doe|john@example.com|Wed Apr 15 2025|Commit message",
    ]);
  });

  it("should use HEAD as default \"to\" parameter", () => {
    const sampleOutput = "abc123|Add feature|John Doe|john@example.com|Wed Apr 15 2025|Commit message[GIT_COMMIT_END]\n";

    mockExecSync.mockReturnValue(sampleOutput);

    const result = getRawGitCommits("v1.0.0");

    expect(mockExecSync).toHaveBeenCalledWith(
      "git --no-pager log \"v1.0.0...HEAD\" --pretty=\"%h|%s|%an|%ae|%ad|%b[GIT_COMMIT_END]\"",
      { encoding: "utf8", cwd: undefined },
    );

    expect(result).toEqual([
      "abc123|Add feature|John Doe|john@example.com|Wed Apr 15 2025|Commit message",
    ]);
  });

  it("should use the provided cwd parameter", () => {
    const sampleOutput = "abc123|Add feature|John Doe|john@example.com|Wed Apr 15 2025|Commit message[GIT_COMMIT_END]\n";

    mockExecSync.mockReturnValue(sampleOutput);

    const result = getRawGitCommits("v1.0.0", "HEAD", "/path/to/repo");

    expect(mockExecSync).toHaveBeenCalledWith(
      "git --no-pager log \"v1.0.0...HEAD\" --pretty=\"%h|%s|%an|%ae|%ad|%b[GIT_COMMIT_END]\"",
      { encoding: "utf8", cwd: "/path/to/repo" },
    );

    expect(result).toEqual([
      "abc123|Add feature|John Doe|john@example.com|Wed Apr 15 2025|Commit message",
    ]);
  });

  it("should handle commits with multiline body", () => {
    const sampleOutput
      = "abc123|Add feature|John Doe|john@example.com|Wed Apr 15 2025|This is commit body\nwith multiple lines\nand more text[GIT_COMMIT_END]\n";

    mockExecSync.mockReturnValue(sampleOutput);

    const result = getRawGitCommits(undefined, "HEAD");

    expect(result).toEqual([
      "abc123|Add feature|John Doe|john@example.com|Wed Apr 15 2025|This is commit body\nwith multiple lines\nand more text",
    ]);
  });

  it("should handle commits with pipe characters in body", () => {
    const sampleOutput
      = "abc123|Add feature|John Doe|john@example.com|Wed Apr 15 2025|This commit contains | pipe characters[GIT_COMMIT_END]\n";

    mockExecSync.mockReturnValue(sampleOutput);

    const result = getRawGitCommits(undefined, "HEAD");

    expect(result).toEqual([
      "abc123|Add feature|John Doe|john@example.com|Wed Apr 15 2025|This commit contains | pipe characters",
    ]);
  });

  it("should handle empty result", () => {
    mockExecSync.mockReturnValue("");

    const result = getRawGitCommits("v1.0.0", "v2.0.0");

    expect(result).toEqual([]);
  });

  it("should filter out empty entries", () => {
    const sampleOutput
      = "abc123|Add feature|John Doe|john@example.com|Wed Apr 15 2025|Body 1[GIT_COMMIT_END]\n"
        + "[GIT_COMMIT_END]\n" // Empty entry that should be filtered
        + "def456|Fix bug|Jane Smith|jane@example.com|Tue Apr 14 2025|Body 2[GIT_COMMIT_END]\n";

    mockExecSync.mockReturnValue(sampleOutput);

    const result = getRawGitCommits(undefined, "HEAD");

    expect(result).toEqual([
      "abc123|Add feature|John Doe|john@example.com|Wed Apr 15 2025|Body 1",
      "def456|Fix bug|Jane Smith|jane@example.com|Tue Apr 14 2025|Body 2",
    ]);
  });
});
