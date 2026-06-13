# Ticket 0613a Git Persisence for Work Requests

## Executive Summary

This ticket makes a first iteration on using git as a persistence store for Work Request markdown documents.

When a work request is instatiated using the Work Request UI, this template is persisted into git, probably inside the firebase `services/functions/src/triggers/onOpenclawMessage.ts` function

Then each new turn of the UI persists yet one more commit of the entire markdown document.

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

This ticket focuses first on design review, then on coding. Especially note section below Expected Points of Friction. These should be resolved as much as possible, first.

Each Work Request document will be named `[OPENCLAW_WORK_REQUEST_ID].md` where OPENCLAW_WORK_REQUEST_ID is defined within firestore as within `openclawWorkRequests/{requestId}/` such as is noted on line 111 of `services/functions/src/triggers/onOpenclawMessage.ts` per this string `document: 'openclawWorkRequests/{requestId}/messages/{messageId}',`

When this ticket is complete, the current value of the string `appendedTurnMarkdown` as currently on line 663 of `packages/ui-lit/src/df-openclaw-chat-widget.ts` will be appended to the bottom of the Work Request markdown document, and committed and pushed to the Work Request on github.

It is entirely possible and reasonable that this ticket will change dramatically in scope if the design review indicates that the above prescribed scope is not the best course of action.

## Expected Points of Friction

This may not be a good design. So the coding agent executing this ticket is expected to evaluate this design before executing the work, and if necessary engaging me in a discussion - even a long discussion, if that is necessary. You are expected to use your good agentic judgement to confer advice when you see alternative designs that I am not yet understanding and/or considering.

There is also a fundamental lack of experience with using git and firebase firestore and firebase functions together in a single system. So there will be some guidance required as you inform me of aspects of this that I did not consider.

Compared to other git usages I am familiar with - this is a very hyperactive design. The idea of simply committing and pushing up each and every chat message to git with a total document re-write goes against my normal practice of making a git commit & push only as a well considered activity after much inspection and testing. So this is new territory for me, even if it does seem to make sense initially.

An additional point of friction involves token thrashing and low capability LLM models as a design strategy. The hyperactive nature of re-writing an entire document - which could get lengthy - with each new chat message - could get very expensive very fast if an expensive LLM model was used against a large context. The intent of the overall system design is to avoid such expenses where this is avoidable, especially when there is no inherent benefit to that design. So the coding agent is expected to help me mitigate such issues, when careful designs could accomplish that. Ideally, this would mean that this process is dumb enough to be handled if Cathy were an orouter/openai/gpt-4o-mini model. Would that even work? Not sure. Depends on what Cathy is asked to do. It seems that merely appending a string to a git file does not cause that whole file to become reloaded into the LLM context with every turn? Not sure - but if this is not the case I need to be informed accordingly.

## Exclusions

The behavior of the UI will not change, with this ticket. Only the git persistence layer.

Later tickets will address gates and the loading of this markdown document from git into other contexts for the purpose of gating and filtering.
 
## Design Documentation for the Openclaw Work Request System.

This Work Request system with df-openclaw-chat as it's entry point UI, is currently evolving as an iterative process.

Initially it was a chat-based system, and then this showed itself to be inadequate. It then began migrating to an event-loop based system.

The `tmp.md` file which populates the awr-markdown-codemirror widget is also an (incorrect/incomplete) document stating how this entire event-loop turn based system might work if designed from scratch.

It is noted, however, that tmp.md is incorrect because we are not starting from scratch - instead we are adapting a previously written codebase. For this reason, please read this document with an eye towards taking what helps and ignoring what does not help the completion of this ticket. 

This event-loop based system then evolved to clarify itself as a turn-based event-loop. More on this turn based system iteration is described within `guides/OPENCLAW_WORKFLOW.md` 

## Testing and Acceptance

This ticket is written to do one small step well, and not leave behind too much new code that would be considered a poor basis for moving forward on subsequent small tickets to follow. Any technical debt that is properly documented and still leaves the basic functional requirements of this ticket done is acceptable.

## Git Commit from Firebase Functions

With GitHub enforcing 2FA, we can no longer use standard password authentication for Git operations. This might throw a wrench in what we can accomplish from within firebase functions, for example. What follows below is from a gemini discussion on how to get past this potential blocker.

To push to GitHub from a headless environment like a Firebase Function, you must use a **Personal Access Token (PAT)** in place of your password. Because Firebase Functions run in an ephemeral container where the filesystem is read-only outside of the `/tmp` directory, using an HTTPS URL with an injected PAT is much cleaner and more reliable than attempting to configure SSH keys and an `ssh-agent` programmatically.

Here is the most secure and straightforward way to accomplish this.

### **1. Generate a Fine-Grained PAT**

GitHub's fine-grained tokens are ideal here because you can lock them down to a single repository, minimizing security risks if the token is ever exposed.

* Navigate to **GitHub Settings** -> **Developer Settings** -> **Personal access tokens** -> **Fine-grained tokens**.
* Select the specific repository your function will interact with.
* Under **Repository permissions**, grant **Read and Write** access to **Contents**.

---

### **2. Store the Token in Firebase Secret Manager**

Avoid hardcoding the token or using standard environment variables. Firebase's Secret Manager is the proper way to inject it securely at runtime.

```bash
firebase functions:secrets:set GITHUB_PAT

```

---

### **3. Execute the Git Sequence**

Working directly in the shell via Node's `child_process` gives you that granular, deliberate control over the exact Git execution sequence. Keep in mind that your function only has write access to `/tmp`, so the repository must be cloned, modified, and pushed entirely from that temporary directory.

Here is how you orchestrate the flow:

```javascript
const { execSync } = require('child_process');
const { onCall } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { rmSync, writeFileSync } = require('fs');

const githubPat = defineSecret('GITHUB_PAT');

exports.agentGitSync = onCall({ secrets: [githubPat] }, (request) => {
    const token = githubPat.value();
    const repoName = "your-repo-name";
    const username = "your-username";
    
    // Inject the PAT directly into the HTTPS URL
    const remoteUrl = `https://oauth2:${token}@github.com/${username}/${repoName}.git`;
    const tmpDir = `/tmp/${repoName}`;

    try {
        // 1. Clean up any previous ephemeral state in the container
        rmSync(tmpDir, { recursive: true, force: true });

        // 2. Clone the repository directly into /tmp
        execSync(`git clone ${remoteUrl} ${tmpDir}`);

        // 3. Write or modify the necessary files 
        // Example: Saving output from an automated agent process
        const agentOutput = JSON.stringify({ 
            agent_id: 17, 
            status: "complete", 
            timestamp: Date.now() 
        });
        writeFileSync(`${tmpDir}/agent-output.json`, agentOutput);

        // 4. Configure Git identity for the commit
        execSync(`git config user.name "Firebase Agent"`, { cwd: tmpDir });
        execSync(`git config user.email "agent@yourdomain.com"`, { cwd: tmpDir });

        // 5. Stage, Commit, and Push
        execSync(`git add .`, { cwd: tmpDir });
        execSync(`git commit -m "Automated state update"`, { cwd: tmpDir });
        execSync(`git push origin main`, { cwd: tmpDir });

        return { success: true, message: "Git push successful." };

    } catch (error) {
        console.error("Git operation failed:", error.message);
        throw new Error("Failed to execute git operations.");
    }
});

```

