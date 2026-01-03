import os
import re
import sys
import csv
from collections import defaultdict
from datetime import datetime
from pathlib import Path

ENV_PATH = Path("~/.env.keys").expanduser()
OUTPUT_DIR = Path("/Volumes/Seagate5T/meetingTranscriptLogs")
TRANSCRIPT_GLOB = "**/*.transcript"

DATE_RE = re.compile(r"\d{4}-\d{2}-\d{2}")
SPEAKER_RE = re.compile(r"^(?:\d{2}:\d{2}:\d{2}\s+)?([^:]{1,80}):\s+")


def load_env_keys(path: Path) -> dict:
    values = {}
    if not path.exists():
        return values
    for raw_line in path.read_text(encoding="utf-8", errors="ignore").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def extract_meeting_date(path: Path, fallback_dt: datetime) -> str:
    match = DATE_RE.search(path.name)
    if match:
        return match.group(0)
    return fallback_dt.strftime("%Y-%m-%d")


def count_speakers(path: Path) -> dict:
    counts = defaultdict(int)
    with path.open("r", encoding="utf-8", errors="ignore") as handle:
        for raw_line in handle:
            line = raw_line.strip()
            if not line:
                continue
            match = SPEAKER_RE.match(line)
            if not match:
                continue
            speaker = match.group(1).strip()
            if speaker:
                counts[speaker] += 1
    return counts


def format_speaker_list(counts: dict) -> str:
    if not counts:
        return "[]"
    ordered = sorted(counts.items(), key=lambda item: (-item[1], item[0].lower()))
    return "[" + ", ".join(f"{name} {count}" for name, count in ordered) + "]"


def build_summary_entries(transcripts: list[Path]) -> list[dict]:
    entries = []
    for path in transcripts:
        mtime = datetime.fromtimestamp(path.stat().st_mtime)
        date_str = extract_meeting_date(path, mtime)
        counts = count_speakers(path)
        entries.append(
            {
                "path": path,
                "date": date_str,
                "mtime": mtime,
                "counts": counts,
            }
        )
    return entries


def load_filter_normalize(base_path: Path) -> dict | None:
    filter_path = base_path / "filter_normalize.csv"
    if not filter_path.exists():
        return None

    allow = set()
    canonical_map = {}
    with filter_path.open("r", encoding="utf-8", errors="ignore", newline="") as handle:
        reader = csv.reader(handle)
        for row in reader:
            if not row or not row[0].strip():
                continue
            name = row[0].strip()
            alias = row[3].strip() if len(row) >= 4 and row[3].strip() else None
            allow.add(name.lower())
            canonical_map[name.lower()] = alias or name
            if alias:
                allow.add(alias.lower())
                canonical_map.setdefault(alias.lower(), alias)

    return {"allow": allow, "canonical_map": canonical_map}


def normalize_counts(counts: dict, filter_config: dict | None) -> dict:
    if filter_config is None:
        return counts

    allow = filter_config["allow"]
    canonical_map = filter_config["canonical_map"]
    normalized = defaultdict(int)
    for name, count in counts.items():
        key = name.lower()
        if key not in allow:
            continue
        canonical = canonical_map.get(key, name)
        normalized[canonical] += count
    return dict(normalized)


def apply_filter(entries: list[dict], filter_config: dict | None) -> list[dict]:
    if filter_config is None:
        return entries
    filtered = []
    for entry in entries:
        counts = normalize_counts(entry["counts"], filter_config)
        if not counts:
            continue
        updated = dict(entry)
        updated["counts"] = counts
        filtered.append(updated)
    return filtered


def assign_date_tokens(entries: list[dict]) -> list[dict]:
    grouped = defaultdict(list)
    for entry in entries:
        grouped[entry["date"]].append(entry)

    result = []
    for date_str, group in grouped.items():
        group_sorted = sorted(group, key=lambda item: item["mtime"])
        if len(group_sorted) == 1:
            group_sorted[0]["date_token"] = date_str
            result.append(group_sorted[0])
            continue

        used = set()
        for entry in group_sorted:
            token = f"{date_str}-{entry['mtime'].strftime('%H%M')}"
            if token in used:
                token = f"{date_str}-{entry['mtime'].strftime('%H%M%S')}"
            used.add(token)
            entry["date_token"] = token
            result.append(entry)
    return result


def write_summary(entries: list[dict], output_path: Path) -> None:
    lines = []
    for entry in sorted(entries, key=lambda item: (item["date_token"], item["path"].name)):
        counts = entry["counts"]
        participant_count = len(counts)
        plural = "" if participant_count == 1 else "s"
        speakers = format_speaker_list(counts)
        lines.append(
            f"{entry['date_token']}, {participant_count} participant{plural}, {speakers}"
        )

    output_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def sanitize_yaml_key(value: str) -> str:
    escaped = value.replace('"', '\\"')
    return f"\"{escaped}\""


def build_stats(entries: list[dict]) -> dict:
    stats = {}
    for entry in entries:
        date_token = entry["date_token"]
        for name, count in entry["counts"].items():
            record = stats.setdefault(
                name,
                {
                    "meeting_counts": [],
                    "meetings_attended": [],
                },
            )
            record["meeting_counts"].append(count)
            record["meetings_attended"].append(date_token)
    return stats


def write_stats(entries: list[dict], output_path: Path) -> None:
    stats = build_stats(entries)
    ordered = sorted(
        stats.items(),
        key=lambda item: (-len(item[1]["meetings_attended"]), item[0].lower()),
    )
    write_stats_from_ordered(ordered, output_path)


def write_stats_from_ordered(ordered: list[tuple[str, dict]], output_path: Path) -> None:
    lines = []
    for name, record in ordered:
        meetings = sorted(record["meetings_attended"])
        counts = record["meeting_counts"]
        meeting_count = len(meetings)
        mean = sum(counts) / meeting_count if meeting_count else 0
        lines.append(f"{sanitize_yaml_key(name)}:")
        lines.append(f"  meetingCount: {meeting_count}")
        lines.append(f"  meanParticipationCount: {mean:.1f}")
        lines.append(f"  firstMeetingAttended: {meetings[0] if meetings else ''}")
        lines.append(f"  lastMeetingAttended: {meetings[-1] if meetings else ''}")
        lines.append("  meetingsAttended:")
        for token in meetings:
            lines.append(f"    - {token}")
    output_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_analysis_csv(ordered: list[tuple[str, dict]], output_path: Path) -> None:
    with output_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle)
        for name, record in ordered:
            meetings = sorted(record["meetings_attended"])
            counts = record["meeting_counts"]
            meeting_count = len(meetings)
            mean = sum(counts) / meeting_count if meeting_count else 0
            first_meeting = meetings[0] if meetings else ""
            last_meeting = meetings[-1] if meetings else ""
            writer.writerow(
                [name, meeting_count, f"{mean:.1f}", first_meeting, last_meeting]
            )


def write_alias_prep(entries: list[dict], output_path: Path) -> None:
    stats = build_stats(entries)
    rows = []
    for name, record in stats.items():
        meetings = sorted(record["meetings_attended"])
        meeting_count = len(meetings)
        first_meeting = meetings[0] if meetings else ""
        rows.append((meeting_count, name, first_meeting))

    rows.sort(key=lambda item: (item[0], item[1].lower()))
    with output_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle)
        for meeting_count, name, first_meeting in rows:
            writer.writerow([name, first_meeting, meeting_count])


def main() -> int:
    env = load_env_keys(ENV_PATH)
    base_dir = env.get("MEETING_TRANSCRIPT_LOCATION")
    if not base_dir:
        print("Missing MEETING_TRANSCRIPT_LOCATION in ~/.env.keys")
        return 1

    base_path = Path(os.path.expanduser(base_dir)).resolve()
    if not base_path.exists():
        print(f"Transcript base directory not found: {base_path}")
        return 1

    transcripts = sorted(base_path.glob(TRANSCRIPT_GLOB))
    if not transcripts:
        print(f"No transcript files found under {base_path}")
        return 0

    entries = build_summary_entries(transcripts)
    entries = assign_date_tokens(entries)
    filter_config = load_filter_normalize(base_path)
    filtered_entries = apply_filter(entries, filter_config)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%y%m%d_%H%M%S")
    base_name = base_path.name or "transcripts"
    output_path = OUTPUT_DIR / f"{timestamp}_transcripts_{base_name}.txt"
    write_summary(filtered_entries, output_path)
    stats_path = OUTPUT_DIR / f"{timestamp}_transcripts_{base_name}_stats.yaml"
    stats = build_stats(filtered_entries)
    ordered_stats = sorted(
        stats.items(),
        key=lambda item: (-len(item[1]["meetings_attended"]), item[0].lower()),
    )
    write_stats_from_ordered(ordered_stats, stats_path)
    analysis_path = OUTPUT_DIR / f"{timestamp}_transcripts_{base_name}_analysis.csv"
    write_analysis_csv(ordered_stats, analysis_path)
    alias_prep_path = OUTPUT_DIR / f"{timestamp}_transcripts_{base_name}_alias_prep.csv"
    write_alias_prep(entries, alias_prep_path)

    print(f"Wrote summary to {output_path}")
    print(f"Wrote stats to {stats_path}")
    print(f"Wrote analysis to {analysis_path}")
    print(f"Wrote alias prep to {alias_prep_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
