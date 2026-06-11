# Ticket 0610d Turn Persistence (Firestore)

## Executive Summary

An Event-Loop was conceived of as a way to convert my failing Work Request system - which currently relies entirely upon a probablistic LLM-only strategy to craft a Work Request -  into a more deterministic process using turns and event loop with gates.

This df-openclaw-chat event-loop work is only partially complete. This ticket asks the firestore persistence layer to implement the very next layer of the new turn architecture.

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

This ticket focuses primarily on the firestore persistence of a turn. 

When this ticket is complete, each user request and the previously made cathy response will be identified as a turn in the database, such that the event-loop might be triggered with each such turn. 

This ticket migrates the app into persisted turns made of message pairs and a status doc iteration,  instead of just sequential messages with a status doc as a sometime-side-effect. 

It is not expected to work perfectly as a complete event-loop, but instead to just take one small, next chunk of work to begin making this multi-ticket transition.

## Where Things are Currently

A previous ticket converted the UI portion into hacked version with an in-memory turn system. The persistence layer currently knows nothing about this new "turn" event-loop, even if the UI pretends like it does.

## Exclusions

The behavior of the UI will not change, with this ticket. Only the persistence layer.

Neither does this ticket concern itself with persistence of the status document or event-loop gates or gates related messages, or for that matter - any persistence beyond the turn itself, and the primary message pair within that turn.

A later ticket will subsequently follow up with a git persistence system for the awr-markdown-codemirror markdown content, which is also out of scope for this ticket.
 
## Design Documentation

The tmp.md file which populates the awr-markdown-codemirror widget is also an (incorrect/incomplete) document stating how this entire event-loop turn based system might work if designed from scratch.

It is noted, however, that tmp.md is incorrect because we are not starting from scratch - instead we are adapting a previously written codebase. For this reason, please read this document with an eye towards taking what helps and ignoring what does not help the completion of this ticket.

## Possible Firestore Schema Candidates for this Ticket:

Please be clear. I don't even know if the tmp.md study is coming to the right conclusions on the general schema. But sometimes it's best to ask you for your opinions. You can see that I am attempting to create a persistence schema that allows me to create gates around each turn.

I am also not sure how a turn relates to each of 2 messages - the message from the user, and message back from the cathy agent - each of which is already in the chat UI. Is a turn a pair of messages? A request message and a response message? Dunno. Fortunately there are no ongoing sessions that I need to protect, so complete re-architecture is not a problem if that is required, just so long as we keep the UI working for continued testing.

If we break the existing df-chat-app, however - df-openclaw-chat is not the only app that uses portions of th chat schema. So we cannot modify anything that causes df-chat-app to break - it must still work as before. That means we need to fork rather than change - where that app would be affected.

Either way, there are some collections I would consider suitable for this ticket, and some not suitable. If the tmp.md schemas were appropriate, these are the ones that would seem to a candidate for this ticket. Maybe.

```

  "meta": {
    "status": "IN_PROGRESS",
    "turnState": "USER_TURN",       // Options: USER_TURN, PROCESSING
    "currentTurnId": "turn_101",
    "version": 3,
    "createdAt": "2026-06-08T19:50:00Z",
    "ownerId": "user_123",
    "category": "cloud_migration",
    "templateId": "tmpl_infra_v2",
    "searchTokens": { "draft": true, "auth": true }
  },


  "turn": {
  "turnId": "turn_101",
  "sender": "AGENT",
  "agentName": "SummaryAgent",
  "text": "Budget adjusted. Gate 2 is failing due to vendor limits.",
  "timestamp": "2026-06-08T19:51:05Z"
}

```

## Schema that should NOT be Considered for this Ticket:

- content
- gates or gate definitions
- templates
- loop-control

## Testing and Acceptance

This ticket is not expected to be perfect in it's performance, rather to do one small step well, and not leave behind too much new code that would be considered a poor basis for moving forward on subsequent small tickets to follow. Any technical debt that is properly documented and still leaves the basic functional requirements of this ticket done is acceptable.

## A note about iterative design

This ticket is not very well thought out. The coding agent is encouraged to think iteratively and discuss options with me during this process. I could use any help I could get in this regard.

