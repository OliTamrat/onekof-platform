# CLAUDE.md — Project Rules for Claude Code

## Git Commit Rules (MANDATORY)

- **NEVER** use `Claude <noreply@anthropic.com>` as author or committer
- **NEVER** append `https://claude.ai/code/session_*` URLs to commit messages
- **ALWAYS** set both author AND committer to: `Oli T. Oli <120649391+OliTamrat@users.noreply.github.com>`
- Use environment variables for every commit:
  ```
  GIT_COMMITTER_NAME="Oli T. Oli" GIT_COMMITTER_EMAIL="120649391+OliTamrat@users.noreply.github.com" git commit --author="Oli T. Oli <120649391+OliTamrat@users.noreply.github.com>" -m "message"
  ```
- This is required for **IP registration purposes** — no exceptions

## Code Style

- Currency: default to ETB (Ethiopian Birr)
- Fiscal year: starts July (Ethiopian fiscal year)
- No mock/hardcoded data in production pages — always use real API data
- Theme color: `#1C8C7D` (primary teal)
