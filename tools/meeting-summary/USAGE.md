# Usage: Meeting Summary Tool

This tool scans nested Zoom `.transcript` files and produces summary outputs in `/Volumes/Seagate5T/meetingTranscriptLogs`.

## Required setup

1. Create or update `~/.env.keys` with the transcript root:
   ```bash
   MEETING_TRANSCRIPT_LOCATION=/Volumes/Seagate5T/ccZoomRecordings
   ```
2. Ensure the transcript root exists and contains `.transcript` files in nested folders.

## Optional filtering and normalization

This is a time consuming process and you probably wouldn't do it very often if ever, because every new meeting could create new data that you might be interested in, and there is no current automation for reconciling new vs old data. I did this only after coders campus closed, so the data would be static from that point forward.

On the other hand, it is easy to remove those who only show up once or a few times, because they are always at the top of the raw data, as it is sorted by number of meetings attended - ascending.

If a `filter_normalize.csv` file exists at the transcript root, it will be used to filter
and normalize the `.txt` and `_stats.yaml` outputs.

This file was created by copying `..._alias_prep.csv` to `filter_normalize.csv`, placing it at the root of the directory, and then

1. Removing those who are not serious long term attendees that I am interested in tracking
2. Aliasing as below, for those who have multiple zoom names. (see column 1, 4)

- Column 1: allowed names (case-insensitive). Only these names are kept.
- Column 4 (optional): canonical name. If present, column 1 is treated as an alias and
  is attributed to the column 4 name.
- Columns 2 and 3 are ignored.
- `filter_normalize.csv` does not affect `*_alias_prep.csv`.

Example:
```
Miriam Law,2024-03-25-2200,554
Miriam,2024-01-05-2122,21,Miriam Law (This will alias all the 'Miriam' names as 'Miriam Law')
```


## Run

From the repo root:
```bash
python3 tools/meeting-summary/meeting_summary.py
```

## Output files

All files are written to `/Volumes/Seagate5T/meetingTranscriptLogs`:

- `YYMMDD_HHMMSS_transcripts_<root-folder>.txt`
- `YYMMDD_HHMMSS_transcripts_<root-folder>_stats.yaml`
- `YYMMDD_HHMMSS_transcripts_<root-folder>_analysis.csv`
- `YYMMDD_HHMMSS_transcripts_<root-folder>_alias_prep.csv`

## Notes

- If no transcripts are found, the tool exits without writing files.
- When multiple transcripts share the same date, the summary uses file mtime (HHMM) to
  disambiguate entries.
