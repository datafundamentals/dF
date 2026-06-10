# Ticket 0610a - Markdown Viewer

## Executive Summary

Currently, "Cathy" (the OpenClaw agent) creates an external status document. Instead, going forward the session will always display a status document for that session within the UI. 

This ticket does not complete that work, but instead only installs the markdown viewer of the status document, and populates that viewer with surrogate, temporary content.

---

## Pre and Post Requirements

This ticket is **VM-side infrastructure only.** No monorepo code changes.

1. Before loading this ticket, read and follow `guides/1_TICKET_BEFORE_LOADING.md`
2. Then read this file.
3. After loading, read and follow `guides/2_TICKET_AFTER_LOADING.md`
4. Follow all relevant guides even if not explicitly listed here.
5. Only Pete can commit or push to repository. This is off limits to the coding agent.

---

## Functional Requirements

- borrow (copy) the markdown viewer from another usage
- install it underneath the existing chat submit button
- populate the markdown viewer with tmp.md

## Where to find the markdown viewer

- search for awr-markdown-codemirror in *.ts
- observe usage within `/Users/petecarapetyan/work/primary/dF/.z_/WIP/approach/src/ui/awr-resource-documenter.ts`

## Finding and placing tmp.md

- you will find tmp.md in the root of df
- it does not matter to me where you place it because this is a surrogate usage only. This usage will quickly become replaced in the next few tickets with an actual and real session specific file.
- you may even leave it where it is if that suits you
- do not destroy this file, but even if you did I have another copy elsewhere
