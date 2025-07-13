# RFCについて

## 概要
RFCドキュメントの日本語翻訳をスクレイピング・処理するハイブリッドシステム。
スクレイピング部分はPython、データ処理部分はTypeScript（関数型DDD）で実装。


## 主要機能

### 1. スクレイピング（Python）
```bash
python scrape_rfc.py
```
- RFC日本語翻訳サイト（https://tex2e.github.io/rfc-translater/html/）からデータ取得
- 日本語部分のみを抽出してテキストファイル化
- `RFC/` ディレクトリに `{RFC番号}.text` として保存

### 2. ヘッダー追加（TypeScript）
```bash
npm run add-headers
```
- RFCテキストファイルにメタデータヘッダーを追加
- UUID、作成日時（JST）、タイトル、タグ、カテゴリ、スコア情報
- 既にヘッダーがある場合はスキップ

### 3. タイトル検証（TypeScript）
```bash
npm run check-titles
```
- `rfc_out/` ディレクトリ内のファイルのタイトル行を検証
- 空タイトルや3行目がないファイルを検出
- 結果を `log/empty_title_files.txt` に記録

### 4. RFC番号ソート（TypeScript）
```bash
npm run sort-numbers
```
- `log/log.text` のRFC番号リストを数値順にソート
- `log/log_sorted.text` として出力
- 統計情報（総数、最初と最後の5件）を表示


## セットアップ

### Python環境
```bash
python -m venv .venv
source .venv/bin/activate  # macOS/Linux
# または
.venv\Scripts\activate  # Windows

pip install -r requirements.txt
```

### Node.js環境
```bash
npm install
```

## 開発コマンド

### TypeScript
```bash
npm run build        # TypeScriptのビルド
npx tsc --noEmit    # 型チェックのみ
```

### 実行順序（典型的なワークフロー）
1. `python scrape_rfc.py` - RFCデータをスクレイピング
2. `npm run add-headers` - ヘッダー情報を追加
3. `npm run check-titles` - タイトルの妥当性を確認
4. `npm run sort-numbers` - RFC番号リストをソート
