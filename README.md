# commit-parser

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]

A tiny parser for conventional commits that extracts metadata like type, scope, breaking changes and references.

## Installation

```bash
npm install commit-parser
```

## Usage

> [!NOTE]
> As of version 1.0.0, this library uses [quansync](https://github.com/quansync-dev/quansync) to provide both async and sync APIs. The default API is **async** (non-blocking), with a `.sync()` method available for synchronous usage.

### Async API (Default)

```ts
import { getCommits, getRawGitCommitStrings } from "commit-parser";

// get and parse all commits between two git references (async)
const commits = await getCommits({ from: "v1.0.0", to: "v2.0.0" });

// or get commits up to a specific reference
const recentCommits = await getCommits({ to: "main" });

// get raw commit strings
const rawCommits = await getRawGitCommitStrings({ from: "v1.0.0", to: "v2.0.0" });
```

### Sync API

If you need synchronous execution (blocks the event loop), use the `.sync()` method:

```ts
import { getCommits, getRawGitCommitStrings } from "commit-parser";

// synchronous version
const commits = getCommits.sync({ from: "v1.0.0", to: "v2.0.0" });
const rawCommits = getRawGitCommitStrings.sync({ from: "v1.0.0", to: "v2.0.0" });
```

### Parsing Commits

```ts
const rawCommit = "abc123|feat: add new feature|John Doe|john@example.com|1609459200";
const parsedRawCommit = parseRawCommit(rawCommit);
// {
//   shortHash: "abc123",
//   message: "feat: add new feature",
//   author: {
//     name: "John Doe",
//     email: "john@example.com"
//   },
//   date: "1609459200",
//   body: ""
// }

// parse with additional conventional commit metadata
const parsedCommit = parseCommit(parsedRawCommit);
// {
//   shortHash: "abc123",
//   message: "feat: add new feature",
//   authors: [{
//     name: "John Doe",
//     email: "john@example.com"
//   }],
//   date: "1609459200",
//   body: "",
//   type: "feat",
//   scope: "",
//   description: "add new feature",
//   isBreaking: false,
//   isConventional: true,
//   references: []
// }

// handles breaking changes
const breakingCommit = parseRawCommit("def456|feat!: breaking change|Jane Doe|jane@example.com|1609459200");
const parsedBreaking = parseCommit(breakingCommit);
// isBreaking will be true

// extracts PR and issue references
const commitWithRefs = parseRawCommit("ghi789|fix: resolve crash, closes #123 (#456)|Dev User|dev@example.com|1609459200");
const parsedRefs = parseCommit(commitWithRefs);
// references will contain [{ type: "pull-request", value: "#456" }, { type: "issue", value: "#123" }]

// handles co-authors
const coAuthoredCommit = parseRawCommit("jkl012|feat: collaborative feature|Main Author|main@example.com|1609459200|Some description\n\nCo-authored-by: Contributor One <contrib1@example.com>");
const parsedCoAuthored = parseCommit(coAuthoredCommit);
// authors will contain both the main author and co-author
```

## 📄 License

Published under [MIT License](./LICENSE).

## Acknowledgements

This project is using code from [unjs/changelogen](https://github.com/unjs/changelogen), which is licensed under the [MIT License](https://github.com/unjs/changelogen/blob/main/LICENSE)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/commit-parser?style=flat&colorA=18181B&colorB=4169E1
[npm-version-href]: https://npmjs.com/package/commit-parser
[npm-downloads-src]: https://img.shields.io/npm/dm/commit-parser?style=flat&colorA=18181B&colorB=4169E1
[npm-downloads-href]: https://npmjs.com/package/commit-parser
