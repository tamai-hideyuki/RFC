import os
from pathlib import Path

SRC_DIR = Path("rfc_out")
DST_DIR = Path("rfc_out_v2")

DST_DIR.mkdir(parents=True, exist_ok=True)

for src_path in SRC_DIR.glob("*.txt"):

    with src_path.open("r", encoding="utf-8") as f:
        first_line = f.readline().strip()

        if not first_line.startswith("UUID: "):
            print(f"[SKIP] {src_path.name} にはUUIDヘッダーがありません。")
            continue

        uuid = first_line.split("UUID: ", 1)[1]

        rest = f.read()


    dst_path = DST_DIR / f"{uuid}.txt"

    with dst_path.open("w", encoding="utf-8") as f:

        f.write(first_line + "\n")
        f.write(rest)

    print(f"[OK] {src_path.name} → {dst_path.name} に変換完了")
