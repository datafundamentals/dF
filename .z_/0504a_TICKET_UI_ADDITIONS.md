# Ticket 0504a: Work Request UI Additions

## Intent
This ticket prescribes some additions to the `df-openclaw-chat-widget.ts` ui, such that each Work Request has new UI features, as defined below. Some of these new UI features will only be partially enabled on the back end, and only showing as visual but not accurate or operative - in terms of back end functionality. These features may show up in the left column `conversation-item` widgets, or in the main `chat panel` Work Request widgets.

---

## Pre and Post Requirements

This ticket focuses on changes to `apps/df-openclaw-chat` or related code.

1. Before loading the following ticket description into your context, read and follow `guides/1_TICKET_BEFORE_LOADING.md`
2. Then read the contents of this file into your context.
3. After loading the contents of this ticket into your context, read and follow `guides/2_TICKET_AFTER_LOADING.md`
4. Please understand that you are always required to follow the contents of relevant guides/ documents, even if they are not enumerated as a part of this ticket.
5. Only Pete (human user) can commit or push changes to the 0504a branch of dF. This is off limits to the coding agent.

---

## Where

### Left column conversation-items

look for this code

```ts
conversationsState.documents.map((conversation: OpenclawConversation) => html`
      <article
        class="conversation-item"
```

### Main `chat panel` 

look for this code

```ts
<section class="chat-panel">
```

## Left column conversation-items

### status link:

- this is the link - where the id is the firestore work request key https://hbb-a1.web.app/WP_Status/9R53Bj9qEux4tloGfvKV/
- the name of the link should be "STATUS"
- same size/style as "ACTIVE" already in the UI

### delete button:

- same size/style as "ACTIVE" already in the UI - not a normal MD3 button, as this is not a normal use case.
- has a very solid `are you sure?` process, `this is not undoable`
- deletes downstream data as well on firestore

### agent/active:

- don't show "Cathy - " unless user is superuser, because it is always Cathy if not superuser
- Active or Accepted are the only two valid values
- Remains as "Active" until accepted as a work request, into the system
- This is only toggled by the system, once a work request as has been accepted


## Main `chat panel` 

### status link:
- duplicate of above - see the Left column `conversation-items`
### recurring toggle switch and adjacent text :
- show as toggle md3 switch component
- text to right of toggle - same size/style as "Chatty Cathy Work Request System" text, unless MD3 design specifies adjacent text style instead
- if toggled as recurring, show  adjacent text summary of how (like 'DAILY')
- if not toggled as recurring showing show  adjacent text "ONE TIME"
- actual toggle and time controlled by agent from conversation
### delete button:
- duplicate of above - see the Left column `conversation-items`
### agent active:
- duplicate of above - see the Left column `conversation-items`
### upload widget:
- do not enable back end, yet - that will be a subsequent ticket
- this is to place on the UI
- This widget already exists and should be used as provided.
- You might start by looking in `df-storage-demo.ts` and searching for `<df-upload-link` (line 169?)
### uploaded docs:
- this would be a listing of all files previously uploaded to this work request
- it would not be enabled - that would be a future ticket for visual placement purposes
- for this implementation 3 (fake, non-existent) files will be showing. [foo.md, bar.jpb, and yada.pdf]
- a small delete button is also showing next to each file uploaded, and also visual only, not functional
### user:
- where shows "USER" on the UI chat message, instead show the proper name from the authenticated user provided by firebase auth
- without the all caps
- with same size, color, font of current "USER" text
- make functional, for this ui
### assistant:
- where shows "ASSISTANT" on the UI chat message, instead show the first name of the agent (for all but the superuser this would be "Cathy")
- without the all caps
- with same size, color, font of current "USER" text

