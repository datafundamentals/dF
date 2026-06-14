# Ticket 0614a Work Request Viewer

## Executive Summary

This ticket clones `df-markdown-codemirror` which is currently used in the `df-openclaw-chat` UI, then modifies this to a more useful configuration, and replaces the existing `df-markdown-codemirror`

Some of the necessary modifications will be outlined within this ticket. Others will be specified during iterative trial and testing. The ticket will be closed when the user is satisfied with all changes.

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

- The new widget replacing `df-markdown-codemirror` will be namd `df-work-request-preview`
- The markdown preview will be the primary view
- The markdown editor will not be shown except when requested by clicking on a button
- When the markdown editor is shown, it is not editable
- The markdown editor - when shown, shall be below the preview view
- The styling on the preview will be white background, not pinkish as is current
- The preview will always show the latest version of the document as per what is committed to the git repository
- The token count will always be showing and updated to current count from what is committed to git. This count will be showing below the markdown preview
- `df-work-request-preview` will be added to storybook