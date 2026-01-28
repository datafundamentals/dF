# Daily Site Publisher

A Python tool to scan the configured sites in `SITES.yaml` and check for recent content updates.

## Setup

This tool uses a shared virtual environment located in `dF/tools/venv`.

If you haven't set up the shared environment yet:

```bash
# From the dF root or tools root
python3 -m venv tools/venv
source tools/venv/bin/activate
pip install -r tools/requirements.txt
```

## Config

The tool reads from `dF/SITES.yaml`. Ensure your site entries have:

- `since`: Timestamp to check from (e.g., `2025-05-20 14:30:00`)
- `contentRoot`: Path to the content folder relative to dF root (e.g., `../content`)
- `content`: Subdirectory name for the site content

## Usage

Run the script using the shared virtual environment:

```bash
# From the dF workspace root
tools/venv/bin/python tools/daily-pub/daily_pub.py
```

## Features

- Scans all sites in `SITES.yaml`.
- Validates paths and configuration.
- Checks git history for changes since the `since` date.
- Outputs a list of changed files with timestamps.
