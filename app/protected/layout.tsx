import { createClient } from "@/utils/supabase/server";
import ChatNavigation from "@/components/chat/chat-navigation";
import { redirect } from "next/navigation";
import Link from "next/link";

/**
 * プロテクトエリアのレイアウトコンポーネント
 * 認証されたユーザーのみがアクセス可能
 */
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // ログアウト処理（サーバーアクション）
  const signOut = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    return redirect("/sign-in");
  };

  return (
    <div className="flex-1 w-full flex flex-col max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* ヘッダー */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Supabase Chat App</h1>

        <div className="flex items-center gap-4">
          <span className="text-sm">{user.email}</span>
          <form action={signOut}>
            <button className="py-2 px-4 rounded-md bg-foreground/10 hover:bg-foreground/20 transition">
              ログアウト
            </button>
          </form>
        </div>
      </header>

      {/* ナビゲーション */}
      <ChatNavigation />

      {/* メインコンテンツ */}
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
