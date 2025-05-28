"use client";

import { Button } from "@/components/ui/button";
import { type ComponentProps } from "react";
import { useFormStatus } from "react-dom";

// Props型定義
type SubmitButtonProps = ComponentProps<typeof Button> & {
  pendingText?: string;
};

/**
 * サブミットボタンコンポーネント
 * フォームの送信状態に応じて表示とdisable状態を切り替える
 *
 * @param children ボタンの子要素
 * @param pendingText 送信中に表示するテキスト
 * @param props その他のButton props
 */
export default function SubmitButton({
  children,
  pendingText = "送信中...",
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" aria-disabled={pending} disabled={pending} {...props}>
      {pending ? pendingText : children}
    </Button>
  );
}
