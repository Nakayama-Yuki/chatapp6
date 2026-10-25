import { resetPasswordAction } from "@/lib/auth/actions";
import { FormMessage, type Message } from "@/components/form-message";
import SubmitButton from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Suspense } from "react";

type ResetPasswordProps = {
  searchParams: Promise<Message>;
};

/** パスワード再設定画面を表示する。 */
export default function ResetPassword(props: ResetPasswordProps) {
  return (
    <Suspense
      fallback={<div className="w-full max-w-md mx-auto">Loading...</div>}
    >
      <ResetPasswordForm searchParams={props.searchParams} />
    </Suspense>
  );
}

/** URLのメッセージを読み込み、パスワード再設定フォームを表示する。 */
async function ResetPasswordForm({ searchParams }: ResetPasswordProps) {
  const message = await searchParams;
  return (
    <form className="flex flex-col w-full max-w-md p-4 gap-2 [&>input]:mb-4">
      <h1 className="text-2xl font-medium">Reset password</h1>
      <p className="text-sm text-foreground/60">
        Please enter your new password below.
      </p>
      <Label htmlFor="password">New password</Label>
      <Input
        type="password"
        name="password"
        placeholder="New password"
        required
      />
      <Label htmlFor="confirmPassword">Confirm password</Label>
      <Input
        type="password"
        name="confirmPassword"
        placeholder="Confirm password"
        required
      />
      <SubmitButton formAction={resetPasswordAction}>
        Reset password
      </SubmitButton>
      <FormMessage message={message} />
    </form>
  );
}
