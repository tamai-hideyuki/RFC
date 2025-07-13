#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from pathlib import Path

src_dir = Path("./rfc_out")

log_dir  = Path("./log")
log_dir.mkdir(parents=True, exist_ok=True)
log_path = log_dir / "empty_title_files.txt"

with log_path.open("w", encoding="utf-8") as log_file:

    for path in src_dir.glob("*.txt"):
        lines = path.read_text(encoding="utf-8").splitlines()

        if len(lines) < 3:
            log_file.write(f"{path.name}\n")
            print(f"NG (no 3rd line): {path.name}")
            continue

        third = lines[2]

        if third.strip() == "TITLE:" or third == "TITLE: ":
            log_file.write(f"{path.name}\n")
            print(f"NG (empty title): {path.name}")
        else:
            print(f"OK: {path.name}")

print(f"\nEmpty-title files logged to {log_path}")
