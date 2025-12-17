# Elasticsearch Batch Loader

> Tier: 3 (Load on Demand)
>
> For Agents: Use when loading local `daily/batch` documents into Elasticsearch.

Python script to push local documents into an Elasticsearch index via the `_bulk` API. Designed for quick experiments (vector work, search tuning) before more formalized tooling exists.

## Prereqs
- Python 3 available as `python3`
- Elasticsearch reachable (default: `http://localhost:9200`)
- API key with write access (see `.z_/future/_ELASTIC_SETUP.md`)

## Quick start (from repo root)
```sh
python3 tools/elastic-loader/load_elastic_batch.py \
  --api-key <YOUR_API_KEY> \
  --endpoint http://localhost:9200 \
  --index daily-batch
```

## Options
- `--endpoint` (default `ELASTIC_ENDPOINT` or `http://localhost:9200`): Elasticsearch URL.
- `--api-key` (default `ELASTIC_API_KEY`): API key for `ApiKey` auth.
- `--index` (default `ELASTIC_INDEX` or `daily-batch`): Target index (think “table”). Created automatically unless `--skip-create-index`.
- `--data-dir` (default `../daily/batch`): Directory to read; accepts files recursively.
- `--batch-size` (default 200): Docs per `_bulk` request.
- `--limit N`: Process only the first N files (safety / testing).
- `--dry-run`: Print counts and a sample; no Elasticsearch calls.
- `--skip-create-index`: Do not attempt index creation; expect it to exist.

## Behavior
- Each document includes `path`, `filename`, `extension`, `size`, `modified`, `content`.
- Stable IDs based on relative path; re-running updates the same docs.
- Default mapping: keywords for filenames, text for `content`, date for `modified`.

## Examples
Preview a subset:
```sh
python3 tools/elastic-loader/load_elastic_batch.py --dry-run --limit 5
```

Load from an alternate directory into a scratch index:
```sh
python3 tools/elastic-loader/load_elastic_batch.py \
  --api-key <YOUR_API_KEY> \
  --endpoint http://localhost:9200 \
  --index daily-batch-test \
  --data-dir ../daily/batch-ollama-runner/_sample5/src/
```

## Troubleshooting
- `no host given`: Ensure `--endpoint` is on one line, e.g. `http://localhost:9200`.
- Auth errors: verify the API key matches the target cluster.
- Mapping issues: drop/recreate the index (e.g., `DELETE <index>` in Kibana Dev Tools) and rerun; or use `--index` with a new name.
