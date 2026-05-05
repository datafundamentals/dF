# Ticket 0504c: Hello World End-to-End Trigger Test

## Context
Ticket 0504b established the full deploy pipeline: a file appears in `/home/pete/WR_Status/` on the VM → host pulls it → Eleventy builds → Firebase deploys.

This ticket validates that pipeline end-to-end with a real (if trivial) file, and sets up the VM-side watcher so the trigger is automatic rather than manual.

The intended production flow is:
1. An agent reaches "Accepted" state on a work request
2. Agent writes `[firestoreDocId].md` to `/home/pete/WR_Status/` on the VM
3. VM watcher detects the new file → SSH trigger fires → host deploys automatically
4. Content is live at https://hbb-a1.web.app

This ticket implements steps 2-4 with a manually written `helloworld.md` as a stand-in for step 2. How files get onto the VM (agent behavior, UI integration) is out of scope here.

---

## Pre and Post Requirements

This ticket is **VM-side infrastructure only.** No monorepo code changes.

1. Before loading this ticket, read and follow `guides/1_TICKET_BEFORE_LOADING.md`
2. Then read this file.
3. After loading, read and follow `guides/2_TICKET_AFTER_LOADING.md`
4. Follow all relevant guides even if not explicitly listed here.
5. Only Pete can commit or push to the 0504b branch. This is off limits to the coding agent.

---

## Phase 0: VM-Side Filesystem Watcher

**Goal:** Whenever any `.md` file is created in `/home/pete/WR_Status/`, the deploy pipeline fires automatically on the host — no manual SSH required.

**Action:** Set up an `inotifywait`-based watcher script on the VM.

**File path on VM:** `/home/pete/scripts/watch_wr_status.sh`

**Requirements:**
1. Use `inotifywait` (package: `inotify-tools`) — install if not present.
2. Watch for `CREATE` events in `/home/pete/WR_Status/`.
3. On any CREATE event: run `ssh petecarapetyan@192.168.64.1` (triggers `deploy_reports.sh` via the `command=` restriction from ticket 0504b).
4. Run as a `systemd` user service so it starts automatically on VM boot.
5. Log watcher activity to `/tmp/watch_wr_status.log`.

**Success Criteria:**
- `touch /home/pete/WR_Status/probe.md` on the VM → deploy fires on the host with no further action.
- Service survives a VM reboot.

---

## Phase 1: Hello World End-to-End Test

**Goal:** Confirm the full pipe works with a real file.

**Action:** Manually write `helloworld.md` to `/home/pete/WR_Status/` on the VM.

**File content:**
```markdown
---
title: Hello World
date: (current date at time of write)
status: test
---

This page confirms the VM-to-host deploy pipeline is working.
If you can read this at https://hbb-a1.web.app/WR_Status/helloworld/, the pipeline works.
```

**Verification:**

| Stage | How to verify |
|---|---|
| File created on VM | `ls /home/pete/WR_Status/helloworld.md` |
| Watcher fired | `/tmp/watch_wr_status.log` shows CREATE event |
| Deploy ran on host | `/tmp/deploy_reports.log` shows build + firebase deploy |
| Site updated | `https://hbb-a1.web.app/WR_Status/helloworld/` renders correctly |

---

## Safety Constraints
- No sudo required for any part of this ticket.
- All VM-side scripts use absolute paths.
