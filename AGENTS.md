# Repository Agent Instructions

## GitHub publishing identity

- All commits, pushes, pull-request creation or updates, and merges must use the local `git` and `gh` CLI. Do not publish through a GitHub connector, browser session, remote integration, or another person's authenticated account.
- Before every push and before creating or merging a pull request, run `gh auth status`. The active GitHub account must be `miyin-derick`.
- Also verify the local Git author with `git config user.name` and `git config user.email`. If either identity is unexpected, stop before publishing and ask the user to correct or approve it.
- Create pull requests with local `gh pr create` and merge them with local `gh pr merge` only after the user has authorized the merge.
- Immediately after creating a pull request, verify its author using `gh pr view`. The PR author must be `miyin-derick`.
- If any identity check fails, do not push, create, edit, or merge the pull request. Report the mismatch to the user instead.
