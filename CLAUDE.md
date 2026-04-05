# 用語集サイト — CLAUDE.md

## プロジェクト概要

AIへの指示精度を高めるための用語集サイト。
ジャンル別（Webアプリ／IT用語／プログラミング関連）に分かれた静的サイト。
CSVファイルからデータを読み込み、カテゴリフィルター付きの用語一覧を表示する。

---

## ディレクトリ構成

```
/
├── index.html          # トップページ（ジャンル選択）
├── webapp.html         # Webアプリ用語集ページ
├── it.html             # IT用語集ページ
├── programming.html    # プログラミング関連用語集ページ
├── css/
│   └── style.css       # 共通スタイル
├── js/
│   └── glossary.js     # CSV読み込み・フィルター・レンダリング共通ロジック
└── data/
    ├── webapp.csv      # Webアプリ用語データ
    ├── it.csv          # IT用語データ
    └── programming.csv # プログラミング関連用語データ
```

---

## CSVフォーマット

各CSVファイルは以下の形式で作成する。文字コードはUTF-8。

```
カテゴリ,用語,説明
UIパーツ,ヘッダー,ページ上部の共通エリア。ロゴやメニューを配置。
UIパーツ,フッター,ページ下部の共通エリア。著作権表示やリンクを配置。
UIパーツ,サイドバー,メインコンテンツの横に配置される補足メニュー。
```

- 1行目はヘッダー行（`カテゴリ,用語,説明`）
- カラムは3つ固定：`カテゴリ` / `用語` / `説明`
- 説明文にカンマを含む場合はダブルクォートで囲む

## CSVファイル一覧と収録カテゴリ

| ファイル | ジャンル | カテゴリ | 件数 |
|---|---|---|---|
| `data/webapp.csv` | Webアプリ | UIパーツ／フォーム／設計・レイアウト／状態／概念 | 127件 |
| `data/it.csv` | IT用語 | インフラ／ネットワーク／セキュリティ／運用・保守／データ・解析／ビジネス・開発手法／ハードウェア・周辺／その他 | 112件 |
| `data/programming.csv` | プログラミング関連 | 基本概念／データ操作／制御構造／プログラム構成／オブジェクト指向／開発環境・ツール／不具合・テスト／言語・パラダイム／コーディング手法／非同期・並列処理／データベース／その他 | 120件 |

---

## 各ページの仕様

### トップページ（index.html）
- 3つのジャンルカードを横並びで表示
- 各カードはジャンル名・説明・用語数（CSVの行数）を表示
- カードクリックで対応ページへ遷移

### 用語集ページ（webapp.html / it.html / programming.html）
- ページロード時に対応CSVを`fetch`で読み込む
- カテゴリフィルターボタンを上部に表示（「すべて」＋ CSV内のカテゴリ名を動的生成）
- 用語は**カード形式**で一覧表示（カテゴリバッジ・用語名・説明）
- フィルターボタンクリックで対象カテゴリのカードのみ表示（他は非表示）
- 検索ボックスで用語名・説明をリアルタイム絞り込み

---

## JavaScript 実装方針（glossary.js）

```js
// 呼び出し方（各HTMLページで指定）
// <script>const CSV_PATH = 'data/webapp.csv';</script>
// <script src="js/glossary.js"></script>

// 処理の流れ
// 1. fetch(CSV_PATH) でCSVを取得
// 2. 1行目のヘッダーを除いてパース（カンマ区切り、クォート対応）
// 3. カテゴリ一覧を抽出してフィルターボタンを動的生成
// 4. 用語カードをDOMに追加
// 5. フィルターボタン／検索ボックスのイベントリスナーを設定
```

- ライブラリ不使用（Vanilla JS のみ）
- CSVパースは外部ライブラリなしで実装（シンプルなsplit + クォート処理）
- `fetch` が使えないローカル環境の場合は Live Server 等を使用する

---

## CSS 設計方針

- CSS変数でカラーテーマを管理（`:root` にまとめる）
- レスポンシブ対応：フィルターボタンは横スクロール、カードはグリッドレイアウト
- フォントはシステムフォント（`system-ui, sans-serif`）
- ジャンルごとにアクセントカラーを変える（CSS変数で切り替え）

```css
/* カラー変数の例 */
:root {
  --color-webapp: #4f46e5;      /* Webアプリ：インディゴ */
  --color-it: #0891b2;          /* IT用語：シアン */
  --color-programming: #16a34a; /* プログラミング：グリーン */
  --color-bg: #f9fafb;
  --color-card-bg: #ffffff;
  --color-text: #111827;
  --color-muted: #6b7280;
  --color-border: #e5e7eb;
}
```

---

## HTMLページの共通構造

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>用語集 | ページタイトル</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <!-- ヘッダー：サイト名 + ジャンルナビゲーション -->
  <header>...</header>

  <!-- メイン -->
  <main>
    <h1>ジャンル名</h1>
    <!-- 検索ボックス -->
    <input type="search" id="search" placeholder="用語を検索...">
    <!-- カテゴリフィルター（JSで動的生成） -->
    <div id="filter-buttons"></div>
    <!-- 用語カード一覧（JSで動的生成） -->
    <div id="card-grid"></div>
  </main>

  <footer>...</footer>

  <script>const CSV_PATH = 'data/webapp.csv';</script>
  <script src="js/glossary.js"></script>
</body>
</html>
```

---

## 用語カードのHTML構造

```html
<article class="card" data-category="UIパーツ">
  <span class="card__badge">UIパーツ</span>
  <h2 class="card__term">ヘッダー</h2>
  <p class="card__desc">ページ上部の共通エリア。ロゴやメニューを配置。</p>
</article>
```

---

## 実装時の注意事項

- CSVは `data/` フォルダに配置し、ページから相対パスで参照する
- ローカルで `fetch` を使うため、必ずローカルサーバー経由で開くこと（`file://` 不可）
- 新しいジャンルを追加する場合：
  1. `data/` に新CSVを追加
  2. HTMLページを1つ追加（既存ページをコピーして `CSV_PATH` を変更）
  3. `index.html` のジャンルカードに追記
- 用語の追加・編集はCSVファイルのみを変更すればよい（HTML/JS変更不要）

---

## 将来の拡張候補

- 用語クリックで詳細モーダルを表示
- 全ジャンル横断検索
- コピーボタン（AIへの指示用）
- ダークモード対応
