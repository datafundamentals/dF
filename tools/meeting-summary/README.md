# Meeting Summary Tool

Crude Python script that scans nested Zoom `.transcript` files and produces a single log of attendance and speaker counts.

## Prerequisites

1. Create or update `~/.env.keys` with a transcript root path:
   ```bash
   MEETING_TRANSCRIPT_LOCATION=/Volumes/Seagate5T/ccZoomRecordings
   ```

## Usage

From the repo root:
```bash
python3 tools/meeting-summary/meeting_summary.py
```

## Output

The script writes a log file to `/Volumes/Seagate5T/meetingTranscriptLogs` with a timestamped name:
```
YYMMDD_HHMMSS_transcripts_<root-folder-name>.txt
```

It also writes a stats file alongside it:
```
YYMMDD_HHMMSS_transcripts_<root-folder-name>_stats.yaml
```

It also writes an alias prep CSV alongside it:
```
YYMMDD_HHMMSS_transcripts_<root-folder-name>_alias_prep.csv
```

It also writes an analysis CSV alongside it:
```
YYMMDD_HHMMSS_transcripts_<root-folder-name>_analysis.csv
```

Example line format:
```
2025-12-02, 3 participants, [Pete Carapetyan 49, Sahar 17, coltwarren 35]
```

Stats file notes:
- Entries are ordered by `meetingsAttended` size (descending).
- `meanParticipationCount` is a float with one decimal.

Alias prep notes:
- CSV rows are `name,firstMeetingAttended,meetingCount`.
- Rows are ordered by `meetingCount` then `name`, ascending.

Analysis CSV notes:
- CSV rows are `name,meetingCount,meanParticipationCount,firstMeetingAttended,lastMeetingAttended`.
- Rows match the same ordering as `_stats.yaml`.

## Optional filtering

If a `filter_normalize.csv` exists at the transcript root, the `.txt` and `_stats.yaml`
outputs are filtered/normalized:
- Only names in column 1 (and any canonical names in column 4) are included.
- Column 4 is treated as the canonical name for column 1 aliases.
- `filter_normalize.csv` does not affect the alias prep CSV.
