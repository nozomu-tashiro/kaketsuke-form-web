# API仕様書

## 概要

駆付けサービス入会申込書PDF出力システムのREST APIドキュメントです。

## ベースURL

```
http://localhost:5000/api
```

本番環境:
```
https://your-domain.com/api
```

## 認証

現在のバージョンでは認証は実装されていません。将来のバージョンでJWT認証を追加予定です。

## エンドポイント一覧

### 1. ヘルスチェック

システムの稼働状況を確認します。

**エンドポイント:** `GET /health`

**レスポンス:**

```json
{
  "status": "ok",
  "message": "Application Form System API is running"
}
```

**ステータスコード:**
- `200 OK` - システムが正常に動作しています

---

### 2. PDF生成

申込書PDFを生成します。

**エンドポイント:** `POST /pdf/generate`

**リクエストヘッダー:**
```
Content-Type: application/json
```

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
  "residents": [
    {
      "name": "山田 花子",
      "nameKana": "ヤマダ ハナコ",
      "relationship": "妻"
    }
  ],
  "propertyAddress": "東京都渋谷区〇〇1-2-3",
  "propertyName": "いえらぶマンション",
  "propertyNameKana": "イエラブマンション",
  "roomNumber": "101",
  "selectedProduct": "anshin-support-24",
  "paymentMethod": "monthly",
  "selectedOptions": ["neighbor-trouble", "senior-watch"],
  "servicePrice": "15000",
  "guaranteeNumber": "00000268",
  "emergencyContact": {
    "name": "田中 一郎",
    "nameKana": "タナカ イチロウ",
    "address": "東京都港区〇〇1-2-3",
    "homePhone": "03-9876-5432",
    "mobilePhone": "080-9876-5432",
    "relationship": "息子"
  },
  "agentInfo": {
    "name": "いえらぶ不動産販売株式会社",
    "phone": "03-1234-5678",
    "code": "13-00-11223366-000",
    "representativeName": "いえらぶ太郎"
  }
}
```

**フィールド詳細:**

| フィールド名 | 型 | 必須 | 説明 | 例 |
|-------------|-----|------|------|-----|
| applicationType | string | ✅ | 申込種別 | "new" または "renewal" |
| applicationDate | string | ✅ | 申込日（ISO 8601形式） | "2024-12-04" |
| applicantName | string | ✅ | お申込者様名 | "山田 太郎" |
| applicantNameKana | string | | フリガナ | "ヤマダ タロウ" |
| mobilePhone | string | | 携帯番号 | "090-1234-5678" |
| homePhone | string | | 固定番号 | "03-1234-5678" |
| birthDate | string | | 生年月日（ISO 8601形式） | "1980-01-01" |
| gender | string | | 性別 | "male" または "female" |
| residents | array | | 入居者・同居人リスト | 下記参照 |
| propertyAddress | string | ✅ | 物件住所 | "東京都渋谷区〇〇1-2-3" |
| propertyName | string | | 物件名 | "いえらぶマンション" |
| propertyNameKana | string | | 物件名フリガナ | "イエラブマンション" |
| roomNumber | string | | 号室 | "101" |
| selectedProduct | string | ✅ | 商品ID | "anshin-support-24" |
| paymentMethod | string | ✅ | 支払方法 | "monthly" |
| selectedOptions | array | | オプションサービスID配列 | ["neighbor-trouble"] |
| servicePrice | string | | サービス提供価格 | "15000" |
| guaranteeNumber | string | | 保証番号 | "00000268" |
| emergencyContact | object | 条件付き | 緊急連絡先（シニア向けサービス選択時必須） | 下記参照 |
| agentInfo | object | ✅ | 販売店情報 | 下記参照 |

**residents配列の要素:**

```json
{
  "name": "山田 花子",
  "nameKana": "ヤマダ ハナコ",
  "relationship": "妻"
}
```

| フィールド名 | 型 | 必須 | 説明 |
|-------------|-----|------|------|
| name | string | | 名前 |
| nameKana | string | | フリガナ |
| relationship | string | | 続柄 |

**emergencyContact オブジェクト:**

```json
{
  "name": "田中 一郎",
  "nameKana": "タナカ イチロウ",
  "address": "東京都港区〇〇1-2-3",
  "homePhone": "03-9876-5432",
  "mobilePhone": "080-9876-5432",
  "relationship": "息子"
}
```

| フィールド名 | 型 | 必須 | 説明 |
|-------------|-----|------|------|
| name | string | ✅ | 名前 |
| nameKana | string | ✅ | フリガナ |
| address | string | | 住所 |
| homePhone | string | | 固定電話 |
| mobilePhone | string | | 携帯電話 |
| relationship | string | | 続柄 |

**agentInfo オブジェクト:**

```json
{
  "name": "いえらぶ不動産販売株式会社",
  "phone": "03-1234-5678",
  "code": "13-00-11223366-000",
  "representativeName": "いえらぶ太郎"
}
```

| フィールド名 | 型 | 必須 | 説明 |
|-------------|-----|------|------|
| name | string | ✅ | 販売店名 |
| phone | string | | 電話番号 |
| code | string | | 販売店コード |
| representativeName | string | | 担当者名 |

**商品ID一覧:**

| ID | 商品名 | 利用可能な支払方法 |
|----|--------|------------------|
| anshin-support-24 | あんしんサポート２４ | monthly, yearly-1, yearly-2 |
| home-assist-24 | ホームアシスト２４ | monthly, yearly-1, yearly-2 |
| anshin-full-support | あんしんフルサポート | monthly |
| ierabu-anshin-support | いえらぶ安心サポート | yearly-2 |

**支払方法ID一覧:**

| ID | 支払方法名 |
|----|----------|
| monthly | 月払 |
| yearly-1 | 年払（1年更新） |
| yearly-2 | 年払（2年更新） |

**オプションサービスID一覧:**

| ID | オプション名 | 備考 |
|----|------------|------|
| neighbor-trouble | 近隣トラブル解決支援サービス（マモロッカ） | |
| senior-watch | シニア向け総合見守りサービス（まごころ） | 選択時、緊急連絡先必須 |
| appliance-support | 家電の安心サポート（Syu-rIt！） | |

**レスポンスヘッダー:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename=application-form.pdf
Content-Length: [PDFファイルのサイズ]
```

**レスポンスボディ:**

PDFファイルのバイナリデータ（A4サイズ2ページ構成）
- 1ページ目: 代理店控え
- 2ページ目: お客様控え

**ステータスコード:**
- `200 OK` - PDF生成成功
- `400 Bad Request` - リクエストパラメータが不正
- `500 Internal Server Error` - サーバー内部エラー

**エラーレスポンス例:**

```json
{
  "error": "Missing required fields",
  "required": ["applicationType", "applicantName"]
}
```

```json
{
  "error": "Failed to generate PDF",
  "message": "詳細なエラーメッセージ"
}
```

---

## リクエスト例

### cURLを使用した例

```bash
curl -X POST http://localhost:5000/api/pdf/generate \
  -H "Content-Type: application/json" \
  -d '{
    "applicationType": "new",
    "applicationDate": "2024-12-04",
    "applicantName": "山田 太郎",
    "applicantNameKana": "ヤマダ タロウ",
    "mobilePhone": "090-1234-5678",
    "propertyAddress": "東京都渋谷区〇〇1-2-3",
    "selectedProduct": "anshin-support-24",
    "paymentMethod": "monthly",
    "agentInfo": {
      "name": "いえらぶ不動産販売株式会社",
      "phone": "03-1234-5678"
    }
  }' \
  --output application-form.pdf
```

### JavaScriptを使用した例（Axios）

```javascript
import axios from 'axios';

const formData = {
  applicationType: 'new',
  applicationDate: '2024-12-04',
  applicantName: '山田 太郎',
  applicantNameKana: 'ヤマダ タロウ',
  mobilePhone: '090-1234-5678',
  propertyAddress: '東京都渋谷区〇〇1-2-3',
  selectedProduct: 'anshin-support-24',
  paymentMethod: 'monthly',
  agentInfo: {
    name: 'いえらぶ不動産販売株式会社',
    phone: '03-1234-5678'
  }
};

try {
  const response = await axios.post(
    'http://localhost:5000/api/pdf/generate',
    formData,
    { responseType: 'blob' }
  );
  
  // PDFをダウンロード
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'application-form.pdf');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
} catch (error) {
  console.error('PDF生成エラー:', error);
}
```

### Pythonを使用した例（requests）

```python
import requests
import json

url = 'http://localhost:5000/api/pdf/generate'

form_data = {
    'applicationType': 'new',
    'applicationDate': '2024-12-04',
    'applicantName': '山田 太郎',
    'applicantNameKana': 'ヤマダ タロウ',
    'mobilePhone': '090-1234-5678',
    'propertyAddress': '東京都渋谷区〇〇1-2-3',
    'selectedProduct': 'anshin-support-24',
    'paymentMethod': 'monthly',
    'agentInfo': {
        'name': 'いえらぶ不動産販売株式会社',
        'phone': '03-1234-5678'
    }
}

headers = {'Content-Type': 'application/json'}

response = requests.post(url, data=json.dumps(form_data), headers=headers)

if response.status_code == 200:
    with open('application-form.pdf', 'wb') as f:
        f.write(response.content)
    print('PDFが正常に生成されました')
else:
    print(f'エラー: {response.status_code}')
    print(response.json())
```

## エラーハンドリング

### エラーコード一覧

| ステータスコード | 説明 | 対処方法 |
|-----------------|------|---------|
| 400 | 必須フィールドが不足している | リクエストボディを確認し、必須フィールドを追加 |
| 500 | サーバー内部エラー | サーバーログを確認し、管理者に連絡 |

### エラーレスポンスの構造

```json
{
  "error": "エラーの種類",
  "message": "詳細なエラーメッセージ",
  "required": ["必須フィールドのリスト（該当する場合）"]
}
```

## レート制限

現在のバージョンではレート制限は実装されていません。将来のバージョンで実装予定です。

推奨される使用頻度:
- 1秒あたり最大10リクエスト
- 1分あたり最大100リクエスト

## CORS設定

開発環境ではすべてのオリジンからのリクエストを許可しています。

本番環境では、以下のような制限を推奨します:

```javascript
const corsOptions = {
  origin: ['https://your-frontend-domain.com'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));
```

## バージョニング

現在のAPIバージョン: **v1.0.0**

APIのバージョン管理は今後のアップデートで導入予定です。

破壊的な変更がある場合:
- URLパスに `/api/v2/` のようなバージョン番号を含める
- 古いバージョンのサポート期間を設定する

## サポート

APIに関する質問や問題がある場合:
- GitHubのIssueを作成
- 開発チームに連絡

## 変更履歴

### v1.0.0 (2024-12-04)
- 初回リリース
- PDF生成エンドポイントの追加
- ヘルスチェックエンドポイントの追加

---

最終更新: 2024-12-04
