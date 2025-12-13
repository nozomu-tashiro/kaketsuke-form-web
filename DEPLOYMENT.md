# 🚀 デプロイメントガイド

このドキュメントは、駆付けサービス入会申込書作成システムを Railway と Vercel にデプロイする手順を説明します。

## 📋 前提条件

- GitHubアカウント
- Railwayアカウント（https://railway.app）
- Vercelアカウント（https://vercel.com）

## 🔧 ステップ1: Railwayでバックエンドをデプロイ

### 1.1 Railwayプロジェクト作成

1. https://railway.app にアクセス
2. "Start a New Project" をクリック
3. "Deploy from GitHub repo" を選択
4. `nozomu-tashiro/kaketsuke-form-web` を選択
5. "Add variables" をクリック

### 1.2 環境変数の設定

以下の環境変数を設定してください：

```
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

### 1.3 ルートディレクトリの設定

1. Settings → Build & Deploy → Root Directory を `/backend` に設定
2. Start Command を `node server.js` に設定
3. Deploy をクリック

### 1.4 バックエンドURLの取得

デプロイ完了後、Settings → Networking → Generate Domain でURLを取得

例: `https://kaketsuke-form-backend.railway.app`

**このURLをメモしておいてください！**

---

## 🌐 ステップ2: Vercelでフロントエンドをデプロイ

### 2.1 Vercelプロジェクト作成

1. https://vercel.com にアクセス
2. "Add New" → "Project" をクリック
3. GitHubから `nozomu-tashiro/kaketsuke-form-web` をインポート
4. "Configure Project" 画面で以下を設定：

### 2.2 ビルド設定

```
Framework Preset: Create React App
Root Directory: frontend
Build Command: npm run build
Output Directory: build
Install Command: npm install
```

### 2.3 環境変数の設定

```
REACT_APP_API_URL=https://kaketsuke-form-backend.railway.app
```

**注意**: `https://kaketsuke-form-backend.railway.app` は、ステップ1.4で取得したバックエンドURLに置き換えてください。

### 2.4 デプロイ実行

"Deploy" ボタンをクリックしてデプロイを開始

---

## ✅ ステップ3: 動作確認

### 3.1 フロントエンドの確認

1. Vercelのデプロイ完了後、URLをクリック
2. 申込書作成画面が表示されることを確認
3. タイトルに「ベータ版（β版）」が表示されていることを確認

### 3.2 バックエンド接続の確認

1. 商品ラインナップを選択
2. 支払方法を選択
3. 各フィールドに情報を入力
4. 「PDF生成」ボタンをクリック
5. PDFが正しく生成されることを確認

### 3.3 PDF座標の確認

以下の項目が正しく印字されているか確認：

#### 通常商品の場合
- **代理店情報**: Box 1-4 が正しい座標に印字
- **月払選択時**: 
  - サービス提供価格: X=160, Y=465
  - 保証番号: X=430, Y=448
- **年払選択時**:
  - 更新時ご請求額: X=430, Y=83
  - 保証番号: X=445, Y=485

#### いえらぶ安心サポートの場合
- **代理店情報**: Y座標が異なる（Y=112, Y=87）
- **保証番号**: X=430, Y=443

---

## 🔄 自動デプロイの設定

### GitHub連携後の自動デプロイ

1. **コード変更を push**
   ```bash
   git add .
   git commit -m "feat: 新機能追加"
   git push origin main
   ```

2. **自動デプロイ開始**
   - Railway: mainブランチへのpushを検知 → 自動ビルド＆デプロイ
   - Vercel: mainブランチへのpushを検知 → 自動ビルド＆デプロイ

3. **デプロイ完了**
   - 2-3分後に本番環境が自動更新

### プルリクエスト プレビュー

- `genspark_ai_developer` ブランチへのpushでプレビュー環境が自動作成
- PRマージ前に変更内容を確認可能

---

## 🛠️ トラブルシューティング

### PDF生成エラー

**症状**: PDFが生成されない、エラーが表示される

**原因**: バックエンドURLが正しく設定されていない

**解決方法**:
1. Vercelの環境変数 `REACT_APP_API_URL` を確認
2. RailwayのバックエンドURLと一致しているか確認
3. 変更後、Vercelで再デプロイ

### CORSエラー

**症状**: ブラウザのコンソールに "CORS policy" エラー

**原因**: バックエンドのCORS設定が正しくない

**解決方法**:
1. Railwayの環境変数 `CORS_ORIGIN` を確認
2. VercelのフロントエンドURLを設定
3. 変更後、Railwayで再デプロイ

### フォントが表示されない

**症状**: PDFの日本語が文字化けする

**原因**: フォントファイルがデプロイされていない

**解決方法**:
1. `backend/fonts/` ディレクトリの確認
2. `.railwayignore` でフォントが除外されていないか確認
3. 必要に応じてフォントをコミット

---

## 📊 デプロイ状況の監視

### Railway ダッシュボード

- https://railway.app/project/{your-project-id}
- ビルドログ、デプロイステータス、メトリクスを確認

### Vercel ダッシュボード

- https://vercel.com/{your-username}/{project-name}
- ビルドログ、デプロイメント履歴、アクセス解析を確認

---

## 🎉 完了！

これで世界中どこからでもアクセスできるWebアプリケーションの公開が完了しました！

**フロントエンドURL**: https://your-app.vercel.app  
**バックエンドURL**: https://your-backend.railway.app

今後の変更は、このチャットで指示していただければ自動的に本番環境にも反映されます！
