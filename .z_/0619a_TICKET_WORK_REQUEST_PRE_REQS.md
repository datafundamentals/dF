# Ticket 0619a Work Request Pre-requirements

## Executive Summary

This ticket sets up the event-loop of df-agent-work-request a bit more completely by defining 4 field as pre-requirements even before the more detailed aspects of the chat proceeds.

Title, intent, summary and metrics are the 4 fields added. The user must fill in these fields before any of the rest of the page is visible.

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

`interface AgenticConversation extends FirestoreDocument` is expanded to add 3 additional fields below title - `intent, summary, and metrics` As a side note - interface OpenclawConversation extends FirestoreDocument is defined in 4 separate files which seems to break all norms of DRY software but that is a separate issue? Is this legit?

When the df-agent-work-request app creates a new conversation - everything below the title field should be in it's own div and hidden, until all four fields are filled out and submitted.

The title field should remain a text, intent, summary and metrics should be textarea types. The submit button should be disabled until all four fields are filled out to some reasonable degree.

