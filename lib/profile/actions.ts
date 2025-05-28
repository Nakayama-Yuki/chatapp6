"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// アクションの状態を表す型定義
export type ActionState = {
  error?: string;
  success?: boolean;
} | null;

/**
 * ユーザープロフィールを更新する関数（useActionState用）
 * @param prevState 前の状態
 * @param formData フォームデータ
 */
export async function updateUserProfileAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  // フォームデータから名前を取得
  const name = formData.get("name") as string;

  if (!name || name.trim() === "") {
    return { error: "ユーザー名を入力してください" };
  }

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
    .update({ name: name.trim() })
    .eq("id", user.id)
    .select();

  if (error) {
    return { error: "プロフィールの更新に失敗しました" };
  }

  revalidatePath("/protected");
  return { success: true };
}

/**
 * レガシー関数（既存のコードとの互換性のため保持）
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
    .eq("id", user.id)
    .select();

  if (error) {
    return { error: "プロフィールの更新に失敗しました" };
  }

  revalidatePath("/protected");
  return { success: true };
}
