# セキュリティ改善：メールアドレス保護

## 実装内容

### 1. メールアドレスマスク機能

- `lib/utils.ts`に`maskEmail`関数を追加
- プロフィールページでのみメールアドレスをマスク表示
- **マスク方式**: 右から 4 文字を残してそれより前をアスタリスクでマスク
- 例: `user@example.com` → `****ser@example.com`
- 例: `abcdefg@test.jp` → `***defg@test.jp`

### 2. ユーザー ID 基盤への移行

- チャット機能でメールアドレス依存を削除
- Supabase のユーザー識別機能（user_id）を活用
- プレゼンス機能もユーザー ID ベースに変更

### 3. 変更された機能

#### ユーザーリスト

- メールアドレス表示を削除
- ユーザー ID と名前のみで識別

#### チャット機能

- `/invite`コマンドが`/invite <user_id>`形式に変更
- システムメッセージでメールアドレス非表示

#### プロフィールページ

- メールアドレスはマスク表示を維持（設定確認のため）

## メリット

1. **プライバシー保護**: メールアドレスの露出を最小限に
2. **セキュリティ向上**: 個人識別情報の漏洩リスク軽減
3. **Supabase 活用**: 標準的なユーザー識別機能の利用

## 使用方法

- ユーザーを招待: `/invite <ユーザーID>`
- ユーザー ID はプロフィールページで確認可能
