# Copilot カスタム指示 - Next.js 15 & React 19 & Tailwind CSS v4 & TypeScript 5

## 全般的なガイドライン

### バージョン指定

- **Next.js**: 15.x (App Router 必須)
- **React**: 19.x
- **Tailwind CSS**: 4.x
- **TypeScript**: 5.x
- **パッケージマネージャー**: pnpm (推奨)

### コーディング規約

- **変数名**: camelCase
- **クラス名**: PascalCase
- **コンポーネント**: 必ず関数宣言 (`function`) を使用、`const` は使わない
- **コメント**: 全ての関数、コンポーネント、複雑なロジックに日本語コメントを追加

## Next.js 15 ベストプラクティス

### App Router

- `app/` ディレクトリ構造を使用
- Server Components をデフォルトとして使用
- Client Components は `'use client'` ディレクティブで明示的に指定
- Route Groups `()` を適切に活用してレイアウトを整理

### ファイル構造

```
app/
  layout.tsx          # ルートレイアウト
  page.tsx            # ホームページ
  loading.tsx         # ローディングUI
  error.tsx           # エラーUI
  not-found.tsx       # 404ページ
  (auth)/             # Route Group
    layout.tsx
    sign-in/
      page.tsx
```

### パフォーマンス最適化

- `next/image` を必ず使用
- `next/font` で Web フォント最適化
- Dynamic imports で必要に応じてコード分割
- Suspense 境界を適切に配置

### Server Actions

- フォーム処理は Server Actions を使用
- `'use server'` ディレクティブを明示
- 型安全性を保つために zod でバリデーション

## React 19 ベストプラクティス

### 新機能の活用

- **React Compiler**: 最適化のために活用
- **Actions**: フォーム送信やミューテーションに使用
- **use Hook**: プロミスやコンテキストで使用
- **React.forwardRef**: 不要になった場合は削除

### Hooks 使用パターン

```typescript
// 良い例
function MyComponent({ userId }: { userId: string }) {
  // Server Componentからのデータ取得
  const user = use(fetchUser(userId));

  return <div>{user.name}</div>;
}
```

### 状態管理

- ローカル状態は `useState`
- 複雑な状態は `useReducer`
- グローバル状態は Context + useReducer または外部ライブラリ
- Server State は React Query/SWR を推奨

## Tailwind CSS v4 ベストプラクティス

### 設定

- `@tailwindcss/postcss` プラグインを使用
- CSS-in-JS ではなく CSS ファイルでの設定を推奨
- カスタムプロパティを活用してテーマを管理

### クラス命名

- Utility-first アプローチを徹底
- 複雑なスタイルは `@apply` で再利用可能なクラスを作成
- レスポンシブデザインはモバイルファーストで記述

```typescript
// 良い例
function Button({ children, variant = "primary" }: ButtonProps) {
  return (
    <button
      className={`
      px-4 py-2 rounded-lg font-medium transition-colors
      ${
        variant === "primary"
          ? "bg-blue-600 text-white hover:bg-blue-700"
          : "bg-gray-200 text-gray-900 hover:bg-gray-300"
      }
    `}>
      {children}
    </button>
  );
}
```

### ダークモード

- `next-themes` ライブラリを使用
- CSS 変数でテーマ切り替えを実装
- システム設定を尊重する設計

## TypeScript 5 ベストプラクティス

### 型定義

- `interface` よりも `type` を推奨 (union 型や条件型が多い場合)
- Props 型は必ず明示的に定義
- `any` 型は絶対に使用しない、`unknown` を使用

```typescript
// 良い例
type UserProps = {
  id: string;
  name: string;
  email?: string;
  role: "admin" | "user" | "guest";
};

function UserCard(props: UserProps) {
  // 実装
}
```

### 新機能の活用

- `satisfies` 演算子を積極的に使用
- Template Literal Types を活用
- `const` assertions で厳密な型推論

### ファイル構造

```
types/
  global.d.ts         # グローバル型定義
  api.ts              # API関連の型
  components.ts       # コンポーネントの型
```

## アクセシビリティ

### 必須要件

- セマンティック HTML 要素を使用
- `aria-*` 属性を適切に設定
- キーボードナビゲーション対応
- スクリーンリーダー対応

### Radix UI 活用

- アクセシブルなコンポーネントは Radix UI を使用
- カスタムスタイリングは Tailwind で実装

## パフォーマンス

### バンドル最適化

- Tree shaking 対応のため named import を使用
- Dynamic imports で必要に応じてコード分割
- Bundle Analyzer で定期的にサイズをチェック

### 画像最適化

- `next/image` の `priority` プロパティを適切に設定
- WebP/AVIF フォーマットを優先
- レスポンシブ画像には `sizes` プロパティを指定

## セキュリティ

### 入力値検証

- サーバーサイドで必ずバリデーション実装
- zod や yup でスキーマベースの検証
- XSS 対策として DOMPurify を使用（必要に応じて）

### 環境変数

- 秘密情報は `NEXT_PUBLIC_` プレフィックスを付けない
- `.env.local` でローカル開発用の設定を管理

## テスト

### 推奨ツール

- **Unit Test**: Jest + React Testing Library
- **E2E Test**: Playwright
- **型チェック**: TypeScript compiler

### テスト戦略

- コンポーネントの動作をテスト、実装詳細はテストしない
- ユーザーの視点でテストを記述
- アクセシビリティテストも含める

## デプロイメント

### Vercel 推奨設定

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // React Compiler (安定版がリリース後)
    reactCompiler: true,
  },
  // 画像最適化
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // セキュリティヘッダー
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

## 例外・特殊ケース

### レガシーコード対応

- 段階的な移行を推奨
- 既存の `const` コンポーネントは必要に応じて `function` に変更

### サードパーティライブラリ

- Next.js 15 対応を確認してから使用
- 型定義が提供されているライブラリを優先

---

これらのガイドラインに従って、保守性が高く、パフォーマンスに優れた、アクセシブルな Web アプリケーションを構築してください。
