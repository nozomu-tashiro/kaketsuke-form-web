# 🌐 Vercel デプロイメント完全ガイド（フロントエンド）

## 📋 前提条件

**⚠️ 重要**: このステップはRailwayのバックエンドデプロイが完了してから行ってください！

必要な情報：
- ✅ RailwayのバックエンドURL（例：`https://xxxx.railway.app`）

---

## 🚀 ステップ1: Vercelアカウント作成

### 1-1: Vercelにアクセス
1. ブラウザで https://vercel.com を開く
2. **「Sign Up」**をクリック

### 1-2: GitHubで認証
1. **「Continue with GitHub」**をクリック
2. GitHubアカウントでログイン
3. Vercelを認証

---

## 📦 ステップ2: プロジェクトをインポート

### 2-1: 新しいプロジェクトを作成
1. Vercel ダッシュボードで **「Add New...」** → **「Project」** をクリック
2. **「Import Git Repository」** セクションを探す

### 2-2: リポジトリを選択
1. `kaketsuke-form-web` を検索
2. **「Import」**をクリック

### 2-3: 権限を付与（初回のみ）
GitHubとの連携確認画面が表示されたら：
1. **「Adjust GitHub App Permissions」**をクリック
2. リポジトリへのアクセスを許可
3. Vercelに戻る

---

## ⚙️ ステップ3: ビルド設定（超重要！）

**「Configure Project」**画面で以下を設定：

### 3-1: Framework Preset
```
Framework Preset: Create React App
```
（自動検出される場合もあります）

### 3-2: Root Directory
**🔴 最重要設定！**

1. **「Root Directory」**の横の**「Edit」**をクリック
2. ドロップダウンから **`frontend`** を選択
3. または入力欄に `frontend` と入力

**なぜ必要？**
→ フロントエンドのコードは `frontend` フォルダにあるためです

### 3-3: Build and Output Settings
以下のように設定されているか確認：

```
Build Command: npm run build
Output Directory: build
Install Command: npm install
```

通常は自動検出されます。

---

## 🔧 ステップ4: 環境変数の設定

**これが最も重要です！バックエンドと接続するために必須！**

### 4-1: 環境変数を追加
**「Environment Variables」**セクションで：

1. **Name** 欄に入力：
   ```
   REACT_APP_API_URL
   ```

2. **Value** 欄に**RailwayのバックエンドURL**を入力：
   ```
   https://kaketsuke-backend-production-xxxx.railway.app
   ```
   
   **⚠️ 注意事項**：
   - `https://` を必ず含める
   - 末尾の `/` は**つけない**
   - RailwayのURLをそのままコピー

3. **Environment** は **「Production」「Preview」「Development」** 全てにチェック

4. **「Add」**をクリック

---

## 🚀 ステップ5: デプロイを実行

### 5-1: 設定を確認
以下が正しく設定されているか最終確認：

- ✅ Framework: Create React App
- ✅ Root Directory: `frontend`
- ✅ Build Command: `npm run build`
- ✅ 環境変数: `REACT_APP_API_URL` が設定済み

### 5-2: デプロイ開始
1. **「Deploy」**ボタンをクリック
2. ビルドが開始されます（2～3分かかります）
3. 進行状況が表示されます：
   - Building...
   - Deploying...
   - ✓ Deployed

---

## 🌐 ステップ6: フロントエンドURLを取得

### 6-1: デプロイ完了を確認
1. **「Congratulations!」**または**「Visit」**ボタンが表示される
2. **「Visit」**をクリックしてアプリにアクセス

### 6-2: URLを保存
1. URLをコピー（例：`https://kaketsuke-form-web.vercel.app`）
2. **💾 このURLをメモ帳に保存！**（RailwayのCORS設定で使います）

---

## 🔄 ステップ7: RailwayのCORS設定（必須！）

フロントエンドとバックエンドを接続するため、RailwayにCORS設定を追加します。

### 7-1: Railwayに戻る
1. https://railway.app を開く
2. デプロイしたプロジェクトを選択

### 7-2: CORS環境変数を追加
1. **「Variables」**タブをクリック
2. **「New Variable」**をクリック
3. 以下を入力：
   ```
   Name: CORS_ORIGIN
   Value: https://kaketsuke-form-web.vercel.app
   ```
   **⚠️ 注意**: ステップ6-2で取得したVercelのURLを使用

4. **「Add」**をクリック
5. 自動的に再デプロイされます（1～2分待つ）

---

## ✅ ステップ8: 動作確認

### 8-1: フロントエンドにアクセス
1. VercelのURL（例：`https://kaketsuke-form-web.vercel.app`）をブラウザで開く
2. 以下を確認：
   - ✅ タイトル：**「駆付けサービス 入会申込書作成システム ベータ版（β版）」**
   - ✅ フォームが正しく表示される
   - ✅ スタイルが適用されている
   - ✅ レイアウトが崩れていない

### 8-2: PDF生成をテスト

#### テスト手順：
1. **商品ラインナップ** で「あんしんサポート２４」を選択
2. **支払方法** で「月払」を選択
3. **サービス提供価格** に `1100` と入力
4. **保証番号** に `00000268` と入力
5. **販売店情報** を入力：
   - 販売店名: `いえらぶ不動産販売株式会社`
   - 電話番号: `03-1234-5678`
   - 販売店コード: `13-00-11223366-000`
   - 担当者名: `いえらぶ太郎`
6. **「PDFを生成・ダウンロード」**ボタンをクリック

#### 期待する結果：
- ✅ PDFが自動的にダウンロードされる
- ✅ ファイル名：`駆付けサービス_入会申込書_YYYYMMDD.pdf`
- ✅ エラーが表示されない

### 8-3: PDF内容を確認
ダウンロードしたPDFを開いて確認：
- ✅ 代理店情報が正しい位置に印字されている
- ✅ サービス提供価格が印字されている
- ✅ 保証番号が印字されている
- ✅ レイアウトが崩れていない

---

## 🎉 完了！公開成功！

おめでとうございます！世界中からアクセスできるWebアプリケーションが完成しました！

### 📌 公開されたURL

**フロントエンド（ユーザーアクセス用）**:
```
https://kaketsuke-form-web.vercel.app
```

**バックエンド（API）**:
```
https://kaketsuke-backend-production-xxxx.railway.app
```

これらのURLを共有すれば、誰でもアクセスできます！

---

## 📊 設定のまとめ

### Vercel設定：
| 設定項目 | 値 |
|---------|-----|
| Framework | Create React App |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `build` |
| 環境変数 REACT_APP_API_URL | RailwayのバックエンドURL |

### Railway設定：
| 設定項目 | 値 |
|---------|-----|
| Root Directory | `backend` |
| 環境変数 NODE_ENV | `production` |
| 環境変数 CORS_ORIGIN | VercelのフロントエンドURL |

---

## ❌ トラブルシューティング

### エラー: 「PDFの生成に失敗しました」

**原因**: バックエンドに接続できていない

**確認方法**:
1. ブラウザで **F12** を押して開発者ツールを開く
2. **「Console」**タブを確認
3. エラーメッセージを確認

**よくある原因**:
- ❌ Vercelの `REACT_APP_API_URL` が間違っている
- ❌ RailwayのURLに `https://` がついていない
- ❌ RailwayのCORS設定がされていない

**解決方法**:
1. Vercel → プロジェクト → **「Settings」** → **「Environment Variables」**
2. `REACT_APP_API_URL` の値を確認・修正
3. **「Redeploy」**をクリック

---

### エラー: CORS policy blocked

**ブラウザコンソールに表示されるエラー**:
```
Access to fetch at 'https://xxxx.railway.app/api/pdf/generate' 
has been blocked by CORS policy
```

**原因**: RailwayのCORS設定が正しくない

**解決方法**:
1. Railway → プロジェクト → **「Variables」**
2. `CORS_ORIGIN` を確認
3. Vercelの**正確なURL**が設定されているか確認
4. 修正して保存（自動再デプロイされます）

---

### エラー: ビルドが失敗する

**Vercelのエラーメッセージ例**:
```
Error: Cannot find module 'react'
```

**原因**: Root Directory が正しく設定されていない

**解決方法**:
1. Vercel → プロジェクト → **「Settings」** → **「General」**
2. **「Root Directory」**を `frontend` に設定
3. **「Save」**をクリック
4. **「Deployments」** → **「Redeploy」**

---

### スタイルが適用されない

**症状**: フォームが表示されるが、デザインが崩れている

**原因**: CSSファイルが正しく読み込まれていない

**確認方法**:
1. ブラウザの開発者ツール（F12）を開く
2. **「Network」**タブを確認
3. CSSファイルが404エラーになっていないか確認

**解決方法**:
1. Vercel → **「Deployments」** → 最新のデプロイ → **「Building」**ログを確認
2. ビルドエラーがないか確認
3. 問題があれば教えてください！

---

## 🔄 今後の更新方法（自動デプロイ）

### 更新の流れ
```
コードを修正
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
1. **チャットで修正を指示**
2. **プルリクエストをマージ**
3. **自動デプロイが開始**（2～3分）
4. **変更確認**

**これだけです！簡単ですね！**

---

## 🛠️ 便利な機能

### Vercel Analytics（アクセス解析）
1. Vercel → プロジェクト → **「Analytics」**
2. ページビュー、ユーザー数などが確認できます

### プレビューデプロイ
- プルリクエストを作成すると自動的にプレビュー環境が作成されます
- 本番環境に影響を与えずにテストできます

### カスタムドメイン
1. Vercel → プロジェクト → **「Settings」** → **「Domains」**
2. 独自ドメイン（例：`www.your-domain.com`）を追加できます

---

## 📞 サポート

問題が発生したら、以下の情報を教えてください：

- どのステップで止まっているか
- エラーメッセージ（コンソールのエラーも含む）
- スクリーンショット

日本語でサポートします！🇯🇵

---

## 🎯 次のステップ

デプロイが完了したら：

1. ✅ URLを関係者に共有
2. ✅ 動作テストを実施
3. ✅ カスタムドメインの設定（オプション）
4. ✅ アクセス解析の確認

---

**最終更新**: 2025-12-13
**プロジェクト**: 駆付けサービス入会申込書PDF出力システム ベータ版（β版）
**リポジトリ**: https://github.com/nozomu-tashiro/kaketsuke-form-web
