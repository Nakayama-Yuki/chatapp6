# chatapp6

Next.js 15（App Router）＋ React 19 、Supabase Realtime を活用するリアルタイムチャットアプリです。

## 主な機能

- **リアルタイム通信**  
  Supabase Realtime（pub/sub）で双方向のチャット通信を実現。Socket.io の代替として軽量かつ高パフォーマンス。

- **メッセージの送受信**  
  チャットルームごとにメッセージを保存し、画面上に一覧表示。フォーム送信は `useFormStatus` フックでローディング対応。

- **オンラインステータス表示**  
  Supabase の Presence 機能を使って、チャットルーム内の参加ユーザーをリアルタイムにトラッキング。

- **ユーザー認証**  
  サインアップ／サインイン／パスワードリセット機能を Next.js の Server Actions と Supabase Auth で実装。

- **プロファイル編集**  
  ログインユーザーはプロフィール名を編集可能。変更を即座に反映。

- **チャットルーム管理**  
  新規チャットルームの作成、既存ルームへの参加、ルーム一覧表示。

## 技術スタック

- Next.js 15（App Router）
- React 19
- TypeScript 5
- Tailwind CSS 4
- Supabase (Realtime, Auth, SSR)
- PNPM
- shadcn/ui + Radix UI
- next-themes（ダーク／ライト切替）

## ディレクトリ構成

```
├── app                    # Next.js App Router 配下のページ・レイアウト
│   ├── (auth-pages)       # 認証用サブツリー（sign-in, sign-up, forgot-password）
│   ├── auth/callback      # Supabase OAuth コールバック用 Route
│   ├── protected          # 認証後のみアクセス可能なページ群
│   │   ├── chat           # チャットルームページ
│   │   ├── profile        # プロファイル編集ページ
│   │   └── reset-password # パスワードリセットページ
│   ├── layout.tsx         # アプリ全体の共通レイアウト (Server Component)
│   └── globals.css        # Tailwind グローバルスタイル
├── components             # UI コンポーネント群 (Client Components)
│   ├── chat               # チャット専用コンポーネント
│   ├── ui                 # ボタン・入力欄・バッジなどの共通UI
│   └── submit-button.tsx  # フォーム送信時のローディングボタン
├── lib                    # ドメインロジック
│   ├── auth/actions.ts    # サインイン／サインアップなどの Server Actions
│   └── profile/actions.ts # プロファイル編集の Server Actions
├── utils                  # 共通ユーティリティ
│   └── supabase           # Supabase クライアント初期化／ミドルウェア／SSR
├── supabase               # DB スキーマ／マイグレーション
├── next.config.ts         # Next.js 設定
├── tsconfig.json          # TypeScript 設定
└── package.json           # パッケージ管理 (pnpm)
```

## 環境構築と実行方法

1. **リポジトリをクローン**

   ```bash
   git clone <リポジトリURL> chatapp6
   cd chatapp6
   ```

2. **依存パッケージをインストール**

   ```bash
   pnpm install
   ```

3. **環境変数を設定**  
   プロジェクトルートに `.env.local` を作成し、以下を定義します：

   ```text
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Supabase プロジェクトの準備**

   - Supabase ダッシュボードで新規プロジェクトを作成
   - `supabase/schema.sql` に沿ってテーブルを作成
   - 必要に応じて `supabase/migrations` を適用

5. **開発サーバーを起動**

   ```bash
   pnpm dev
   ```

6. **ブラウザで確認**  
   http://localhost:3000 にアクセスし、チャットアプリを操作できます。

## ライセンス

This project is licensed under the [MIT License](./LICENSE).  
You are free to use, modify, and distribute this software, provided that proper attribution is given.
