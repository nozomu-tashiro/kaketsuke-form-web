# 駆付けサービス入会申込書PDF出力Webアプリケーション

不動産関連の駆付けサービスの入会申込手続きをデジタル化するWebアプリケーションです。販売代理店の担当者がWebフォームに必要な情報を入力し、選択した商品とオプションに応じた申込書をPDF形式で生成・出力します。

## 主な機能

- ✅ 申込情報の入力フォーム
- ✅ 商品ラインナップ、支払い方法、オプションサービスの選択機能
- ✅ 入力内容に基づいた申込書の動的な生成
- ✅ A4サイズ2枚綴り（代理店控え・お客様控え）のPDF出力機能
- ✅ レスポンシブデザイン対応

## 技術スタック

### フロントエンド
- React 18.2.0
- Axios（API通信）
- CSS3（レスポンシブデザイン）

### バックエンド
- Node.js
- Express 4.18.2
- PDFKit（PDF生成）
- CORS

## 商品・サービス構成

### 基本サービス（商品ラインナップ）

1. **あんしんサポート２４**
   - 支払方法: 月払 / 年払（1年更新）/ 年払（2年更新）

2. **ホームアシスト２４**
   - 支払方法: 月払 / 年払（1年更新）/ 年払（2年更新）

3. **あんしんフルサポート**
   - 支払方法: 月払のみ

4. **いえらぶ安心サポート**
   - 支払方法: 年払（2年更新）のみ

### オプションサービス

- ① 近隣トラブル解決支援サービス（マモロッカ）
- ② シニア向け総合見守りサービス（まごころ）
- ③ 家電の安心サポート（Syu-rIt！シューリット！）

## セットアップ方法

### 前提条件

- Node.js 16.x 以上
- npm 8.x 以上

### インストール

1. リポジトリのクローン
```bash
git clone <repository-url>
cd webapp
```

2. 依存パッケージのインストール
```bash
# ルートディレクトリでの一括インストール
npm run install:all

# または個別にインストール
cd backend && npm install
cd ../frontend && npm install
```

### 開発環境での起動

#### 方法1: 同時起動（推奨）
```bash
# ルートディレクトリで実行（concurrentlyが必要）
npm install -g concurrently
npm run dev
```

#### 方法2: 個別起動
```bash
# ターミナル1: バックエンド起動
cd backend
npm run dev

# ターミナル2: フロントエンド起動
cd frontend
npm start
```

### アクセス

- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:5000

## プロジェクト構造

```
webapp/
├── backend/              # バックエンド
│   ├── routes/          # APIルート
│   │   └── pdfRoutes.js
│   ├── utils/           # ユーティリティ
│   │   └── pdfGenerator.js
│   ├── package.json
│   └── server.js        # サーバーエントリーポイント
├── frontend/            # フロントエンド
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   └── ApplicationForm.js
│   │   ├── styles/
│   │   │   ├── index.css
│   │   │   ├── App.css
│   │   │   └── ApplicationForm.css
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── data/                # データファイル
├── docs/                # ドキュメント
├── package.json         # ルートpackage.json
└── README.md
```

## API エンドポイント

### POST /api/pdf/generate

申込書PDFを生成します。

**リクエストボディ:**
```json
{
  "applicationType": "new",
  "applicationDate": "2024-12-04",
  "applicantName": "山田 太郎",
  "applicantNameKana": "ヤマダ タロウ",
  "mobilePhone": "090-1234-5678",
  "homePhone": "03-1234-5678",
  "birthDate": "1980-01-01",
  "gender": "male",
  "residents": [],
  "propertyAddress": "東京都渋谷区〇〇1-2-3",
  "propertyName": "いえらぶマンション",
  "propertyNameKana": "イエラブマンション",
  "roomNumber": "101",
  "selectedProduct": "anshin-support-24",
  "paymentMethod": "monthly",
  "selectedOptions": ["neighbor-trouble"],
  "servicePrice": "15000",
  "guaranteeNumber": "",
  "emergencyContact": {},
  "agentInfo": {
    "name": "いえらぶ不動産販売株式会社",
    "phone": "03-1234-5678",
    "code": "13-00-11223366-000",
    "representativeName": "いえらぶ太郎"
  }
}
```

**レスポンス:**
- Content-Type: application/pdf
- PDFファイル（バイナリデータ）

## 使い方

1. **申込基本情報の入力**
   - 申込種別（新規/更新）を選択
   - お申込日、お申込者様名などを入力

2. **入居者・同居人情報（任意）**
   - 必要に応じて入居者・同居人を追加

3. **対象物件情報の入力**
   - 住所、物件名、号室などを入力

4. **商品・サービス選択**
   - 商品ラインナップを選択
   - 支払方法を選択（商品により選択肢が変わります）
   - オプションサービスを選択

5. **緊急連絡先（条件付き）**
   - 「シニア向け総合見守りサービス」を選択した場合のみ表示・入力必須

6. **販売店情報の入力**
   - 販売店名、電話番号、販売店コード、担当者名を入力

7. **PDF生成**
   - 「PDFを生成・ダウンロード」ボタンをクリック
   - 自動的にPDFがダウンロードされます

## 本番環境へのデプロイ

### ビルド

```bash
# フロントエンドのビルド
cd frontend
npm run build
```

### 起動

```bash
# 本番環境でバックエンドを起動
cd backend
NODE_ENV=production node server.js
```

本番環境では、バックエンドがフロントエンドのビルドファイルを静的ファイルとして配信します。

## カスタマイズ

### PDF レイアウトの変更

`backend/utils/pdfGenerator.js` を編集してPDFのレイアウトをカスタマイズできます。

### 商品・サービスの追加

1. フロントエンド: `frontend/src/components/ApplicationForm.js` の商品選択セクションを編集
2. バックエンド: `backend/utils/pdfGenerator.js` の `getProductName()` などのメソッドを更新

### スタイルの変更

- `frontend/src/styles/ApplicationForm.css` を編集してフォームのスタイルを変更
- `frontend/src/styles/App.css` を編集してアプリ全体のスタイルを変更

## トラブルシューティング

### ポートが既に使用されている

```bash
# ポート5000が使用中の場合
PORT=5001 npm start

# フロントエンドのproxyも変更が必要
# frontend/package.json の "proxy" を変更
```

### PDF生成エラー

- バックエンドのログを確認: `backend/` ディレクトリで `npm run dev` を実行してコンソール出力を確認
- 必須フィールドが入力されているか確認

## ライセンス

MIT

## サポート

問題が発生した場合は、Issueを作成してください。

## 今後の改善予定

- [ ] データのバリデーション強化
- [ ] PDFプレビュー機能
- [ ] データの保存機能（データベース連携）
- [ ] 申込書テンプレートのカスタマイズ機能
- [ ] Excelフォーマットからの直接レイアウト読み込み
- [ ] ユーザー認証機能
- [ ] 申込履歴の管理機能

---

© 2024 駆付けサービス入会申込システム. All rights reserved.
