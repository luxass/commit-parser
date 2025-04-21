import type { Mock } from "vitest";
import { execSync } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getRawGitCommitStrings } from "../src/git";

vi.mock("node:child_process", () => ({
  execSync: vi.fn(),
}));

describe("getRawGitCommitStrings", () => {
  const mockExecSync = execSync as unknown as Mock;

  beforeEach(() => {
    mockExecSync.mockReset();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should fetch commits with only the \"to\" parameter", () => {
    const sampleOutput = "----\n"
      + "abc123|Add feature|John Doe|john@example.com|Wed Apr 15 2025|This is commit body\n"
      + "----\n"
      + "def456|Fix bug|Jane Smith|jane@example.com|Tue Apr 14 2025|Another commit message";

    mockExecSync.mockReturnValue(sampleOutput);

    const result = getRawGitCommitStrings({
      from: undefined,
      to: "main",
    });

    expect(mockExecSync).toHaveBeenCalledWith(
      "git --no-pager log \"main\" --pretty=\"----%n%h|%s|%an|%ae|%ad|%b\"",
      { encoding: "utf8", cwd: undefined, stdio: ["pipe", "pipe", "pipe"] },
    );

    expect(result).toEqual([
      "abc123|Add feature|John Doe|john@example.com|Wed Apr 15 2025|This is commit body\n",
      "def456|Fix bug|Jane Smith|jane@example.com|Tue Apr 14 2025|Another commit message",
    ]);
  });

  it("should fetch commits between \"from\" and \"to\" parameters", () => {
    const sampleOutput = "----\n"
      + "abc123|Add feature|John Doe|john@example.com|Wed Apr 15 2025|Commit message";

    mockExecSync.mockReturnValue(sampleOutput);

    const result = getRawGitCommitStrings({ from: "v1.0.0", to: "v2.0.0" });

    expect(mockExecSync).toHaveBeenCalledWith(
      "git --no-pager log \"v1.0.0...v2.0.0\" --pretty=\"----%n%h|%s|%an|%ae|%ad|%b\"",
      { encoding: "utf8", cwd: undefined, stdio: ["pipe", "pipe", "pipe"] },
    );

    expect(result).toEqual([
      "abc123|Add feature|John Doe|john@example.com|Wed Apr 15 2025|Commit message",
    ]);
  });

  it("should use HEAD as default \"to\" parameter", () => {
    const sampleOutput = "----\n"
      + "abc123|Add feature|John Doe|john@example.com|Wed Apr 15 2025|Commit message";

    mockExecSync.mockReturnValue(sampleOutput);

    const result = getRawGitCommitStrings({
      from: "v1.0.0",
    });

    expect(mockExecSync).toHaveBeenCalledWith(
      "git --no-pager log \"v1.0.0...HEAD\" --pretty=\"----%n%h|%s|%an|%ae|%ad|%b\"",
      {
        encoding: "utf8",
        cwd: undefined,
        stdio: ["pipe", "pipe", "pipe"],
      },
    );

    expect(result).toEqual([
      "abc123|Add feature|John Doe|john@example.com|Wed Apr 15 2025|Commit message",
    ]);
  });

  it("should use the provided cwd parameter", () => {
    const sampleOutput = "----\n"
      + "abc123|Add feature|John Doe|john@example.com|Wed Apr 15 2025|Commit message";

    mockExecSync.mockReturnValue(sampleOutput);

    const result = getRawGitCommitStrings({
      from: "v1.0.0",
      to: "HEAD",
      cwd: "/path/to/repo",
    });

    expect(mockExecSync).toHaveBeenCalledWith(
      "git --no-pager log \"v1.0.0...HEAD\" --pretty=\"----%n%h|%s|%an|%ae|%ad|%b\"",
      { encoding: "utf8", cwd: "/path/to/repo", stdio: ["pipe", "pipe", "pipe"] },
    );

    expect(result).toEqual([
      "abc123|Add feature|John Doe|john@example.com|Wed Apr 15 2025|Commit message",
    ]);
  });

  it("should handle commits with multiline body", () => {
    const sampleOutput = "----\n"
      + "abc123|Add feature|John Doe|john@example.com|Wed Apr 15 2025|This is commit body\nwith multiple lines\nand more text";

    mockExecSync.mockReturnValue(sampleOutput);

    const result = getRawGitCommitStrings({ from: undefined, to: "HEAD" });

    expect(result).toEqual([
      "abc123|Add feature|John Doe|john@example.com|Wed Apr 15 2025|This is commit body\nwith multiple lines\nand more text",
    ]);
  });

  it("should handle commits with pipe characters in body", () => {
    const sampleOutput = "----\n"
      + "abc123|Add feature|John Doe|john@example.com|Wed Apr 15 2025|This commit contains | pipe characters";

    mockExecSync.mockReturnValue(sampleOutput);

    const result = getRawGitCommitStrings({ from: undefined, to: "HEAD" });

    expect(result).toEqual([
      "abc123|Add feature|John Doe|john@example.com|Wed Apr 15 2025|This commit contains | pipe characters",
    ]);
  });

  it("should handle empty result", () => {
    mockExecSync.mockReturnValue("");

    const result = getRawGitCommitStrings({ from: "v1.0.0", to: "v2.0.0" });

    expect(result).toEqual([]);
  });

  it("should handle multiple consecutive commits", () => {
    const sampleOutput = "----\n"
      + "abc123|First commit|John Doe|john@example.com|Wed Apr 15 2025|First message\n"
      + "----\n"
      + "def456|Second commit|Jane Smith|jane@example.com|Tue Apr 14 2025|Second message\n"
      + "----\n"
      + "ghi789|Third commit|Bob Brown|bob@example.com|Mon Apr 13 2025|Third message";

    mockExecSync.mockReturnValue(sampleOutput);

    const result = getRawGitCommitStrings({ from: undefined, to: "HEAD" });

    expect(result).toEqual([
      "abc123|First commit|John Doe|john@example.com|Wed Apr 15 2025|First message\n",
      "def456|Second commit|Jane Smith|jane@example.com|Tue Apr 14 2025|Second message\n",
      "ghi789|Third commit|Bob Brown|bob@example.com|Mon Apr 13 2025|Third message",
    ]);
  });

  it("should use the provided folder parameter", () => {
    const sampleOutput = "----\n"
      + "abc123|Add feature|John Doe|john@example.com|Wed Apr 15 2025|Commit message";

    mockExecSync.mockReturnValue(sampleOutput);

    const result = getRawGitCommitStrings({
      from: "v1.0.0",
      to: "HEAD",
      folder: "src",
    });

    expect(mockExecSync).toHaveBeenCalledWith(
      "git --no-pager log \"v1.0.0...HEAD\" --pretty=\"----%n%h|%s|%an|%ae|%ad|%b\" -- src",
      { encoding: "utf8", cwd: undefined, stdio: ["pipe", "pipe", "pipe"] },
    );

    expect(result).toEqual([
      "abc123|Add feature|John Doe|john@example.com|Wed Apr 15 2025|Commit message",
    ]);
  });
});
