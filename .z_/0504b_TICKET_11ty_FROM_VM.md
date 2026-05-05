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

This ticket is **host-side infrastructure only** — SSH configuration, a bash deploy script, Eleventy (11ty) site generation, and Firebase Hosting deployment. `apps/df-openclaw-chat` is the upstream context (it will eventually trigger this pipeline), but that integration is out of scope here. No monorepo code is changed by this ticket.

1. Before loading the following ticket description into your context, read and follow `guides/1_TICKET_BEFORE_LOADING.md`
2. Then read the contents of this file into your context.
3. After loading the contents of this ticket into your context, read and follow `guides/2_TICKET_AFTER_LOADING.md`
4. Please understand that you are always required to follow the contents of relevant guides/ documents, even if they are not enumerated as a part of this ticket.
5. Only Pete (human user) can commit or push changes to the 0504b branch of dF. This is off limits to the coding agent.
6. Each phase (0-5 below) must start with Pete acknowledging that a checkpoint commit has occurred so that the 0504b branch is starting off with no diffs before starting that phase.

---

## Phase 0: Connectivity Verification & Host Hardening ✅ COMPLETE
**Context:** The VM must be able to "nudge" the Host via SSH without a password, and the Host must restrict that "nudge" to a specific script.

**Action Item 1: VM Key Retrieval (User Intervention Required)**
1.  User will provide the Public Key from the VM (`~/.ssh/id_rsa.pub` or similar).
2.  **Agent:** On the Host, append this key to `~/.ssh/authorized_keys`.
3.  **Agent:** **CRITICAL:** Prefix this specific entry with the restriction:
    `command="/Users/petecarapetyan/scripts/deploy_reports.sh",no-port-forwarding,no-x11-forwarding,no-agent-forwarding`

**Confirmed values:**
- Host user: `petecarapetyan`, Host home: `/Users/petecarapetyan/`
- VM user: `pete`, VM IP: `192.168.64.3`, VM home: `/home/pete`
- Host IP (as seen from VM): `192.168.64.1`

**Action Item 2: Host-to-VM Permission**
1.  **Agent:** Verify the Host can `scp` from the VM using the existing connection.
2.  **Note:** `ssh pete@192.168.64.3` works from the Host. The deployment script should use this path.

**Success Criteria:**
* The Host's `authorized_keys` file contains the VM's public key with the `command` restriction correctly formatted.
* Running `ssh [host-user]@[host-ip]` from the VM triggers the (currently empty) script and then exits.

---

## Step 1: Host-Side Build Script Creation ✅ COMPLETE
**Action:** Create a robust bash script on the Host that handles the data pull and deployment.
* **File Path:** `~/scripts/deploy_reports.sh`
* **Confirmed variable values:**
    - `VM_USER=pete`
    - `VM_IP=192.168.64.3`
    - `VM_PATH=/home/pete/WR_Status` *(top-level in home, outside `.openclaw/` — not an agent workspace)*
    - `LOCAL_PATH=/Users/petecarapetyan/work/primary/sites/hbb/site/WR_Status`
* **Eleventy project root:** `/Users/petecarapetyan/work/primary/sites/hbb/`
    - Config: `eleventy.config.js` (already exists)
    - Firebase: `firebase.json` (already exists)
* **Requirements:**
    1. Define variables for `VM_USER`, `VM_IP`, `VM_PATH`, and `LOCAL_PATH` using values above.
    2. Use `scp` to pull files from the VM into `LOCAL_PATH`.
    3. `cd` to the Eleventy project root, then execute `nice -n 19 npx @11ty/eleventy`.
    4. Execute `firebase deploy --only hosting` from the same directory.
    5. Ensure the script is executable (`chmod +x`).

**Success Criteria:**
* Running the script manually on the Host successfully pulls a dummy file from the VM and completes a Firebase deployment.

---

## Step 2: SSH Key Restriction (The Security Gate) ✅ COMPLETE
**Action:** Configure the Host to allow the VM to trigger *only* the script created in Step 1.
* **File Path:** `~/.ssh/authorized_keys` (on Host).
* **Requirements:**
    1. Locate the public key belonging to the VM.
    2. Prefix the key with the `command` constraint: `command="/Users/petecarapetyan/scripts/deploy_reports.sh",no-port-forwarding,no-x11-forwarding,no-agent-forwarding`.

**Success Criteria:**
* Attempting to SSH from the VM to the Host (e.g., `ssh user@host "ls /"`) results in the execution of the deployment script instead of a directory listing.
* The connection must terminate immediately after the script finishes.

---

## Step 3: Implement Post-Deployment Notification *(Deferred — out of scope)*
**Deferred reason:** No ready notification endpoint exists. Locating or creating one requires significant investigation across prior tickets and is a separate body of work.

**Future ticket should cover:**
* Identify or create a Firebase function / Firestore write endpoint that accepts a "Published" status signal.
* Append a `curl` POST to `deploy_reports.sh` once the endpoint URL is known.
* Payload should include `"status": "success"` and optionally the URL slug of the updated file.

---

## Step 4: End-to-End Integration Test ✅ COMPLETE
**Action:** Trigger the entire flow from within the VM.
* **Command:** `ssh petecarapetyan@192.168.64.1`
* **Note:** No command argument is needed or meaningful — the `command=` restriction in `authorized_keys` always runs `deploy_reports.sh` regardless of any argument passed.
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