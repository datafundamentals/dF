# Ticket 0610c Event-Loop Iteration

## Executive Summary

An Event-Loop was conceived of as a way to convert my failing Work Request system - which relies entirely upon a probablistic LLM-only strategy to craft a Work Request development process into a more deterministic process.

This ticket asks the LLM to carve out a small portion of this work into a beginning that at minimum tests out a turn based system from the codebase that we already have. It is not expected to work perfectly, but instead to just take one small, first chunk of work to begin making this multi-ticket transition.

At minimun, it will append the previous turn messages onto the bottom of the awr-markdown-codemirror text (without saving that to file permanently). 

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

When this ticket is complete, each user request and the previously made cathy response will be identified as a turn.

Those turn messages will be appended onto the end of the text in the awr-markdown-codemirror widget.

## Exclusions

Persistence of the new awr-markdown-codemirror markdown content is not a part of this ticket. It is intended that the coding agent will merely hack something together and mark it as such in the code. A later ticket will subsequently follow up with a git persistence system which is out of scope for this ticket.

## Optional Inclusions

It is reasonable and acceptable for the coding agent to modify the firestore persistence layer either partially or completely - with a schema as outlined in the current design, or something close to that.

Other modifications to the services/functions layer are also reasonable - but it is considered a strategy to make this ticket as small as is reasonable, and documenting next steps for future tickets. 

## Design Documentation

The tmp.md file which populates the awr-markdown-codemirror widget is also an (incorrect/incomplete) document stating how this system might work if designed from scratch.

It is noted, however, that it is incomplete/incorrect because we are not starting from scratch - instead we are adapting a previously written codebase. For this reason, please read this document with an eye towards taking what helps and ignoring what does not help the completion of this ticket.

## Testing and Acceptance

This ticket is not expected to be perfect in it's performance, rather to do one small step well, and not leave behind too much new code that would be considered a poor basis for moving forward on subsequent small tickets to follow. Any technical debt that is properly documented and still leaves the basic functional requirements of this ticket done is acceptable.

### One obvious change that would not be acceptable.

The result of this work would not be acceptable if the existing message chain was visible as multiple turns as it currently is. There should only be these chat elements at most, and never a long chain of back and forth.

- one previous reply by cathy
- the current message box for the user to type into
- the current awr-markdown-codemirror widget displaying the latest content

## A note about iterative design

This ticket is not very well thought out. The coding agent is encouraged to think iteratively and discuss options with me during this process.

