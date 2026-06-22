# Ticket 0620a - Main Review of Work Request

## Executive Summary

The df-agent-work-request app opens up by forcing the user to populate title, intent, summary and metrics fields before doing any further work to define a work request.

This ticket expands upon that, by connecting the submit button to a call to openclaw's main (john) agent with the json of these four fields, asking for it to approve of the content of these four fields, before opening up the rest of the df-agent-work-request app to further work.
---

## Pre and Post Requirements (boilerplate)

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

This ticket involves plumbing only - it demands an approval process from the main (John) agent before continuing work, but then it instructs the agent to "approve" the fields if they are not empty and do not include the string "bicycle".  So it is not intended as a meaningful approval yet, but rather as a way to ensure that the plumbing is in place such that if the approval process was real, it would block as desired.

In the case of a disapproval (the string "bicycle" is included in one or more fields) then the app should return to the form where the 4 fields are showing in update or edit state, with instructions of what to do to fix the problem.

