# AI and Team Working Rules

## Purpose

These rules exist so multiple OpenAI/Codex accounts and multiple human teammates can work on EximHub without reducing quality or creating confusion.

## Mandatory Rules

1. Read these files before making changes:
- `PROJECT_CONTEXT.md`
- `AI_RULES.md`
- `HANDOFF.md`
- `DECISIONS.md`

2. Treat the repository as the only trusted memory.

3. Do not assume prior chat context is complete or correct.

4. Before major edits, review the current code and any open local changes in affected files.

5. Never overwrite or revert another person’s work unless explicitly requested.

6. Keep changes scoped and explain assumptions in commits or handoff notes.

7. If data is added, keep it in the correct category:
- contacts
- market intelligence
- legal/trust content
- operational docs

8. Do not mix market intelligence records into contact imports unless the schema explicitly supports it.

9. Do not commit secrets, `.env` files, credentials, API keys, or private runtime data.

10. Prefer improving documentation when behavior, setup, or architecture changes.

## Branch and Review Rules

- Do not push large unreviewed changes straight to `main` when a branch workflow is available.
- Use focused commits with clear messages.
- If multiple people are editing in parallel, each person should own a limited file area when possible.
- Review mobile, API, and web changes for compatibility before merging.

## Quality Rules

- Keep code modular and readable.
- Use production-safe error handling.
- Do not leave placeholder UI or placeholder text in user-facing flows unless clearly intentional.
- Validate mobile changes on actual emulator/device before calling them complete.
- Validate public pages on mobile widths before shipping.

## Data Protection Rules

- EximHub business data must be used only for EximHub work.
- Do not paste project data into personal AI workspaces if a business/API workspace is available.
- Team members should use OpenAI business/API environments with training disabled by default where applicable.
- Never share EximHub client or internal data outside the project.

## Handoff Rule

Every meaningful work session should leave enough notes in `HANDOFF.md` so another teammate or AI account can continue without guessing.
