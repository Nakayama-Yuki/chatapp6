<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Supabase Realtime チャットアプリ開発ガイド

## プロジェクト概要

Supabase Realtime を活用したリアルタイムチャットアプリ。Next.js 16 App Router + React 19 + TypeScript + Tailwind CSS v4 構成。

## アーキテクチャ

### データフロー
```
[Client Component] → Supabase Realtime (broadcast/presence) → [他クライアント]
                  ↘ Supabase DB (messages テーブル) → 永続化
```

### 認証フロー
1. ルートの `proxy.ts` から `utils/supabase/proxy.ts` → セッション更新 + `/protected/*` へのアクセス制御
2. `utils/supabase/server.ts` → Server Component 用クライアント
3. `utils/supabase/client.ts` → Client Component 用クライアント
4. `lib/auth/actions.ts` → Server Actions (signIn, signUp, resetPassword)

### ルーム・メッセージ
- `rooms` テーブル: チャットルーム一覧
- `rooms_users` テーブル: ユーザーとルームの関連付け
- `messages` テーブル: メッセージ永続化
- RLS ポリシー: 参加ルームのメッセージのみ閲覧・送信可能（`supabase/schema.sql` 参照）

## 重要なパターン

### サーバー・クライアント境界

- Server Component / Server Actions は `utils/supabase/server.ts` の非同期 `createClient()`、Client Component は `utils/supabase/client.ts` の同期 `createClient()` を使う。
- Realtime は `app/protected/chat/page.tsx` を参照し、認証トークンを `supabase.realtime.setAuth(token)` に設定して private な broadcast / presence を購読する。トークン不在と購読解除の処理も実装に合わせて確認する。
- Server Actions は `lib/profile/actions.ts` の検証→DB操作→再検証の流れと戻り値の型に合わせる。
- フォーム送信は `app/protected/profile/profile-form.tsx` の `useActionState` と pending 表示を参照する。

## ディレクトリ構造の意図

- `app/(auth-pages)/` → 未認証ユーザー用ページ群（Route Group）
- `app/protected/` → 認証必須ページ群、`layout.tsx` でサイドバー表示
- `components/chat/` → チャット専用 UI コンポーネント
- `components/ui/` → shadcn/ui ベースの汎用 UI（`button.tsx`, `input.tsx` など）
- `lib/` → ドメインロジック（認証、プロフィール等の Server Actions）
- `utils/supabase/` → Supabase クライアント初期化とセッション更新・アクセス制御

## 開発コマンド

```bash
pnpm dev      # 開発サーバー起動
pnpm build    # 本番ビルド
pnpm start    # 本番サーバー起動（ビルド後）
```

lint・自動テストのスクリプトは現在ない。変更時はビルドと、認証・ルーム参加・メッセージの永続化と配信・プロフィール更新を確認し、未実行の確認は理由を報告する。

## コーディング規約

- **コンポーネント**: 必ず `function` 宣言を使用、`const` は使わない
- **コメント**: 全ての関数・コンポーネントに日本語 JSDoc コメント
- **型定義**: Props 型は必ず明示（`any` 禁止）
- **命名規則**: 変数は camelCase、コンポーネント/型は PascalCase

## 環境変数

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 注意事項

- RLS ポリシー変更時は `supabase/schema.sql` を更新し、マイグレーションを作成
- Realtime 使用時は必ず `supabase.realtime.setAuth(token)` でトークン設定
- 認証必須ページは `/protected/` 配下に配置

## 指示書の管理

プロジェクト固有の開発ルールはこのファイルで管理・更新してください。依存バージョンと実行可能なコマンドは `package.json`、設定値は各設定ファイルを参照してください。

セットアップと使い方は [README.md](README.md) を参照。実装・設定・コマンドを変更した場合は関連する説明も更新する。
