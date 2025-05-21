"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * ユーザープロフィールを更新する関数
 * @param name ユーザー名
 */
export async function updateUserProfile(name: string) {
  const supabase = await createClient();

  // 現在のユーザーを取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "認証されていません" };
  }

  console.log("更新するユーザー:", user.id, "ユーザー名:", name);

  // プロフィールを更新
  const { error, data } = await supabase
    .from("profiles")
    .update({ name })
    .eq("id", user.id)
    .select();

  if (error) {
    console.error("プロフィール更新エラー:", error);
    return { error: "プロフィールの更新に失敗しました" };
  }

  console.log("更新結果:", data);

  revalidatePath("/protected");
  return { success: true };
}
