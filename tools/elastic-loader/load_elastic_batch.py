#!/usr/bin/env python3
"""Load documents from ../daily/batch into Elasticsearch for experimentation."""

import argparse
import hashlib
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Iterable, Iterator, List, Optional
from urllib import error, request


DEFAULT_ENDPOINT = os.environ.get("ELASTIC_ENDPOINT", "http://localhost:9200")
DEFAULT_API_KEY_ENV = "ELASTIC_API_KEY"
DEFAULT_INDEX = os.environ.get("ELASTIC_INDEX", "daily-batch")
DEFAULT_BATCH_SIZE = 200
DEFAULT_DATA_DIR = Path(__file__).resolve().parent.parent.parent / "daily" / "batch"


def read_api_key_from_env_keys() -> Optional[str]:
    """Read ELASTIC_API_KEY from ~/.env.keys file (matching extension behavior)."""
    env_keys_path = Path.home() / ".env.keys"
    if not env_keys_path.exists():
        return None

    try:
        content = env_keys_path.read_text(encoding="utf-8")
        for line in content.splitlines():
            line = line.strip()
            if line.startswith("ELASTIC_API_KEY="):
                key = line.split("=", 1)[1].strip()
                # Remove quotes if present
                if (key.startswith('"') and key.endswith('"')) or (key.startswith("'") and key.endswith("'")):
                    key = key[1:-1]
                return key
    except Exception:
        pass

    return None


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Bulk load local documents into Elasticsearch using the _bulk API.",
    )
    parser.add_argument(
        "--endpoint",
        default=DEFAULT_ENDPOINT,
        help=f"Elasticsearch endpoint (default: {DEFAULT_ENDPOINT})",
    )

    # Try to get API key from: 1) env var, 2) ~/.env.keys
    default_api_key = os.environ.get(DEFAULT_API_KEY_ENV) or read_api_key_from_env_keys()

    parser.add_argument(
        "--api-key",
        default=default_api_key,
        help=f"API key, set {DEFAULT_API_KEY_ENV} env var, or add to ~/.env.keys",
    )
    parser.add_argument(
        "--index",
        default=DEFAULT_INDEX,
        help=f"Target index name (default: {DEFAULT_INDEX})",
    )
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=DEFAULT_DATA_DIR,
        help=f"Directory containing documents (default: {DEFAULT_DATA_DIR})",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=DEFAULT_BATCH_SIZE,
        help=f"Number of docs to send per bulk request (default: {DEFAULT_BATCH_SIZE})",
    )
    parser.add_argument(
        "--limit",
        type=int,
        help="Process only the first N files (useful for testing).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Read files and summarize without sending to Elasticsearch.",
    )
    parser.add_argument(
        "--skip-create-index",
        action="store_true",
        help="Do not attempt to create the index if missing.",
    )
    return parser.parse_args()


def build_headers(api_key: str, content_type: Optional[str] = None) -> Dict[str, str]:
    headers = {
        "Authorization": f"ApiKey {api_key}",
        "Accept": "application/json",
    }
    if content_type:
        headers["Content-Type"] = content_type
    return headers


def http_request(
    method: str, url: str, *, data: Optional[bytes], headers: Dict[str, str]
) -> Dict[str, object]:
    req = request.Request(url, data=data, headers=headers, method=method)
    try:
        with request.urlopen(req, timeout=60) as resp:
            body = resp.read()
            return {"status": resp.status, "body": body}
    except error.HTTPError as exc:
        body = exc.read()
        return {"status": exc.code, "body": body}
    except error.URLError as exc:
        raise RuntimeError(f"Request to {url} failed: {exc.reason}") from exc


def ensure_index(endpoint: str, index: str, api_key: str) -> None:
    headers = build_headers(api_key)
    base_url = endpoint.rstrip("/")
    head_resp = http_request("HEAD", f"{base_url}/{index}", data=None, headers=headers)
    if head_resp["status"] == 200:
        return
    if head_resp["status"] not in (404, "404"):
        body = head_resp.get("body", b"") or b""
        raise RuntimeError(
            f"Unexpected response checking index {index}: {head_resp['status']} {body!r}"
        )

    payload = {
        "settings": {
            "index": {
                "number_of_shards": 1,
                "number_of_replicas": 0,
            }
        },
        "mappings": {
            "properties": {
                "path": {"type": "keyword"},
                "filename": {"type": "keyword"},
                "extension": {"type": "keyword"},
                "size": {"type": "long"},
                "modified": {"type": "date", "format": "strict_date_time"},
                "content": {"type": "text"},
            }
        },
    }
    create_headers = build_headers(api_key, "application/json")
    resp = http_request(
        "PUT",
        f"{base_url}/{index}",
        data=json.dumps(payload).encode("utf-8"),
        headers=create_headers,
    )
    if resp["status"] not in (200, 201):
        raise RuntimeError(
            f"Failed to create index {index}: {resp['status']} {resp.get('body', b'')!r}"
        )


def gather_documents(
    data_dir: Path, *, limit: Optional[int] = None
) -> Iterator[Dict[str, object]]:
    if not data_dir.exists():
        raise FileNotFoundError(f"Data directory not found: {data_dir}")

    count = 0
    for path in sorted(data_dir.rglob("*")):
        if not path.is_file():
            continue
        rel_path = path.relative_to(data_dir)
        stat = path.stat()
        content = path.read_text(encoding="utf-8", errors="replace")
        doc_id = hashlib.sha1(str(rel_path).encode("utf-8")).hexdigest()
        yield {
            "id": doc_id,
            "path": str(rel_path),
            "filename": path.name,
            "extension": path.suffix.lstrip("."),
            "size": stat.st_size,
            "modified": datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat(),
            "content": content,
        }
        count += 1
        if limit and count >= limit:
            break


def chunked(iterable: Iterable[Dict[str, object]], size: int) -> Iterator[List[Dict[str, object]]]:
    batch: List[Dict[str, object]] = []
    for item in iterable:
        batch.append(item)
        if len(batch) >= size:
            yield batch
            batch = []
    if batch:
        yield batch


def bulk_index(
    endpoint: str, index: str, api_key: str, batch: List[Dict[str, object]]
) -> None:
    if not batch:
        return

    lines: List[str] = []
    for doc in batch:
        action = {"index": {"_index": index, "_id": doc["id"]}}
        body = {k: v for k, v in doc.items() if k != "id"}
        lines.append(json.dumps(action, separators=(",", ":")))
        lines.append(json.dumps(body, ensure_ascii=False))
    payload = ("\n".join(lines) + "\n").encode("utf-8")

    headers = build_headers(api_key, "application/x-ndjson")
    url = f"{endpoint.rstrip('/')}/{index}/_bulk"
    resp = http_request("POST", url, data=payload, headers=headers)
    if resp["status"] >= 300:
        raise RuntimeError(
            f"Bulk request failed with status {resp['status']}: {resp.get('body', b'')!r}"
        )

    body_bytes = resp.get("body", b"")
    if not body_bytes:
        return

    parsed = json.loads(body_bytes)
    if parsed.get("errors"):
        error_items = [
            item
            for item in parsed.get("items", [])
            if item.get("index", {}).get("error")
        ]
        sample_error = error_items[0]["index"]["error"] if error_items else {}
        raise RuntimeError(f"Elasticsearch reported errors: {sample_error}")


def summarize_documents(docs: Iterator[Dict[str, object]], sample_size: int = 3) -> None:
    total = 0
    sample: List[Dict[str, object]] = []
    for doc in docs:
        total += 1
        if len(sample) < sample_size:
            sample.append(doc)
    print(f"Found {total} documents to process.")
    if sample:
        print("Sample:")
        for item in sample:
            print(
                f"- {item['path']} ({item['size']} bytes, modified {item['modified']})"
            )


def main() -> None:
    args = parse_args()
    if not args.api_key and not args.dry_run:
        sys.exit(f"Missing API key. Provide --api-key or set {DEFAULT_API_KEY_ENV}.")

    data_dir = args.data_dir.expanduser().resolve()
    if not data_dir.exists():
        sys.exit(f"Data directory does not exist: {data_dir}")

    docs_iterator = gather_documents(data_dir, limit=args.limit)

    if args.dry_run:
        summarize_documents(docs_iterator)
        return

    if not args.skip_create_index:
        ensure_index(args.endpoint, args.index, args.api_key)

    processed = 0
    for batch in chunked(docs_iterator, args.batch_size):
        bulk_index(args.endpoint, args.index, args.api_key, batch)
        processed += len(batch)
        print(f"Indexed {processed} documents so far...")

    print(f"Done. Indexed {processed} documents into '{args.index}'.")


if __name__ == "__main__":
    main()
