# commit-parser

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]

A tiny conventional commit parser that can parse git commits and extract useful information like type, scope, breaking changes, references, and co-authors.

## Installation

```bash
npm install commit-parser
```

## Usage

```ts
import { getCommits, parseCommit, parseRawCommit } from "commit-parser";

// get and parse all commits between two git references
const commits = getCommits("v1.0.0", "v2.0.0");
// or get commits up to a specific reference
const recentCommits = getCommits(undefined, "main");

// parse a raw git commit string
const rawCommit = "abc123|feat: add new feature|John Doe|john@example.com|1609459200";
const parsedRawCommit = parseRawCommit(rawCommit);
// {
//   shortHash: "abc123",
//   message: "feat: add new feature",
//   author: {
//     name: "John Doe",
//     email: "john@example.com"
//   },
//   data: "1609459200",
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
//   data: "1609459200",
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

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/commit-parser?style=flat&colorA=18181B&colorB=4169E1
[npm-version-href]: https://npmjs.com/package/commit-parser
[npm-downloads-src]: https://img.shields.io/npm/dm/commit-parser?style=flat&colorA=18181B&colorB=4169E1
[npm-downloads-href]: https://npmjs.com/package/commit-parser
