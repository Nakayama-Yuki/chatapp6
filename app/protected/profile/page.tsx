"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { updateUserProfile } from "@/lib/profile/actions";
import { User } from "@supabase/supabase-js";

/**
 * ユーザープロフィール編集ページコンポーネント
 */
export default function ProfilePage() {
  // 状態管理
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [updating, setUpdating] = useState(false);

  // Supabaseクライアントの初期化
  const supabase = createClient();

  // ユーザー情報の取得
  useEffect(() => {
    const getUser = async () => {
      setLoading(true);

      // ユーザー情報を取得
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);
        setEmail(user.email || "");

        // プロフィール情報を取得
        const { data } = await supabase
          .from("profiles")
          .select("name, email")
          .eq("id", user.id)
          .single();

        if (data) {
          setName(data.name || "");
        }
      }

      setLoading(false);
    };

    getUser();
  }, []);

  /**
   * プロフィール更新処理
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage(null);

    try {
      console.log("プロフィール更新リクエスト:", name);
      const result = await updateUserProfile(name);
      console.log("プロフィール更新結果:", result);

      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "プロフィールを更新しました" });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "更新中にエラーが発生しました";
      setMessage({ type: "error", text: errorMessage });
      console.error("プロフィール更新エラー:", error);
    } finally {
      setUpdating(false);
    }
  };

  // ローディング表示
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          プロフィール設定
        </h1>
        <p className="text-muted-foreground">
          個人情報とアカウント設定を管理します
        </p>
      </div>

      {/* プロフィールカード */}
      <div className="bg-card border rounded-xl p-6 space-y-6">
        {/* メッセージ表示 */}
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
              value={email}
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
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="ユーザー名を入力してください"
            />
          </div>

          {/* 保存ボタン */}
          <button
            type="submit"
            disabled={updating}
            className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition">
            {updating ? "更新中..." : "変更を保存"}
          </button>
        </form>
      </div>

      {/* アカウント情報 */}
      <div className="bg-card border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">アカウント情報</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">ユーザーID:</span>
            <span className="font-mono text-xs">{user?.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">作成日:</span>
            <span>
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString("ja-JP")
                : "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">最終ログイン:</span>
            <span>
              {user?.last_sign_in_at
                ? new Date(user.last_sign_in_at).toLocaleDateString("ja-JP")
                : "-"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
