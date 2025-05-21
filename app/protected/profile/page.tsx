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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-slate-900 mt-10">
      <h1 className="text-2xl font-bold mb-6">プロフィール設定</h1>

      {message && (
        <div
          className={`p-4 mb-4 rounded ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            value={email}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">
            メールアドレスは変更できません
          </p>
        </div>

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1">
            ユーザー名
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={updating}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
          {updating ? "更新中..." : "保存"}
        </button>
      </form>
    </div>
  );
}
