# Ticket 0421a - SuperUser ONLY

This ticket provides the super user the ability to hot-wire the Chatty Cathy app, in order to break all the rules and chat direcly with any sub-agent. This ticket leaves a lot of details unanswered, which the coding agent will have to either figure out, or iterate through with Pete.

## Pre and Post Requirements:

This ticket focuses on changes to apps/df-openclaw-chat

1. Before loading the following ticket description into your context, read and follow guides/1_TICKET_BEFORE_LOADING.md
2. Then read the contents of this file into your context.
3. After loading the contents of this ticket into your context, read and follow guides/2_TICKET_AFTER_LOADING.md
4. Please understand that you are always required to follow the contents of relevant guides/ documents, even if they are not specified as a part of this ticket.

## Objective 1 - Identify candidate for Super User functionality

### Key result
- The app will know if it is the super user who is logged in

### Intent
- The app uses login information to know if it is the super user

## Strategy
- Use code discovery to determine which identity key to check against
- Use the identity provided by the firebase auth

## Tactics
- Hard code identity information inside the appropriate env file.
- Consult firebase auth, compare against identity information
- Store isSuperUser as a signals variable available to UI code for use as a toggle.
---

## Objective 2 - Provide a TripleClick trigger on the lobster image

### Key result
- When the user triple clicks on the lobster image, initiates sequence.

## Tactics
- Triple click is detected
- Causes user to be checked against possible super user
- if super user toggles isSuperUser to true
- UI code detects toggled value

---

## Objective 3 - Hidden Super User div is unHidden

### Key result
- The super user div is unhidden if 

## Tactics
- Super User div is un-hidden when signals isSuperUser is true

--- 

## Objective 4 - Super User div includes needed Components

### Key result
- Everything the super user needs to select any agent is provided.

### Intent
- The div includes a select

## Strategy
- Coding agent guesses at needed controls
- Use some experimentation with Pete to arrive at appropriate layout and controls required

## Tactics
- Iterate with Pete 

--- 
## Objective 5 - Picked Agent to Chat With

### Key result and intent
- Selected agent becomes the focus of the chat

## Strategy and tactics
- iteration

---

## Objective 6 - Hide existing Header

### Key result, intent, strategy, tactics
- When the Super User div is visible, the Chatty Cathy header should be hidden

---


## Objective 7 - Hard Reset of Browser Toggles Back to Normal Chatty Cathy Status

## Key Result
- User is now resuming chat with Cathy

---