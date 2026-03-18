# EximHub Decisions Log

## Purpose

This file records decisions that should not depend on chat memory.

## Product Decisions

- EximHub is positioned as a trade intelligence and buyer discovery platform, not just a contact directory.
- `eximhub.pro` is the company’s own domain and should be used as the primary public brand.
- Public website trust signals are required: contact details, contact form, privacy policy, refund policy.
- Signup, login, and payment should stay simple for non-technical business users.

## Data Decisions

- Contact data and market intelligence data must remain logically separated.
- Imported vendor-branded data should be reworked into EximHub-owned presentation where business rights allow.
- Cleaned datasets should use EximHub naming conventions where practical.

## Technical Decisions

- Backend uses Node.js + Express + MySQL.
- Authentication uses JWT and bcrypt.
- Market intelligence is stored and queried separately from contacts.
- SQL export/import workflows are kept in the repository to improve reproducibility.

## Team Process Decisions

- Repository docs are the source of truth for ongoing work.
- AI tools should not rely on session memory for important project context.
- Work should be handed off with clear notes when unfinished.

## Open Decisions

- Final production payment gateway selection
- Final email delivery provider for live transactional emails
- Final production deployment topology for web, API, admin, and mobile backend services
