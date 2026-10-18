# Contributing

## Small pull requests

Changes land on `main` only through pull requests, squash-merged once CI passes. Keep each pull request to one self-contained change that a reviewer can read in a few minutes:

- Around 100 changed lines is usually a good size; 1000 is usually too large ([Google's guidance on small changes](https://google.github.io/eng-practices/review/developer/small-cls.html)).
- Include the tests for a change in the same pull request.
- Put refactors in their own pull request, separate from features and fixes.
- Split bigger work into a series of pull requests that each work on their own, for example the API endpoint first, then the page that uses it, then linking it into the navigation.

Commit as often as you like on your branch; the commits are squashed into one when the pull request merges.

## Commits and checks

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) and are checked by commitlint. Valid scopes are the workspace directory names plus `infra`, `deps`, `ci`, `release` and `repo`. Git hooks lint staged files on commit and run type checks and tests on push; don't skip them.
