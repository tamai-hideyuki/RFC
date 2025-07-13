#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

BASE_URL = "https://tex2e.github.io/rfc-translater/html/"

def get_available_rfc_numbers() -> list[str]:
    """
    INDEX ページからリンクを取得し、
    rfc番号部分だけを一覧で返す。
    """
    resp = requests.get(BASE_URL)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.content, "html.parser")

    nums = set()
    for a in soup.find_all("a", href=True):
        m = re.match(r"rfc(\d+)\.html$", a["href"])
        if m:
            nums.add(m.group(1))
    return sorted(nums, key=lambda x: int(x))

def scrape_rfc_translation(rfc_number: str, output_dir: str = "RFC"):
    """
    指定した RFC 番号の翻訳ページから日本語部分を抽出し、テキストファイルに保存する。
    """
    url = urljoin(BASE_URL, f"rfc{rfc_number}.html")
    resp = requests.get(url)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.content, "html.parser")

    jp_nodes = soup.find_all(string=lambda t: bool(re.search(r"[一-龥ぁ-んァ-ン]", t)))
    jp_text = "\n".join(line.strip() for line in jp_nodes if line.strip())

    os.makedirs(output_dir, exist_ok=True)
    out_path = os.path.join(output_dir, f"{rfc_number}.text")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(jp_text)
    print(f"Saved: {out_path}")

if __name__ == "__main__":

    rfc_list = get_available_rfc_numbers()
    print(f"Found {len(rfc_list)} RFC files: {', '.join(rfc_list)}")

    for num in rfc_list:
        scrape_rfc_translation(num)

