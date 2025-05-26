import { createClient } from "@/utils/supabase/server";
import { InfoIcon, MessageSquare, User } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="space-y-8">
      {/* ウェルカムメッセージ */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-4">
          ダッシュボード
        </h1>
        <div className="bg-accent text-sm p-4 rounded-lg text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          認証されたユーザーのみがアクセスできるプロテクトエリアです
        </div>
      </div>

      {/* 機能カード */}
      <div>
        <h2 className="font-bold text-2xl mb-6">利用可能な機能</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/protected/chat"
            className="group flex items-center gap-4 p-6 bg-card border rounded-xl hover:shadow-md transition-all duration-200">
            <div className="bg-primary/10 p-4 rounded-xl group-hover:bg-primary/20 transition-colors">
              <MessageSquare size={28} className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">
                リアルタイムチャット
              </h3>
              <p className="text-sm text-muted-foreground">
                Supabaseを使ったリアルタイムチャットを体験
              </p>
            </div>
          </Link>

          <Link
            href="/protected/profile"
            className="group flex items-center gap-4 p-6 bg-card border rounded-xl hover:shadow-md transition-all duration-200">
            <div className="bg-primary/10 p-4 rounded-xl group-hover:bg-primary/20 transition-colors">
              <User size={28} className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">プロフィール設定</h3>
              <p className="text-sm text-muted-foreground">
                個人情報とアカウント設定を管理
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
