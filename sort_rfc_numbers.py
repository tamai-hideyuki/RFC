#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from pathlib import Path

log_path = Path("./log/log.text")
sorted_log_path = Path("./log/log_sorted.text")

with log_path.open("r", encoding="utf-8") as f:
    rfc_numbers = [line.strip().replace(".text", "") for line in f if line.strip()]

sorted_numbers = sorted(rfc_numbers, key=lambda x: int(x))

with sorted_log_path.open("w", encoding="utf-8") as f:
    for num in sorted_numbers:
        f.write(f"{num}.text\n")

print(f"元のファイル: {len(rfc_numbers)}個のRFC番号")
print(f"ソート済みファイル: {sorted_log_path}")
print(f"最初の5個: {sorted_numbers[:5]}")
print(f"最後の5個: {sorted_numbers[-5:]}") 
