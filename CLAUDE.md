# RFC Document Processor

## 概要
RFCドキュメントの日本語翻訳をスクレイピング・処理するハイブリッドシステム。
スクレイピング部分はPython、データ処理部分はTypeScript（関数型DDD）で実装。

## アーキテクチャ

### 技術スタック
- **Python 3.13**: スクレイピング処理（BeautifulSoup4, requests）
- **TypeScript 5.3**: データ処理・ファイル操作
- **fp-ts**: 関数型プログラミングライブラリ
- **io-ts**: ランタイム型検証

### ディレクトリ構成
```
RFC/
├── src/                        # TypeScriptソースコード
│   ├── domain/                 # ドメイン層
│   │   ├── valueObjects/       # 値オブジェクト
│   │   │   ├── RfcId.ts       # RFC ID管理
│   │   │   ├── FilePath.ts    # ファイルパス管理
│   │   │   └── DocumentHeader.ts # ドキュメントヘッダー
│   │   └── entities/           # エンティティ
│   │       └── RfcDocument.ts  # RFCドキュメント
│   ├── application/            # アプリケーション層
│   │   └── useCases/           # ユースケース
│   │       ├── AddHeadersUseCase.ts     # ヘッダー追加
│   │       ├── CheckTitlesUseCase.ts    # タイトル検証
│   │       └── SortRfcNumbersUseCase.ts # 番号ソート
│   ├── infrastructure/         # インフラストラクチャ層
│   │   └── adapters/           # アダプター
│   │       └── NodeFileSystemAdapter.ts # ファイルシステム
│   └── presentation/           # プレゼンテーション層
│       └── cli/                # CLIエントリポイント
│           ├── addHeaders.ts
│           ├── checkTitles.ts
│           └── sortRfcNumbers.ts
├── *.py                        # Pythonスクリプト群
│   ├── scrape_rfc.py          # RFCスクレイピング（維持）
│   ├── re_rfc.py              # 旧ヘッダー追加（TypeScript移行済）
│   ├── re_rfc1.py             # 旧処理スクリプト
│   ├── check_title.py         # 旧タイトルチェック（TypeScript移行済）
│   ├── sort_rfc_numbers.py    # 旧ソート（TypeScript移行済）
│   └── rfc_out_v2.py          # その他の処理
├── RFC/                        # 処理対象のRFCテキストファイル
├── rfc_out/                    # 出力ディレクトリ
├── log/                        # ログディレクトリ
└── .venv/                      # Python仮想環境

```

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

## 関数型DDDの特徴

### 値オブジェクト（Value Objects）
- **RfcId**: RFC番号の管理、検証、比較
- **FilePath**: ファイルパスの操作、結合、拡張子取得
- **DocumentHeader**: ヘッダー情報の作成、パース、シリアライズ

### エンティティ（Entities）
- **RfcDocument**: RFCドキュメントの管理、ヘッダー操作

### 設計原則
1. **不変性**: 全てのデータ構造はreadonly
2. **純粋関数**: 副作用をインフラ層に分離
3. **Either モナド**: エラーハンドリング
4. **TaskEither**: 非同期処理の合成
5. **依存性注入**: FileSystemPortインターフェース

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

## 今後の改善案

### 検討事項
- [ ] Python処理部分のエラーハンドリング強化
- [ ] TypeScript側でのログ出力の統一
- [ ] 設定ファイルの外部化（ディレクトリパスなど）
- [ ] テストコードの追加
- [ ] GitHub Actions によるCI/CDパイプライン

### 技術的負債
- 旧Pythonスクリプト（`re_rfc.py`, `check_title.py`, `sort_rfc_numbers.py`）は TypeScript版があるため削除可能
- `rfc_out_v2.py` と `re_rfc1.py` の用途を確認して整理が必要

## 注意事項

- スクレイピング処理は対象サイトの負荷を考慮して実行すること
- JSTタイムゾーンを前提としているため、他のタイムゾーンでの実行時は注意
- `RFC/` ディレクトリ内のファイルは `.text` 拡張子を想定
- `rfc_out/` ディレクトリ内のファイルは `.txt` 拡張子を想定


---
最終更新: 2025-09-21