import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "@/app/protected/profile/profile-form";

/**
 * プロフィールページ（Server Component）
 * ユーザー情報とプロフィール情報をサーバーサイドで取得
 */
export default async function ProfilePage() {
  // Supabaseサーバークライアントの初期化
  const supabase = await createClient();

  // ユーザー情報の取得
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // 認証されていない場合はサインインページにリダイレクト
  if (userError || !user) {
    redirect("/sign-in");
  }

  // プロフィール情報の取得
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, email")
    .eq("id", user.id)
    .single();

  // ユーザーデータを整理
  const userData = {
    id: user.id,
    email: user.email || "",
    name: profile?.name || "",
    created_at: user.created_at,
    last_sign_in_at: user.last_sign_in_at || null,
  };

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

      {/* プロフィールフォーム（Client Component） */}
      <ProfileForm userData={userData} />

      {/* アカウント情報 */}
      <div className="bg-card border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">アカウント情報</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">ユーザーID:</span>
            <span className="font-mono text-xs">{userData.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">作成日:</span>
            <span>
              {userData.created_at
                ? new Date(userData.created_at).toLocaleDateString("ja-JP")
                : "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">最終ログイン:</span>
            <span>
              {userData.last_sign_in_at
                ? new Date(userData.last_sign_in_at).toLocaleDateString("ja-JP")
                : "-"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
