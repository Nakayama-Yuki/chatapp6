import { createClient } from "@/utils/supabase/server";
import Sidebar from "@/components/sidebar";
import { redirect } from "next/navigation";
import { Suspense } from "react";

/**
 * プロテクトエリアのレイアウトコンポーネント
 * 認証されたユーザーのみがアクセス可能
 */
type ProtectedLayoutProps = {
  children: React.ReactNode;
};

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          読み込み中...
        </div>
      }
    >
      <ProtectedContent>{children}</ProtectedContent>
    </Suspense>
  );
}

/** 認証状態を確認し、ログイン済みユーザーに保護ページを表示する。 */
async function ProtectedContent({ children }: ProtectedLayoutProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 未認証ユーザーはサインインページにリダイレクト
  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex h-screen bg-background">
      {/* サイドバーナビゲーション */}
      <Sidebar />

      {/* メインコンテンツエリア */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* メインコンテンツ */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
