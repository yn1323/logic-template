# よく使うコマンド集

## 開発コマンド
- `pnpm dev` - 開発サーバー起動
- `pnpm build` - プロダクションビルド
- `pnpm preview` - ビルド結果のプレビュー

## 品質チェックコマンド（完了前必須）
⚠️ 作業完了前に必ず以下を順番に実行すること：
1. `pnpm lint:fix` - linter自動修正
2. `pnpm type-check` - 型チェック
3. `pnpm lint` - linter実行

## システムコマンド（macOS）
- `ls` - ファイル一覧
- `cd` - ディレクトリ移動
- `grep` - テキスト検索
- `find` - ファイル検索
- `git` - バージョン管理

## ディレクトリ構造確認
- `tree src` - srcディレクトリ構造表示
- `find src -name "*.ts" -o -name "*.tsx"` - TypeScriptファイル一覧