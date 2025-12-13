# 🚀 Railway デプロイメント完全ガイド

## 📱 今見ている画面でやること

あなたが見ている「新しいプロジェクト」画面で：

### ステップ1: GitHub Repositoryを選択

画面に表示されているオプション：
- 🔘 **GitHub Repository** ← **これをクリック！**
- 🔘 Database
- 🔘 Template  
- 🔘 Docker Image
- 🔘 Empty Project

**「GitHub Repository」をクリックしてください！**

---

## 📂 ステップ2: GitHubとの連携

### 初回の場合：
1. **「Configure GitHub App」**というボタンが表示されます
2. クリックすると、GitHubの認証画面が開きます
3. **「Authorize Railway」**をクリック
4. パスワードを入力（必要な場合）

### リポジトリを選択：
1. リポジトリの一覧が表示されます
2. 検索欄に `kaketsuke-form-web` と入力
3. **`nozomu-tashiro/kaketsuke-form-web`** を選択
4. **「Deploy Now」**または**「Import」**をクリック

---

## ⚙️ ステップ3: デプロイ設定（超重要！）

デプロイが始まったら、すぐに以下の設定を行います：

### 3-1: サービスカードをクリック
- デプロイされたサービス（カード）をクリック
- ランダムな名前がついています（例：`kaketsuke-form-web-production`）

### 3-2: Root Directory を設定
**🔴 これを設定しないとエラーになります！**

1. **「Settings」**タブをクリック
2. 下にスクロールして**「Root Directory」**を探す
3. 入力欄に `backend` と入力
4. **「Update」**または**「Save」**をクリック

**なぜ必要？**
→ あなたのプロジェクトは `backend` フォルダの中にバックエンドコードがあるためです

### 3-3: Start Command を確認
1. 同じ**「Settings」**タブの中
2. **「Start Command」**を探す
3. `node server.js` になっているか確認
4. 空欄の場合は `node server.js` と入力

---

## 🔧 ステップ4: 環境変数の設定

1. **「Variables」**タブをクリック
2. **「New Variable」**をクリック
3. 以下を入力：
   ```
   Name: NODE_ENV
   Value: production
   ```
4. **「Add」**をクリック

---

## 🌐 ステップ5: 公開URLを取得

**これが一番重要です！後でVercelで使います！**

1. **「Settings」**タブに戻る
2. 下にスクロールして**「Networking」**セクションを探す
3. **「Generate Domain」**をクリック
4. URLが生成されます（例：`https://kaketsuke-backend-production-abcd123.up.railway.app`）

**💾 このURLをメモ帳にコピーして保存してください！**

---

## ✅ ステップ6: デプロイ完了を確認

### デプロイ状況を確認：
1. **「Deployments」**タブをクリック
2. 最新のデプロイメントをクリック
3. **「Build Logs」**を確認
   - `npm install` が成功しているか
   - エラーがないか
4. **「Deploy Logs」**を確認
   - `Server is running on port XXXX` が表示されるか

### ステータスが「Running」になったら成功！
- サービスカードに緑色の**「Running」**と表示される
- 問題なくデプロイ完了です！

---

## 🧪 ステップ7: 動作確認

生成されたURLにアクセスしてテスト：

### テスト1: ヘルスチェック
ブラウザで開く：
```
https://あなたのURL.railway.app/api/health
```

期待する結果：
```json
{
  "status": "ok",
  "message": "Application Form System API is running"
}
```

この画面が表示されたら**バックエンドのデプロイは成功**です！🎉

---

## 📋 設定のまとめ

デプロイ後、以下が設定されているか確認：

| 設定項目 | 値 |
|---------|-----|
| Root Directory | `backend` |
| Start Command | `node server.js` |
| 環境変数 NODE_ENV | `production` |
| Public Domain | 生成済み |

---

## ❌ トラブルシューティング

### エラー: ビルドが失敗する

**原因**: Root Directory が設定されていない

**解決方法**:
1. Settings → Root Directory → `backend` に設定
2. 自動的に再デプロイされます

---

### エラー: Server won't start

**確認事項**:
- Deploy Logs を確認
- `node server.js` がStart Commandに設定されているか
- `backend/server.js` が存在するか

**解決方法**:
1. Settings → Start Command → `node server.js` に設定
2. 再デプロイ

---

### エラー: Application error

**確認事項**:
- Deploy Logs でエラーメッセージを確認
- 環境変数が正しく設定されているか

**解決方法**:
1. Deployments → 最新のデプロイ → Deploy Logs を確認
2. エラーメッセージを教えてください（私が解決します！）

---

## 🎯 次のステップ

バックエンドのデプロイが成功したら：

### 次は Vercel でフロントエンドをデプロイします！

1. **Railway の URL をメモ**（例：`https://xxxx.railway.app`）
2. **Vercel にアクセス**: https://vercel.com
3. **フロントエンドをデプロイ**（別の手順で説明します）
4. **CORS設定**をRailwayに追加

---

## 📞 困ったら教えてください！

以下の情報を教えてもらえれば、すぐに解決できます：

- どのステップで止まっているか
- エラーメッセージ（あれば）
- スクリーンショット（あれば）

---

## 🎉 成功したら

Railwayのデプロイが成功したら、私に教えてください：

✅ 「デプロイ成功しました！URLは https://xxxx.railway.app です」

その後、Vercelのフロントエンドデプロイをサポートします！

---

## 📝 重要なポイント

### ✅ すでに準備済み：
- ✅ GitHubにコードがプッシュ済み
- ✅ バックエンドの設定が完璧
- ✅ `railway.json` 設定ファイルを追加済み
- ✅ 全ての依存関係が `package.json` に記載済み

### 🎯 あなたがやること：
1. Railway で「GitHub Repository」を選択
2. リポジトリを選択
3. Root Directory を `backend` に設定
4. 環境変数 `NODE_ENV=production` を追加
5. Domain を生成してURLを保存

**これだけで完了です！**

---

## 🚀 準備完了！

それでは、Railwayの画面で**「GitHub Repository」**をクリックして、
上記の手順に従ってデプロイしてください！

デプロイ中に何か問題があれば、すぐに教えてください！
日本語でサポートします！🇯🇵

---

**最終更新**: 2025-12-13
**プロジェクト**: 駆付けサービス入会申込書PDF出力システム
