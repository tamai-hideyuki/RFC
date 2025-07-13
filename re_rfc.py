#!/usr/bin/env python3
import uuid
from datetime import datetime, timezone, timedelta
from pathlib import Path

JST = timezone(timedelta(hours=9))
RFC_DIR = Path('./RFC')

for path in RFC_DIR.glob('*.text'):
    text = path.read_text(encoding='utf-8')
    if text.startswith('UUID:'):
        print(f"Skipped (already has header): {path.name}")
        continue

    header = (
        f"UUID: {uuid.uuid4()}\n"
        f"CREATED_AT: {datetime.now(JST).isoformat()}\n"
        "TITLE: rfc\n"
        "TAGS: rfc\n"
        "CATEGORY: RFC\n"
        "SCORE: 0.0\n"
        "---\n"
    )

    path.write_text(header + text, encoding='utf-8')
    print(f"Prepended header: {path.name}")
