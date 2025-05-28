import { signOutAction } from "@/lib/auth/actions";
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";

/**
 * ヘッダー認証コンポーネント
 * ユーザーの認証状態に応じてログイン/ログアウトボタンを表示
 */
export default async function HeaderAuth() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ユーザーがログインしている場合、プロフィール情報を取得
  let userName = "";
  if (user) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .single();

    // nameがある場合はそれを使用、ない場合は「ゲスト」という既定の名前を使用
    userName = profileData?.name || "ゲスト";
  }

  return user ? (
    <div className="flex items-center gap-4">
      Hey, {userName}!
      <form action={signOutAction}>
        <Button type="submit" variant={"outline"}>
          Sign out
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/sign-in">ログイン</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/sign-up">新規登録</Link>
      </Button>
    </div>
  );
}
