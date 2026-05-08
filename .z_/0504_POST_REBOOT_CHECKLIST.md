# Post-Reboot Checklist: VM-to-Host Deploy Pipeline

After rebooting the Mac host (and restarting the VM), run through this checklist
if the deploy pipeline stops working.

---

## Step 1: Start the VM

The VM does not auto-start with the host. Start it manually in whatever app runs it,
then confirm it's reachable:

```bash
ping 192.168.64.3
```

---

## Step 2: Check Remote Login on the Mac Host

macOS sometimes shows Remote Login as ON in System Settings but doesn't actually
start the SSH daemon after a reboot. The symptom is that `ssh` from the VM to the
host is refused or times out.

**Check:**
```bash
lsof -i :22 -sTCP:LISTEN
```
If nothing appears, sshd is not running.

**Fix:** System Settings → General → Sharing → Remote Login → toggle **OFF**, then
back **ON**. This forces macOS to actually start the daemon.

---

## Step 3: Check the VM Watcher Service

The watcher should auto-start on VM boot (linger is enabled). Confirm it's running:

```bash
ssh pete@192.168.64.3 'systemctl --user status watch-wr-status --no-pager'
```

If it's not running:
```bash
ssh pete@192.168.64.3 'systemctl --user start watch-wr-status'
```

---

## Step 4: Quick End-to-End Test

Drop a file on the VM and confirm the deploy fires:

```bash
ssh pete@192.168.64.3 'echo "reboot test $(date)" >> /home/pete/WR_Status/helloworld.md'
```

Then check the host deploy log:
```bash
tail -f /tmp/deploy_reports.log
```

Expect to see `Deploy complete` within ~30 seconds. Verify at:
https://hbb-a1.web.app/WR_Status/helloworld/

---

## Reference: What Each Piece Does

| Component | Where | What it does |
|---|---|---|
| `watch_wr_status.sh` | VM: `/home/pete/scripts/` | Watches `/home/pete/WR_Status/` for new or modified `.md` files, triggers SSH |
| `watch-wr-status` systemd service | VM | Keeps the watcher running, auto-starts on VM boot |
| `authorized_keys` command restriction | Host: `~/.ssh/authorized_keys` | Locks VM's SSH key to only run `deploy_reports.sh` — no shell access |
| `deploy_reports.sh` | Host: `~/scripts/` | Pulls `.md` files from VM, runs Eleventy, deploys to Firebase |
| Remote Login (sshd) | Host: System Settings | Must be ON for the VM to reach the host via SSH |
| NVM | Host | Sourced inside `deploy_reports.sh` — no hardcoded node version path |

---

## Known Quirks

- **Remote Login toggle bug:** macOS may show Remote Login as ON after reboot but
  not actually run sshd. Always verify with `lsof -i :22 -sTCP:LISTEN`, not the
  System Settings toggle.

- **Watcher triggers on both CREATE and CLOSE_WRITE:** A new file triggers the
  deploy. So does saving changes to an existing file. Both are intentional.

- **Deploy log is at `/tmp/deploy_reports.log` on the host** — it persists across
  deploys but is cleared on host reboot (it's in `/tmp`).

- **Watcher log is at `/tmp/watch_wr_status.log` on the VM** — same: cleared on
  VM reboot.
