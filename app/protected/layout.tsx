import { createClient } from "@/utils/supabase/server";
import ChatNavigation from "@/components/chat/chat-navigation";
import { redirect } from "next/navigation";

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

  return (
    <div className="flex-1 w-full flex flex-col max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* ヘッダー */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Supabase Chat App</h1>
      </header>

      {/* ナビゲーション */}
      <ChatNavigation />

      {/* メインコンテンツ */}
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
