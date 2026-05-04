# Ticket 0504b: Implement Isolated Secure Trigger for Automated Report Deployment

## Context
We are implementing a "One-Way Trigger" system. An isolated Virtual Machine (VM) needs to signal the Host machine to pull content, build a static site, and deploy it. The goal is to allow the VM to initiate the process without giving the VM write access or administrative control over the Host.

## Technical Stack
* **Source:** Markdown files located in a VM.
* **Orchestrator:** Bash/Shell on Host.
* **SSO/Transport:** SSH with restricted `authorized_keys`.
* **Static Site Generator:** Eleventy (11ty).
* **Deployment:** Firebase Hosting.

---

## Pre and Post Requirements

This ticket focuses on changes to `apps/df-openclaw-chat` or related code.

1. Before loading the following ticket description into your context, read and follow `guides/1_TICKET_BEFORE_LOADING.md`
2. Then read the contents of this file into your context.
3. After loading the contents of this ticket into your context, read and follow `guides/2_TICKET_AFTER_LOADING.md`
4. Please understand that you are always required to follow the contents of relevant guides/ documents, even if they are not enumerated as a part of this ticket.
5. Only Pete (human user) can commit or push changes to the 0504b branch of dF. This is off limits to the coding agent.
6. Each phase (0-5 below) must start with Pete acknowledging that a checkpoint commit has occurred so that the 0504b branch is starting off with no diffs before starting that phase.

---

## Phase 0: Connectivity Verification & Host Hardening
**Context:** The VM must be able to "nudge" the Host via SSH without a password, and the Host must restrict that "nudge" to a specific script.

**Action Item 1: VM Key Retrieval (User Intervention Required)**
1.  User will provide the Public Key from the VM (`~/.ssh/id_rsa.pub` or similar).
2.  **Agent:** On the Host, append this key to `~/.ssh/authorized_keys`.
3.  **Agent:** **CRITICAL:** Prefix this specific entry with the restriction: 
    `command="/home/[user]/scripts/deploy_reports.sh",no-port-forwarding,no-x11-forwarding,no-agent-forwarding`

**Action Item 2: Host-to-VM Permission**
1.  **Agent:** Verify the Host can `scp` from the VM using the existing connection. 
2.  **Note:** The user has confirmed `ssh pete@192.168.64.3` works from the Host. The deployment script should utilize this existing path.

**Success Criteria:**
* The Host's `authorized_keys` file contains the VM's public key with the `command` restriction correctly formatted.
* Running `ssh [host-user]@[host-ip]` from the VM triggers the (currently empty) script and then exits.

---

## Step 1: Host-Side Build Script Creation
**Action:** Create a robust bash script on the Host that handles the data pull and deployment.
* **File Path:** `~/scripts/deploy_reports.sh`
* **Requirements:**
    1. Define variables for `VM_USER`, `VM_IP`, `VM_PATH`, and `LOCAL_PATH`.
    2. Use `scp` to pull files from the VM to the local Eleventy source folder.
    3. Execute `npx @11ty/eleventy`.
    4. Execute `firebase deploy --only hosting`.
    5. Ensure the script is executable (`chmod +x`).

**Success Criteria:**
* Running the script manually on the Host successfully pulls a dummy file from the VM and completes a Firebase deployment.

---

## Step 2: SSH Key Restriction (The Security Gate)
**Action:** Configure the Host to allow the VM to trigger *only* the script created in Step 1.
* **File Path:** `~/.ssh/authorized_keys` (on Host).
* **Requirements:**
    1. Locate the public key belonging to the VM.
    2. Prefix the key with the `command` constraint: `command="/home/[user]/scripts/deploy_reports.sh",no-port-forwarding,no-x11-forwarding,no-agent-forwarding`.

**Success Criteria:**
* Attempting to SSH from the VM to the Host (e.g., `ssh user@host "ls /"`) results in the execution of the deployment script instead of a directory listing.
* The connection must terminate immediately after the script finishes.

---

## Step 3: Implement Post-Deployment Notification
**Action:** Update the Firebase environment to signal a successful "Published" state.
* **Option A (Shell):** Append a `curl` POST request to the end of `deploy_reports.sh` that hits the Firebase app’s gateway API.
* **Option B (Firebase Hook):** Add a `"postdeploy": "node scripts/notify.js"` entry to `firebase.json`.
* **Requirements:** 1. The payload must include a "status": "success" message.
    2. (Optional) Include the URL slug derived from the updated file.

**Success Criteria:**
* After a successful deployment, the Firebase app's database or logs reflect the "Published" status update.

---

## Step 4: End-to-End Integration Test
**Action:** Trigger the entire flow from within the VM.
* **Command:** `ssh [host-user]@[host-ip] "deploy"`
* **Requirements:**
    1. No password prompt (must use SSH keys).
    2. Observe the Host's process list to ensure `eleventy` and `firebase-tools` trigger.
    3. Verify the new content is live on the public URL.

**Success Criteria:**
* A single command from the VM results in:
    1. Files transferred.
    2. Site rebuilt.
    3. Hosting updated.
    4. Firebase app notified.

---

## Safety Constraints
* **No Sudo:** The agent should not require `sudo` for any part of the 11ty or Firebase workflow.
* **Local Scope:** All file paths must be absolute to avoid context errors during SSH execution.
* **Resource Awareness:** Use `nice -n 19` for the 11ty build command to ensure low CPU priority on the Host.