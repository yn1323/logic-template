# コードスタイル・規約

## TypeScript設定
- **Target**: ES2022
- **厳密モード**: 有効（strict: true）
- **未使用変数チェック**: 有効（noUnusedLocals/Parameters: true）
- **型推論**: 積極的に利用（CLAUDE.md指示）
- **定数化**: 2箇所以上で使用時のみ

## Biome設定
- **インデントスタイル**: スペース
- **クォートスタイル**: シングルクォート
- **未使用変数**: エラー（noUnusedVariables: error）
- **セルフクロージング要素**: 必須（useSelfClosingElements: error）

## 禁止事項
- **バレルエクスポート**: 禁止
- **data-testid**: テストでの使用禁止
- **複数質問**: 1つずつ質問すること

## 推奨事項
- **文字エンコーディング**: UTF-8
- **型定義**: TypeScript推論を活用
- **エラーハンドリング**: 積極的に実装