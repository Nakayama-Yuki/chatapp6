import { createClient } from "@/utils/supabase/server";
import Sidebar from "@/components/sidebar";
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
    <div className="flex h-screen bg-background">
      {/* サイドバー */}
      <Sidebar />

      {/* メインコンテンツエリア */}
      <div className="flex-1 flex flex-col lg:ml-0 overflow-hidden">
        {/* メインコンテンツ */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
