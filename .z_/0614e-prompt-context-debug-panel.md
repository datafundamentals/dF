# Ticket 0614e: Add Prompt Context Debug Panel to Agent Work Request Widget

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

## Overview
Add a debug panel to the agent work request UI that displays the **exact full context prompt** sent to the LLM model (Cathy) with each message. This enables iterative refinement of the system prompt over multiple tickets, with full visibility into what the model receives.

## Motivation
- Prompt engineering requires visibility: understanding exactly what context Cathy receives is essential for optimizing behavior
- Currently, the system prompt is constructed server-side in the Cloud Function; there's no frontend visibility
- This debug panel will be temporary (dev-only), enabling weeks of iterative refinement before going to production
- The app is pre-production, so this poses no user impact

## Acceptance Criteria

### UI Component (`df-agent-work-request-widget.ts`)
1. **Toggle Button**
   - Add an `md-outlined-button` labeled "Toggle Prompt Context" (or similar)
   - Position: Below the Send button in the composer section
   - Visibility: Only show when a conversation is active
   - State: Toggles `@state() private showPromptDebugPanel = false`

2. **Debug Panel Textarea**
   - Add an `md-outlined-text-field` with `type="textarea"`
   - Position: Below the toggle button, above the work request preview markdown
   - Visibility: Only render when `showPromptDebugPanel === true`
   - Content: Display the **full prompt context string** (read-only, not editable)
   - Styling: 
     - Distinct background (perhaps `rgba(255, 200, 0, 0.08)` for a warm dev alert color)
     - Clear label: "Full Prompt Context (Debug)"
     - Disabled state (read-only)
     - Height: approximately 300px (allow scrolling for long prompts)
     - Font: Monospace for clarity
   - Copy behavior: Allow text selection so user can easily copy the full prompt

3. **Styling Integration**
   - Add CSS rules for `.debug-panel` and `.debug-textarea`
   - Use Material Design 3 tokens where possible
   - Ensure textarea is clearly distinguished from regular composer fields

### Cloud Function (`onOpenclawMessage.ts`)
1. **Capture Full Prompt Context**
   - When the system prompt is constructed (line 149-161), capture all relevant data:
     - `systemContent`: the full system context string
     - `historyMessages`: the complete message history array
     - `attachmentContext`: the attachment section of the prompt  
     - `requestBody`: the full request payload sent to OpenClaw (for complete visibility)
     - `userEmail`: the email of the user sending the message
     - `userFirstName`: extracted from displayName (substring before first space, stored in conversation doc at creation)
     - `metadata`: turn number, timestamp, agentId, etc.
   
2. **Store in Separate Collection**
   - Create a new collection: `promptContextDebug/{requestId}/{messageId}`
   - Write a complete debug document containing all captured data
   - This keeps rich debug information available without impacting message document size
   - Enables full transparency into what Cathy receives on each turn

### State Management (`@df/state`)
1. **Add New Debug State Hook**
   - Create a new state hook `openclawDebugPromptState` that reads from the `promptContextDebug` collection
   - Query `promptContextDebug/{activeRequestId}/{mostRecentMessageId}` when a new assistant message arrives
   - Expose the debug data through the signals-based state system

2. **Compute Full Prompt String**
   - Add a computed getter that combines the debug data into a human-readable format:
     ```
     [System Context]
     <systemContent>
     
     [Message History]
     Turn 1: User - <content>
     Turn 1: Assistant - <content>
     ...
     
     [Request Body Sent to OpenClaw]
     <full requestBody>
     
     [Metadata]
     - User: <userEmail>
     - Turn: <turnNumber>
     - Attachments: <count>
     - Constructed: <timestamp>
     ```

## Implementation Notes

### What Gets Exposed
The debug panel displays the **exact** context sent to Cathy:
- The full system prompt (title, context, directives)
- Attachment file list with URLs
- All prior message history in the session
- Complete request body payload
- User email
- User first name (extracted from displayName for personalization)
- Metadata (turn count, timestamp, agentId)

### Sensitive Data Policy
- **Expose everything useful**: This debug panel is internal-only during prompt refinement
- Include any data that helps debug Cathy's behavior: user email, full attachments, request IDs, etc.
- No token/secret values should appear, but all user and conversation data is fair game
- This will be removed or feature-flagged once the prompt reaches production quality

### Iteration Strategy
Once implemented, the workflow will be:
1. Send a message to Cathy
2. See the full prompt context in the debug panel
3. Iterate on `onOpenclawMessage.ts` → adjust system prompt
4. Redeploy function
5. Send another message
6. Compare prompts visually in the panel
7. Repeat until convergence

### Future Removal
This debug panel should be removed or made conditional on a feature flag once the prompt is finalized (likely many tickets from now). For now, it's always visible.

## Technical Details

### Affected Files
- `packages/ui-lit/src/df-agent-work-request-widget.ts` — Add UI toggle and textarea
- `services/functions/src/triggers/onOpenclawMessage.ts` — Capture and store prompt context
- `packages/state/src/...` (wherever Firestore state hooks live) — Expose debug data to UI

### Data Flow
```
1. User sends message
   ↓
2. Cloud Function triggered (onOpenclawMessage)
   ↓
3. System prompt constructed (line 149-161)
   ↓
4. DEBUG: Capture all context into debug object
   ↓
5. OpenClaw API called with full request
   ↓
6. Assistant reply received
   ↓
7. Write to promptContextDebug/{requestId}/{messageId} collection
   ↓
8. Write assistant message to messages subcollection
   ↓
9. UI queries promptContextDebug collection for latest turn
   ↓
10. User toggles button → sees full prompt context
```

### Firestore Schema: New Collection
Create new collection `promptContextDebug` with structure:
```typescript
// promptContextDebug/{requestId}/{messageId}
{
  systemContent: string;                    // Full system prompt text sent to model
  historyMessages: Array<{                  // Complete message history
    role: 'user' | 'assistant';
    content: string;
  }>;
  requestBody: {                            // Full OpenClaw request payload
    agentId: string;
    sessionKey: string;
    model: string;
    messages: Array<Record<string, unknown>>;
  };
  userEmail: string;                        // Email of user who sent this turn
  userFirstName: string;                    // First name extracted from displayName
  turnNumber: number;                       // Which turn this is
  attachmentsIncluded: boolean;             // Whether attachments were in context
  attachmentDetails?: Array<{               // Full attachment metadata
    name: string;
    url: string;
  }>;
  constructedAt: Timestamp;                 // When prompt was built
  openclawResponsePreview?: string;         // First 500 chars of Cathy's response
}
```

## Testing Strategy
1. Create a work request conversation
2. Send a message
3. Toggle the debug panel
4. Verify the textarea displays the full prompt context
5. Send another message with attachments
6. Verify attachments appear in the debug context
7. Modify the system prompt in the function
8. Redeploy and send a message
9. Verify the new prompt appears in the debug panel

## Scope & Constraints
- **Scope**: Debug-only UI addition + backend metadata capture (no logic changes)
- **Breaking Changes**: None (entirely additive)
- **Performance Impact**: Minimal (small string storage in Firestore)
- **Backwards Compatibility**: Old messages won't have `debugPromptContext`, so handle gracefully with fallback rendering

## Future Tickets
Once this is implemented, subsequent tickets can focus on:
- Refining the system prompt itself
- A/B testing different prompt approaches
- Measuring impact on Cathy's behavior
- Eventually, archiving or feature-flagging this debug panel
