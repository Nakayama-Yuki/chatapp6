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

  // プロフィールを更新
  const { error } = await supabase
    .from("profiles")
    .update({ name })
    .eq("id", user.id);

  if (error) {
    return { error: "プロフィールの更新に失敗しました" };
  }

  revalidatePath("/protected");
  return { success: true };
}
