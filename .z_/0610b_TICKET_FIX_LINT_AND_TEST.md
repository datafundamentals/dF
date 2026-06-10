# Ticket 0610b - Fix `pnpm lint` and `pnpm test`

## Executive Summary

Recent tickets - not sure which ones - broke the `pnpm lint` and `pnpm test`. In the future, this won't happen because I added a check for that in the boilerplate pre and post requirements. 

This ticket gets us back to the point where the codebase would be if these post-reqs had already been in place previously.

---

## Pre and Post Requirements (boilerplate)

This ticket is **VM-side infrastructure only.** No monorepo code changes.

0. Please avoid worktrees. I have provided a dedicated branch for you to follow as local. It should be clean.
1. Before loading this ticket, read and follow `guides/1_TICKET_BEFORE_LOADING.md`
2. Then read this file.
3. After loading, read and follow `guides/2_TICKET_AFTER_LOADING.md`
4. Follow all relevant guides even if not explicitly listed here.
5. Please make sure that all four basic pnpm commands run from root cleanly: install, build, lint, test
6. Only Pete can commit or push to repository. This is off limits to the coding agent.
7. When you finish this ticket leave me detailed instructions (such as pnpm commands from root) to test this ticket for completion

---

## Functional Requirements

Find and fix all of the problems causing `pnpm lint` and `pnpm test` to not run clean from the root of this project.