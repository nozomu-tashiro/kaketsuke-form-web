# 開発ドキュメント

## 開発の進め方

このドキュメントでは、商品申込書PDF出力Webアプリケーションの開発詳細について説明します。

## アーキテクチャ

### システム構成

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│              │         │              │         │              │
│  ブラウザ    │ <-----> │  React       │ <-----> │  Express     │
│  (HTML/CSS)  │         │  Frontend    │  HTTP   │  Backend     │
│              │         │              │  API    │              │
└──────────────┘         └──────────────┘         └──────────────┘
                                                          │
                                                          │
                                                          v
                                                   ┌──────────────┐
                                                   │   PDFKit     │
                                                   │   PDF生成    │
                                                   └──────────────┘
```

### データフロー

1. ユーザーがフォームに入力
2. Reactがフォームデータを管理
3. 「PDF生成」ボタンをクリック
4. Axiosで `/api/pdf/generate` にPOSTリクエスト
5. Expressサーバーがリクエストをバリデーション
6. PDFGeneratorがPDFを生成（2ページ: 代理店控え + お客様控え）
7. 生成されたPDFをBlobとしてレスポンス
8. ブラウザがPDFをダウンロード

## フロントエンド設計

### コンポーネント構造

```
App.js
  ├── header
  ├── ApplicationForm.js (メインフォーム)
  │     ├── 申込基本情報セクション
  │     ├── 入居者・同居人情報セクション (動的追加)
  │     ├── 対象物件情報セクション
  │     ├── 商品・サービス選択セクション
  │     ├── 緊急連絡先セクション (条件付き表示)
  │     └── 販売店情報セクション
  └── footer
```

### 状態管理

Reactの`useState`フックを使用してフォームの状態を管理:

```javascript
const [formData, setFormData] = useState({
  applicationType: 'new',      // 新規/更新
  applicationDate: '',         // 申込日
  applicantName: '',          // 申込者名
  // ... その他のフィールド
  residents: [],              // 入居者配列（動的追加）
  selectedOptions: [],        // オプションサービス配列
  emergencyContact: {},       // 緊急連絡先オブジェクト
  agentInfo: {}              // 販売店情報オブジェクト
});
```

### フォームのバリデーション

必須フィールド:
- 申込種別
- お申込日
- お申込者様名
- 物件住所
- 販売店名

条件付き必須:
- シニア向けサービス選択時: 緊急連絡先の名前

### 動的フォーム機能

#### 入居者・同居人の追加

```javascript
const addResident = () => {
  setFormData(prev => ({
    ...prev,
    residents: [...prev.residents, { name: '', nameKana: '', relationship: '' }]
  }));
};
```

#### 条件付き表示

```javascript
{formData.selectedOptions.includes('senior-watch') && (
  <section className="form-section">
    {/* 緊急連絡先フォーム */}
  </section>
)}
```

## バックエンド設計

### APIエンドポイント

#### POST /api/pdf/generate

**リクエスト:**
- Content-Type: application/json
- Body: フォームデータオブジェクト

**レスポンス:**
- Content-Type: application/pdf
- Content-Disposition: attachment; filename=application-form.pdf
- Body: PDFバイナリデータ

**エラーレスポンス:**
```json
{
  "error": "エラーメッセージ",
  "message": "詳細な説明"
}
```

### PDF生成ロジック

PDFGeneratorクラス (`backend/utils/pdfGenerator.js`):

#### 主要メソッド

1. `generatePDF(formData)` - メインのPDF生成メソッド
2. `generateAgentCopy(doc, formData)` - 代理店控えページを生成
3. `generateCustomerCopy(doc, formData)` - お客様控えページを生成
4. `generatePage(doc, formData, copyType)` - 共通のページ生成ロジック
5. `getProductTitle(product, paymentMethod)` - 商品タイトルを取得
6. `getProductName(product)` - 商品名を取得
7. `getPaymentMethodText(method)` - 支払方法のテキストを取得
8. `getOptionName(option)` - オプション名を取得

#### PDFレイアウト

- ページサイズ: A4 (595.28 x 841.89 ポイント)
- マージン: 40ポイント
- フォント: Helvetica（日本語はUnicode対応が必要な場合、カスタムフォントを追加）
- セクション:
  - タイトル (16pt, 太字)
  - 控えタイプ (12pt)
  - 各セクションヘッダー (10pt, 太字, 背景色付き)
  - フィールドラベル (9pt)
  - フィールド値 (10pt)

## スタイリング

### デザインシステム

#### カラーパレット

```css
Primary: #667eea (紫)
Secondary: #764ba2 (濃い紫)
Error: #e74c3c (赤)
Success: #27ae60 (緑)
Text: #333 (濃いグレー)
Light Text: #666 (グレー)
Border: #ddd (薄いグレー)
Background: #f5f5f5 (オフホワイト)
```

#### レスポンシブブレークポイント

```css
Desktop: デフォルト
Tablet: max-width: 768px
Mobile: max-width: 480px
```

### CSSモジュール

- `index.css` - グローバルスタイル
- `App.css` - アプリケーション全体のレイアウト
- `ApplicationForm.css` - フォームコンポーネントのスタイル

## 商品とオプションの設定

### 商品マッピング

| 商品ID | 商品名 | 利用可能な支払方法 |
|--------|--------|------------------|
| anshin-support-24 | あんしんサポート２４ | 月払, 年払（1年）, 年払（2年） |
| home-assist-24 | ホームアシスト２４ | 月払, 年払（1年）, 年払（2年） |
| anshin-full-support | あんしんフルサポート | 月払のみ |
| ierabu-anshin-support | いえらぶ安心サポート | 年払（2年）のみ |

### オプションマッピング

| オプションID | オプション名 | 追加条件 |
|-------------|-------------|---------|
| neighbor-trouble | 近隣トラブル解決支援サービス（マモロッカ） | なし |
| senior-watch | シニア向け総合見守りサービス（まごころ） | 緊急連絡先必須 |
| appliance-support | 家電の安心サポート（Syu-rIt！） | なし |

## テスト

### 手動テスト項目

1. **フォーム入力テスト**
   - [ ] すべてのフィールドに入力できる
   - [ ] 日付選択カレンダーが動作する
   - [ ] ラジオボタンとチェックボックスが動作する
   - [ ] 入居者の追加・削除が動作する

2. **商品選択テスト**
   - [ ] 商品を変更すると支払方法が更新される
   - [ ] 各商品で正しい支払方法のみ選択可能

3. **条件付き表示テスト**
   - [ ] シニア向けサービスを選択すると緊急連絡先が表示される
   - [ ] 選択を解除すると緊急連絡先が非表示になる

4. **バリデーションテスト**
   - [ ] 必須フィールドが空の場合エラーメッセージが表示される
   - [ ] シニア向けサービス選択時、緊急連絡先が必須になる

5. **PDF生成テスト**
   - [ ] PDFが正常に生成される
   - [ ] PDFが2ページ構成である（代理店控え + お客様控え）
   - [ ] 入力内容がPDFに正確に反映される
   - [ ] 選択した商品名がタイトルに表示される
   - [ ] オプションがPDFに表示される

6. **レスポンシブテスト**
   - [ ] デスクトップで正しく表示される
   - [ ] タブレットで正しく表示される
   - [ ] モバイルで正しく表示される

### エラーハンドリングテスト

1. **ネットワークエラー**
   - [ ] バックエンドが停止している場合のエラー表示
   - [ ] タイムアウト時のエラー表示

2. **入力エラー**
   - [ ] 不正な日付形式の処理
   - [ ] 不正な電話番号形式の処理

## パフォーマンス最適化

### フロントエンド

- [ ] React.memoでコンポーネントのメモ化
- [ ] useCallbackでイベントハンドラのメモ化
- [ ] 画像の遅延読み込み
- [ ] コード分割（React.lazy）

### バックエンド

- [ ] PDFキャッシュの実装
- [ ] リクエストレート制限
- [ ] gzip圧縮の有効化

## セキュリティ考慮事項

1. **入力のサニタイゼーション**
   - すべてのユーザー入力をサニタイズ
   - XSS攻撃の防止

2. **CORS設定**
   - 本番環境では適切なオリジンのみ許可

3. **レート制限**
   - PDF生成APIのレート制限を実装

4. **入力サイズ制限**
   - リクエストボディのサイズを制限（50MB）

## デプロイ

### 本番環境の要件

- Node.js 16.x以上
- 2GB以上のRAM
- SSL証明書（HTTPS）

### 環境変数

```bash
# バックエンド
PORT=5000
NODE_ENV=production

# フロントエンド（ビルド時）
REACT_APP_API_URL=https://api.example.com
```

### ビルドとデプロイ手順

1. フロントエンドのビルド
```bash
cd frontend
npm run build
```

2. バックエンドの起動
```bash
cd backend
NODE_ENV=production node server.js
```

3. リバースプロキシの設定（Nginx等）
```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 今後の拡張予定

### フェーズ2

- [ ] データベース連携（申込履歴の保存）
- [ ] ユーザー認証機能
- [ ] 管理画面の実装
- [ ] メール通知機能

### フェーズ3

- [ ] PDFテンプレートのカスタマイズ機能
- [ ] Excelフォーマットからの直接レイアウト読み込み
- [ ] 複数の申込書テンプレート対応
- [ ] 電子署名機能

### フェーズ4

- [ ] モバイルアプリ（React Native）
- [ ] オフライン対応
- [ ] クラウドストレージ連携
- [ ] 分析ダッシュボード

## トラブルシューティング

### よくある問題

1. **PDFの日本語が正しく表示されない**
   - PDFKitは標準フォントでは日本語に対応していない
   - カスタムフォント（例: IPAフォント）を追加する必要がある

2. **フォームの送信が失敗する**
   - バックエンドが起動しているか確認
   - CORSエラーの場合、バックエンドのCORS設定を確認
   - ブラウザのコンソールでエラーメッセージを確認

3. **レスポンシブデザインが機能しない**
   - ビューポートメタタグが設定されているか確認
   - CSSのメディアクエリを確認

## 参考資料

- [React公式ドキュメント](https://react.dev/)
- [Express公式ドキュメント](https://expressjs.com/)
- [PDFKit公式ドキュメント](https://pdfkit.org/)
- [MDN Web Docs](https://developer.mozilla.org/)

---

更新日: 2024-12-04
