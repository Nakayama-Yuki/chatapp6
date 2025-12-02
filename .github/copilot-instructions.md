# Copilot カスタム指示 - Supabase Realtime チャットアプリ

## プロジェクト概要

Supabase Realtime を活用したリアルタイムチャットアプリ。Next.js 15 App Router + React 19 + TypeScript 5 + Tailwind CSS v4 構成。

## アーキテクチャ

### データフロー
```
[Client Component] → Supabase Realtime (broadcast/presence) → [他クライアント]
                  ↘ Supabase DB (messages テーブル) → 永続化
```

### 認証フロー
1. `middleware.ts` → セッション更新 + `/protected/*` へのアクセス制御
2. `utils/supabase/server.ts` → Server Component 用クライアント
3. `utils/supabase/client.ts` → Client Component 用クライアント
4. `lib/auth/actions.ts` → Server Actions (signIn, signUp, resetPassword)

### ルーム・メッセージ
- `rooms` テーブル: チャットルーム一覧
- `rooms_users` テーブル: ユーザーとルームの関連付け
- `messages` テーブル: メッセージ永続化
- RLS ポリシー: 参加ルームのメッセージのみ閲覧・送信可能（`supabase/schema.sql` 参照）

## 重要なパターン

### Supabase クライアント使い分け
```typescript
// Server Component / Server Actions
import { createClient } from "@/utils/supabase/server";
const supabase = await createClient();

// Client Component
import { createClient } from "@/utils/supabase/client";
const supabase = createClient(); // await 不要
```

### リアルタイム通信パターン（参照: `app/protected/chat/page.tsx`）
```typescript
// Realtime 認証トークン設定
const token = (await supabase.auth.getSession()).data.session?.access_token!;
supabase.realtime.setAuth(token);

// チャンネル購読（broadcast + presence）
const channel = supabase.channel(roomTopic, { config: { broadcast: { self: true }, private: true }});
channel.on("broadcast", { event: "message" }, callback).on("presence", { event: "join" }, callback).subscribe();
```

### Server Actions パターン（参照: `lib/profile/actions.ts`）
```typescript
"use server";
export type ActionState = { error?: string; success?: boolean } | null;

export async function updateAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  // バリデーション → DB 操作 → revalidatePath
}
```

### フォーム送信（参照: `app/protected/profile/profile-form.tsx`）
```typescript
// React 19 useActionState を使用
const [state, formAction, isPending] = useActionState<ActionState, FormData>(updateAction, null);
<form action={formAction}>...</form>
```

## ディレクトリ構造の意図

- `app/(auth-pages)/` → 未認証ユーザー用ページ群（Route Group）
- `app/protected/` → 認証必須ページ群、`layout.tsx` でサイドバー表示
- `components/chat/` → チャット専用 UI コンポーネント
- `components/ui/` → shadcn/ui ベースの汎用 UI（`button.tsx`, `input.tsx` など）
- `lib/` → ドメインロジック（認証、プロフィール等の Server Actions）
- `utils/supabase/` → Supabase クライアント初期化のみ

## 開発コマンド

```bash
pnpm dev      # 開発サーバー起動
pnpm build    # 本番ビルド
pnpm start    # 本番サーバー起動
```

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
