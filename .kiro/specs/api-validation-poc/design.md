# Design Document

## Overview

API 検証用 PoC システムは、複数の REST API を呼び出し、レスポンスデータを結合・加工して最終的なアウトプットを生成するシステムです。React + TypeScript + Vite の既存環境を活用し、モジュラーで拡張可能な構成で実装します。

## Architecture

### システム構成

```
src/
├── service/              # API関連ファイル
│   ├── user.ts          # ユーザーAPI（型定義含む）
│   ├── post.ts          # 投稿API（型定義含む）
│   └── comment.ts       # コメントAPI（型定義含む）
├── scenario/            # 検証シナリオ（やりたいこと中心の入口）
│   └── user-post-scenario.ts  # ユーザー投稿結合シナリオ（型定義含む）
├── core/                # コアロジック
│   ├── http-client.ts   # 共通fetchラッパー（型定義含む）
│   └── logger.ts        # ログ・実行時間記録（型定義含む）
├── component/           # UI コンポーネント
│   └── ApiTester.tsx    # メインUI
└── App.tsx             # アプリケーションエントリーポイント
```

### データフロー

1. **実行開始**: ユーザーがボタンクリック時に実行開始
2. **シナリオ実行**: scenario/内の検証シナリオを実行
3. **API 呼び出し**: service/の各 API ファイルの関数を並行実行
4. **データ結合**: scenario 内で service の組み合わせ・結合ロジックを実行
5. **結果出力**: コンソールログとブラウザの pre タグで整形表示

## Components and Interfaces

### HTTP クライアント型定義

```typescript
// core/http-client.ts 内で定義
type HttpClientOptions = {
  timeout?: number;
  headers?: Record<string, string>;
};

type HttpResponse<T> = {
  data: T;
  status: number;
  statusText: string;
  executionTime: number;
};
```

### API 型定義

各 API ファイルは統一された型を実装：

```typescript
// service/user.ts 内で定義
// 実際の実装では型推論を活用し、必要最小限の型のみ定義
```

### データ処理型定義

```typescript
// scenario/user-post-scenario.ts 内で定義
// 複雑な結合データ構造のみ型定義、その他は型推論を活用
type CombinedUserData = {
  user: {
    id: number;
    name: string;
    email: string;
  };
  posts: {
    id: number;
    title: string;
    body: string;
    commentsCount: number;
  }[];
  totalPosts: number;
  totalComments: number;
};
```

## Data Models

### 使用する API（JSONPlaceholder）

1. **Users API** (`/users`)

   - ユーザー基本情報（id, name, email, address 等）

2. **Posts API** (`/posts`)

   - 投稿情報（id, userId, title, body）

3. **Comments API** (`/comments`)
   - コメント情報（id, postId, name, email, body）

### 結合データモデル

JSONPlaceholder の API レスポンスを結合して、ユーザーごとの投稿とコメント数を集約したデータ構造を生成します。具体的な型定義は実装時に必要最小限で定義します。

## Error Handling

基本的なエラーハンドリングを実装：

- API 呼び出し失敗時のエラーログ出力
- エラー情報を最終結果に含める
- リトライ機能は不要

## Testing Strategy

### 実装時のテスト方針

1. **単体テスト**: 各 API モジュールの個別テスト
2. **統合テスト**: データ結合ロジックのテスト
3. **手動テスト**: ブラウザでの動作確認

### テスト用データ

- JSONPlaceholder の実際のデータを使用
- ネットワークエラーのシミュレーション機能

## Implementation Details

### 技術スタック

- **フロントエンド**: React 19.1.0 + TypeScript 5.8.3
- **ビルドツール**: Vite 7.0.4
- **HTTP クライアント**: 共通 fetch ラッパー（Fetch API ベース）
- **スタイリング**: 最小限の CSS（結果表示用）

### HTTP クライアント設計

共通の fetch ラッパー（`core/http-client.ts`）が以下の機能を提供：

- 実行時間の自動計測
- エラーハンドリングの統一
- タイムアウト設定
- レスポンス形式の統一
- 各 service ファイルから利用される

## コーディングルール

### 型定義ルール

1. **interface 禁止**: `interface`は使用せず、`type`を使用する
2. **any 禁止**: `any`型は使用せず、具体的な型を定義する
3. **配列型表記**: `Array<T>`ではなく`T[]`を使用する
4. **型定義の配置**: 型定義は使用する関数と同じファイル内に定義する
5. **型推論優先**: 不要な型定義は避け、TypeScript の型推論を活用する
   - 関数の戻り値型は推論に任せる（複雑な場合のみ明示）
   - 変数の型は推論に任せる（初期値から型が明確な場合）
   - 必要最小限の型定義のみ行う

### ディレクトリ・ファイル命名ルール

1. **単数形統一**: ディレクトリ名、ファイル名は単数形で統一する
   - `services/` → `service/`
   - `components/` → `component/`
   - `scenarios/` → `scenario/`
2. **ファイル構成**: 1 つの API につき 1 つのファイルを作成し、API 呼び出し、型定義、データ加工ロジックを同一ファイルに含める
3. **バレル export 禁止**: `index.ts`での re-export は使用せず、直接 import する

### アーキテクチャルール

1. **レイヤー分離**:
   - `service/`: API 呼び出し層
   - `scenario/`: 検証シナリオ層（やりたいこと中心の入口、ビジネスロジック含む）
   - `core/`: 共通基盤層
2. **共通 fetch ラッパー**: 全ての API 呼び出しは`core/http-client.ts`を経由する

### パフォーマンス考慮事項

- API 呼び出しの並行実行（Promise.all 使用）
- 実行時間の詳細計測
- メモリ使用量の最適化

### 拡張性

- 新しい API の追加は新ファイル作成のみ
- 新しい検証シナリオは scenario/に追加
- 結合ロジックは scenario 内で管理
- 設定ベースでの API 管理機能

### 結果表示

- **コンソールログ**: 実行時間、エラー情報等の詳細ログ
- **ブラウザ表示**: `<pre>`タグで JSON 結果を整形表示
