#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import uuid
from datetime import datetime, timezone, timedelta
from pathlib import Path

JST = timezone(timedelta(hours=9))

src_dir = Path("./RFC")
out_dir = Path("./rfc_out")
out_dir.mkdir(parents=True, exist_ok=True)

log_dir  = Path("./log")
log_dir.mkdir(parents=True, exist_ok=True)
log_path = log_dir / "log.text"

with log_path.open("a", encoding="utf-8") as log_file:
    for src_path in src_dir.glob("*.text"):
        filename = src_path.name 
        stem     = src_path.stem 

        lines = src_path.read_text(encoding="utf-8").splitlines(keepends=True)

        if lines and lines[0].startswith("UUID:"):
            print(f"Skipped (already has header): {filename}")
            continue

        title_line = lines[4].strip() if len(lines) > 4 else ""

        if title_line == "翻訳編集 : 自動生成":
            log_file.write(f"{filename}\n")
            print(f"Logged auto-generated: {filename}")
            title_line = ""

        new_uuid      = uuid.uuid4().hex
        created_at_ts = datetime.now(JST).isoformat()

        header = (
            f"UUID: {new_uuid}\n"
            f"CREATED_AT: {created_at_ts}\n"
            f"TITLE: {title_line}\n"
            "TAGS: rfc\n"
            "CATEGORY: RFC\n"
            "SCORE: 0.0\n"
            "---\n"
        )

        dst_path = out_dir / f"{stem}.txt"

        dst_path.write_text(header + "".join(lines), encoding="utf-8")
        print(f"Wrote: {dst_path.name}")

print(f"All records appended to {log_path}")
