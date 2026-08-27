#!/usr/bin/env python3
"""Refresh the project-page total for ExoMind model-repository downloads."""

from __future__ import annotations

import argparse
import json
import os
import tempfile
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "docs" / "download-stats.json"

# These are the eight first-party repositories in the public ExoMind Collection.
OFFICIAL_REPOS = (
    "AI4SGI/ExoMind",
    "AI4SGI/ExoMind-Q4_K_M-GGUF",
    "AI4SGI/ExoMind-Q8_0-GGUF",
    "AI4SGI/ExoMind-F16-GGUF",
    "AI4SGI/ExoMind-9B",
    "AI4SGI/ExoMind-9B-Q4_K_M-GGUF",
    "AI4SGI/ExoMind-9B-Q8_0-GGUF",
    "AI4SGI/ExoMind-9B-F16-GGUF",
)

# Community releases explicitly linked from the official model cards.
COMMUNITY_HF_REPOS = (
    "mradermacher/ExoMind-i1-GGUF",
    "mradermacher/ExoMind-GGUF",
    "mradermacher/ExoMind-9B-i1-GGUF",
    "mradermacher/ExoMind-9B-GGUF",
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--timeout", type=float, default=20.0)
    parser.add_argument("--retries", type=int, default=3)
    return parser.parse_args()


def get_json(url: str, *, timeout: float, retries: int) -> dict[str, Any]:
    request = Request(
        url,
        headers={
            "Accept": "application/json",
            "User-Agent": "ExoMind-download-stats/1.0 (+https://github.com/AI4SGI/ExoMind)",
        },
    )
    last_error: Exception | None = None
    for attempt in range(retries):
        try:
            with urlopen(request, timeout=timeout) as response:
                if response.status != 200:
                    raise RuntimeError(f"unexpected HTTP status {response.status} for {url}")
                payload = json.load(response)
                if not isinstance(payload, dict):
                    raise TypeError(f"expected a JSON object from {url}")
                return payload
        except (HTTPError, URLError, TimeoutError, json.JSONDecodeError, RuntimeError) as exc:
            last_error = exc
            if attempt + 1 < retries:
                time.sleep(0.5 * (2**attempt))
    raise RuntimeError(f"failed to fetch {url} after {retries} attempts: {last_error}")


def checked_count(value: Any, *, source: str) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value < 0:
        raise ValueError(f"{source} returned an invalid download count: {value!r}")
    return value


def huggingface_count(repo_id: str, *, timeout: float, retries: int) -> int:
    encoded = "/".join(quote(part, safe="") for part in repo_id.split("/"))
    payload = get_json(
        f"https://huggingface.co/api/models/{encoded}?expand=downloadsAllTime",
        timeout=timeout,
        retries=retries,
    )
    return checked_count(payload.get("downloadsAllTime"), source=f"Hugging Face {repo_id}")


def modelscope_count(repo_id: str, *, timeout: float, retries: int) -> int:
    encoded = "/".join(quote(part, safe="") for part in repo_id.split("/"))
    payload = get_json(
        f"https://modelscope.cn/api/v1/models/{encoded}",
        timeout=timeout,
        retries=retries,
    )
    if payload.get("Code") != 200 or payload.get("Success") is not True:
        raise RuntimeError(f"ModelScope {repo_id} returned an unsuccessful response")
    data = payload.get("Data")
    if not isinstance(data, dict):
        raise TypeError(f"ModelScope {repo_id} response has no Data object")
    return checked_count(data.get("Downloads"), source=f"ModelScope {repo_id}")


def collect_counts(*, timeout: float, retries: int) -> dict[str, dict[str, int]]:
    jobs: list[tuple[str, str]] = []
    jobs.extend(("huggingFaceOfficial", repo) for repo in OFFICIAL_REPOS)
    jobs.extend(("huggingFaceCommunity", repo) for repo in COMMUNITY_HF_REPOS)
    jobs.extend(("modelScope", repo) for repo in OFFICIAL_REPOS)

    if len(jobs) != len(set(jobs)):
        raise RuntimeError("duplicate platform/repository entries in the download source list")

    results: dict[str, dict[str, int]] = {
        "huggingFaceOfficial": {},
        "huggingFaceCommunity": {},
        "modelScope": {},
    }

    def fetch(platform: str, repo_id: str) -> tuple[str, str, int]:
        if platform == "modelScope":
            count = modelscope_count(repo_id, timeout=timeout, retries=retries)
        else:
            count = huggingface_count(repo_id, timeout=timeout, retries=retries)
        return platform, repo_id, count

    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = [executor.submit(fetch, platform, repo) for platform, repo in jobs]
        for future in as_completed(futures):
            platform, repo_id, count = future.result()
            results[platform][repo_id] = count

    return {
        platform: dict(sorted(repos.items()))
        for platform, repos in results.items()
    }


def build_payload(counts: dict[str, dict[str, int]]) -> dict[str, Any]:
    components = {
        platform: sum(repos.values())
        for platform, repos in counts.items()
    }
    return {
        "schemaVersion": 1,
        "total": sum(components.values()),
        "updatedAt": datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "components": components,
        "sources": counts,
    }


def unchanged(existing: Any, updated: dict[str, Any]) -> bool:
    if not isinstance(existing, dict):
        return False
    return all(existing.get(key) == updated.get(key) for key in ("total", "components", "sources"))


def atomic_write(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    with tempfile.NamedTemporaryFile(
        mode="w",
        encoding="utf-8",
        dir=path.parent,
        prefix=f".{path.name}.",
        delete=False,
    ) as handle:
        handle.write(text)
        temporary = Path(handle.name)
    os.replace(temporary, path)


def main() -> int:
    args = parse_args()
    if args.retries < 1:
        raise ValueError("--retries must be at least 1")
    counts = collect_counts(timeout=args.timeout, retries=args.retries)
    payload = build_payload(counts)

    existing: Any = None
    if args.output.is_file():
        try:
            existing = json.loads(args.output.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            existing = None

    if unchanged(existing, payload):
        print(f"Download statistics unchanged: {payload['total']:,}")
        return 0

    atomic_write(args.output, payload)
    print(f"Wrote {args.output}: {payload['total']:,} total downloads")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
