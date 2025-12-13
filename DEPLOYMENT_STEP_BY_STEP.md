# 🚀 ステップ・バイ・ステップ デプロイガイド

世界中からアクセスできるWebアプリケーションを公開する完全ガイドです。

---

## 📋 Part 1: Railway でバックエンドをデプロイ

### Step 1-1: Railwayアカウント作成

1. ブラウザで https://railway.app を開く
2. **"Start a New Project"** または **"Login"** をクリック
3. GitHubアカウントで認証してログイン

### Step 1-2: 新しいプロジェクトを作成

1. Railway ダッシュボードで **"New Project"** をクリック
2. **"Deploy from GitHub repo"** を選択
3. **"Configure GitHub App"** をクリック（初回のみ）
4. リポジトリ一覧から **`kaketsuke-form-web`** を選択
5. **"Deploy Now"** をクリック

### Step 1-3: バックエンドサービスの設定

1. デプロイされたサービスをクリック
2. **"Settings"** タブを開く
3. **"Root Directory"** を探して `/backend` に設定
   ```
   Root Directory: backend
   ```
4. **"Start Command"** を設定（通常は自動検出されます）
   ```
   Start Command: node server.js
   ```

### Step 1-4: 環境変数の設定

1. **"Variables"** タブを開く
2. 以下の環境変数を追加（**"Add Variable"** をクリック）：

   ```
   NODE_ENV=production
   ```

3. **"Deploy"** をクリックして変更を適用

### Step 1-5: バックエンドURLを取得

1. **"Settings"** タブに戻る
2. **"Networking"** セクションを探す
3. **"Generate Domain"** をクリック
4. 生成されたURLをコピー（例: `kaketsuke-backend-production.up.railway.app`）

**🔴 重要: このURLをメモ帳などに保存してください！後で使います。**

---

## 🌐 Part 2: Vercel でフロントエンドをデプロイ

### Step 2-1: Vercelアカウント作成

1. ブラウザで https://vercel.com を開く
2. **"Sign Up"** をクリック
3. GitHubアカウントで認証してログイン

### Step 2-2: 新しいプロジェクトをインポート

1. Vercel ダッシュボードで **"Add New..."** → **"Project"** をクリック
2. **"Import Git Repository"** で **`kaketsuke-form-web`** を探す
3. **"Import"** をクリック

### Step 2-3: ビルド設定を構成

**"Configure Project"** 画面で以下を設定：

#### Framework Preset
```
Framework Preset: Create React App
```

#### Root Directory
```
Root Directory: frontend
```

#### Build & Development Settings
```
Build Command: npm run build
Output Directory: build
Install Command: npm install
```

### Step 2-4: 環境変数を設定

**"Environment Variables"** セクションで：

1. **Name** に `REACT_APP_API_URL` と入力
2. **Value** に Step 1-5 で取得したバックエンドURLを入力
   ```
   https://kaketsuke-backend-production.up.railway.app
   ```
   **注意**: `https://` を忘れずに！
3. **"Add"** をクリック

### Step 2-5: デプロイを実行

1. すべての設定を確認
2. **"Deploy"** ボタンをクリック
3. ビルドが完了するまで待機（2-3分）

### Step 2-6: フロントエンドURLを取得

1. デプロイが完了したら **"Visit"** をクリックして確認
2. URLをコピー（例: `https://kaketsuke-form-web.vercel.app`）

**🔴 重要: このURLもメモしてください！**

---

## 🔄 Part 3: CORS設定を更新（バックエンド）

フロントエンドとバックエンドを接続するため、RailwayでCORS設定を追加します。

### Step 3-1: Railwayに戻る

1. https://railway.app を開く
2. 先ほど作成したプロジェクトを開く

### Step 3-2: CORS環境変数を追加

1. **"Variables"** タブを開く
2. **"Add Variable"** をクリック
3. 以下を追加：
   ```
   Variable Name: CORS_ORIGIN
   Value: https://kaketsuke-form-web.vercel.app
   ```
   **注意**: Step 2-6 で取得したフロントエンドURLを使用

4. **"Save"** → 自動的に再デプロイされます

---

## ✅ Part 4: 動作確認

### Step 4-1: フロントエンドにアクセス

1. Vercelで取得したURL（例: `https://kaketsuke-form-web.vercel.app`）をブラウザで開く
2. 以下を確認：
   - ✅ タイトルに「**駆付けサービス 入会申込書作成システム ベータ版（β版）**」が表示される
   - ✅ フォームが正しく表示される
   - ✅ スタイルが適用されている

### Step 4-2: PDF生成をテスト

1. **商品ラインナップ** で「あんしんサポート２４」を選択
2. **支払方法** で「月払」を選択
3. **サービス提供価格** に `1100` と入力
4. **保証番号** に `00000268` と入力（オプション）
5. **販売店情報** を入力：
   - 販売店名: `いえらぶ不動産販売株式会社`
   - 電話番号: `03-1234-5678`
   - 販売店コード: `13-00-11223366-000`
   - 担当者名: `いえらぶ太郎`
6. **「PDFを生成・ダウンロード」** ボタンをクリック
7. PDFがダウンロードされることを確認

### Step 4-3: PDF内容を確認

ダウンロードしたPDFを開いて、以下が正しく印字されているか確認：

#### 月払の場合
- ✅ **代理店情報** が正しい位置に印字（Box 1-4）
- ✅ **サービス提供価格** が正しい位置に印字（X=160, Y=465）
- ✅ **保証番号** が正しい位置に印字（X=430, Y=448）

#### 年払の場合（テスト用）
1. **支払方法** を「年払（2年更新）」に変更
2. **更新時ご請求額** に `15000` と入力
3. PDFを生成して確認：
   - ✅ **更新時ご請求額** が印字（X=430, Y=83）
   - ✅ **保証番号** の位置が変更（X=445, Y=485）

#### いえらぶ安心サポートの場合（テスト用）
1. **商品ラインナップ** を「いえらぶ安心サポート」に変更
2. PDFを生成して確認：
   - ✅ **代理店情報** のY座標が異なる（Y=112, Y=87）
   - ✅ **保証番号** の位置が専用座標（X=430, Y=443）

---

## 🎉 完了！公開されました！

おめでとうございます！世界中どこからでもアクセスできるWebアプリケーションの公開が完了しました！

### 📌 公開されたURL

- **フロントエンド**: `https://kaketsuke-form-web.vercel.app`
- **バックエンド**: `https://kaketsuke-backend-production.up.railway.app`

これらのURLを共有すれば、誰でもアクセスできます！

---

## 🔄 今後の更新方法（自動デプロイ）

### 更新の流れ

```
あなたがチャットで指示
    ↓
AIがコードを修正・コミット
    ↓
GitHubにプッシュ
    ↓
Railway/Vercelが自動検知
    ↓
自動ビルド＆デプロイ
    ↓
本番環境が自動更新！
```

### 必要な作業

1. **チャットで修正を指示**するだけ！
   ```
   例: 「保証番号のフォントサイズを14ptに変更して」
   ```

2. **プルリクエストをマージ**
   - GitHubでPRが作成される
   - **"Merge pull request"** をクリック

3. **自動デプロイが開始**
   - Railway: 2-3分で自動デプロイ完了
   - Vercel: 1-2分で自動デプロイ完了

4. **変更確認**
   - フロントエンドURLにアクセスして確認

### 自動デプロイの監視

#### Railway
- https://railway.app/project/{your-project-id}
- **"Deployments"** タブでビルドログを確認

#### Vercel
- https://vercel.com/{username}/{project-name}
- **"Deployments"** タブでデプロイステータスを確認

---

## 🛠️ トラブルシューティング

### ❌ エラー: 「PDFの生成に失敗しました」

**原因**: バックエンドに接続できていない

**解決方法**:
1. ブラウザの開発者ツール（F12）を開く
2. **Console** タブでエラーメッセージを確認
3. 以下をチェック：
   - ✅ Vercelの環境変数 `REACT_APP_API_URL` が正しい
   - ✅ RailwayのバックエンドURLが正しい
   - ✅ `https://` がついている

**修正手順**:
1. Vercelダッシュボード → プロジェクト → **"Settings"** → **"Environment Variables"**
2. `REACT_APP_API_URL` の値を確認・修正
3. **"Redeploy"** をクリック

---

### ❌ エラー: CORS policy blocked

**原因**: RailwayのCORS設定が正しくない

**解決方法**:
1. Railwayダッシュボード → プロジェクト → **"Variables"**
2. `CORS_ORIGIN` の値を確認
3. Vercelの**正確なURL**が設定されているか確認
4. 修正して保存（自動再デプロイ）

---

### ❌ バックエンドが起動しない

**原因**: Node.jsのバージョン、依存関係の問題

**解決方法**:
1. Railwayダッシュボード → **"Deployments"** → 最新のデプロイをクリック
2. **"Build Logs"** と **"Deploy Logs"** を確認
3. エラーメッセージを確認：
   - `npm install` のエラー → `package.json` の確認
   - `node server.js` のエラー → コードのエラー確認

---

### ❌ フロントエンドのビルドが失敗

**原因**: React のビルドエラー

**解決方法**:
1. Vercelダッシュボード → **"Deployments"** → 最新のデプロイをクリック
2. **"Building"** セクションでエラーを確認
3. よくある原因：
   - ✅ `package.json` の依存関係の問題
   - ✅ 環境変数が設定されていない
   - ✅ Root Directory の設定が間違っている（`frontend` に設定）

---

## 📊 デプロイメント監視

### Railway メトリクス

- **CPU使用率**: 通常 < 50%
- **メモリ使用量**: 通常 < 512MB
- **応答時間**: 通常 < 500ms

### Vercel 解析

- **Page Views**: アクセス数の確認
- **Unique Visitors**: ユニークユーザー数
- **Top Pages**: 人気ページの確認

---

## 🎓 より高度な設定（オプション）

### カスタムドメインの設定

#### Vercel でカスタムドメインを追加

1. Vercelダッシュボード → プロジェクト → **"Settings"** → **"Domains"**
2. カスタムドメイン（例: `www.your-domain.com`）を入力
3. DNS設定の指示に従って設定

#### Railway でカスタムドメインを追加

1. Railwayダッシュボード → プロジェクト → **"Settings"** → **"Networking"**
2. **"Custom Domain"** でドメインを追加
3. DNS設定の指示に従って設定

### ステージング環境の作成

1. GitHubで `staging` ブランチを作成
2. Railway/Vercelで新しいプロジェクトを作成
3. `staging` ブランチをデプロイ
4. テスト用の環境として使用

---

## ✨ まとめ

これで完全な自動デプロイ環境が整いました！

**公開されたアプリケーション**:
- 🌍 世界中からアクセス可能
- 🚀 自動デプロイ（2-3分で本番反映）
- 🔒 HTTPS対応（セキュア）
- 📊 アクセス解析対応
- 🎯 高速・安定・スケーラブル

**今後の運用**:
1. チャットで修正を指示
2. PRをマージ
3. 自動デプロイ完了
4. 本番環境が更新

これだけです！簡単ですね！🎉
