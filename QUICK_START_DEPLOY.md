# ⚡ クイックスタート デプロイガイド（5分で完了！）

このガイドに従えば、**5分で世界中からアクセス可能なWebアプリケーション**を公開できます！

---

## 🚀 Step 1: Railwayでバックエンドをデプロイ（2分）

### 1-1. Railwayにログイン
- https://railway.app にアクセス
- GitHubアカウントでログイン

### 1-2. デプロイ
1. **"New Project"** → **"Deploy from GitHub repo"**
2. **`kaketsuke-form-web`** を選択
3. **"Deploy Now"** をクリック

### 1-3. 設定
1. デプロイされたサービスをクリック → **"Settings"**
2. **Root Directory** を `backend` に設定
3. **"Variables"** タブで環境変数を追加：
   ```
   NODE_ENV=production
   ```

### 1-4. URLを取得
1. **"Settings"** → **"Networking"** → **"Generate Domain"**
2. 生成されたURLをコピー（例: `https://kaketsuke-backend.railway.app`）

**✅ このURLをメモ！**

---

## 🌐 Step 2: Vercelでフロントエンドをデプロイ（2分）

### 2-1. Vercelにログイン
- https://vercel.com にアクセス
- GitHubアカウントでログイン

### 2-2. デプロイ
1. **"Add New..."** → **"Project"**
2. **`kaketsuke-form-web`** を選択 → **"Import"**

### 2-3. 設定
**Configure Project** 画面で：

```
Framework Preset: Create React App
Root Directory: frontend
Build Command: npm run build
Output Directory: build
```

**Environment Variables:**
```
Name: REACT_APP_API_URL
Value: https://kaketsuke-backend.railway.app
```
**注意**: Step 1-4 で取得したURLを使用！

### 2-4. デプロイ実行
**"Deploy"** をクリック → 2-3分待機

**✅ デプロイ完了後のURLをメモ！**

---

## 🔄 Step 3: CORS設定（1分）

### 3-1. Railwayに戻る
- https://railway.app を開く
- プロジェクトを選択

### 3-2. 環境変数を追加
**"Variables"** タブで：
```
Name: CORS_ORIGIN
Value: https://your-app.vercel.app
```
**注意**: Step 2-4 で取得したVercelのURLを使用！

**✅ 保存すると自動的に再デプロイされます**

---

## ✅ Step 4: 動作確認（30秒）

1. VercelのURLにアクセス
2. 商品を選択して情報を入力
3. 「PDFを生成・ダウンロード」をクリック
4. PDFがダウンロードされることを確認

---

## 🎉 完了！

### 📌 公開されたURL

**フロントエンド**: `https://your-app.vercel.app`  
**バックエンド**: `https://your-backend.railway.app`

世界中どこからでもアクセス可能です！🌍

---

## 🔄 今後の更新（自動デプロイ）

```
チャットで修正を指示
    ↓
AIがコード修正
    ↓
GitHubにPRが作成
    ↓
PRをマージ
    ↓
自動デプロイ完了！
```

**必要な作業**: GitHubでPRをマージするだけ！

---

## 📚 詳細なガイド

- 詳しい手順: `DEPLOYMENT_STEP_BY_STEP.md`
- トラブルシューティング: `DEPLOYMENT.md`

---

## 💡 ヒント

### Railway の無料枠
- 月500時間の実行時間
- 通常は十分な量です

### Vercel の無料枠
- 月100GBの転送量
- 個人・小規模プロジェクトには十分

### カスタムドメイン
- 独自ドメイン（例: `www.your-domain.com`）も設定可能
- Vercel/Railwayの管理画面から簡単に設定

---

## 🆘 問題が発生した場合

### PDF生成エラー
1. ブラウザでF12を押して開発者ツールを開く
2. Consoleタブでエラーを確認
3. `REACT_APP_API_URL` が正しく設定されているか確認

### CORSエラー
1. RailwayのCORS_ORIGINを確認
2. VercelのURLと完全に一致しているか確認

### バックエンドが起動しない
1. Railwayのデプロイメントログを確認
2. Root Directoryが `backend` になっているか確認

---

## ✨ おめでとうございます！

これで、本格的なWebアプリケーションの公開が完了しました！

**今後の機能追加・修正も、このチャットで指示するだけで自動的に本番環境に反映されます！** 🚀
