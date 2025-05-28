"use client";

import { useActionState } from "react";
import {
  updateUserProfileAction,
  type ActionState,
} from "@/lib/profile/actions";

// ユーザーデータの型定義
type UserData = {
  id: string;
  email: string;
  name: string;
  created_at: string;
  last_sign_in_at: string | null;
};

/**
 * プロフィール編集フォームコンポーネント（Client Component）
 * useActionState を使用して簡潔に実装
 */
export default function ProfileForm({ userData }: { userData: UserData }) {
  // useActionState を使用してサーバ関数と状態を管理
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    updateUserProfileAction,
    null
  );

  return (
    <div className="bg-card border rounded-xl p-6 space-y-6">
      {/* メッセージ表示 */}
      {state?.error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-800 border border-red-200">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="p-4 rounded-lg bg-green-50 text-green-800 border border-green-200">
          プロフィールを更新しました
        </div>
      )}

      <form action={formAction} className="space-y-6">
        {/* メールアドレス */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-foreground">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            value={userData.email}
            disabled
            className="w-full px-4 py-3 border rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground">
            メールアドレスは変更できません
          </p>
        </div>

        {/* ユーザー名 */}
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-foreground">
            ユーザー名
          </label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={userData.name}
            required
            className="w-full px-4 py-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="ユーザー名を入力してください"
          />
        </div>

        {/* 保存ボタン */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition">
          {isPending ? "更新中..." : "変更を保存"}
        </button>
      </form>
    </div>
  );
}
