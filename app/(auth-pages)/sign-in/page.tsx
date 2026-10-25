import { signInAction } from "@/lib/auth/actions";
import { FormMessage, type Message } from "@/components/form-message";
import SubmitButton from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Suspense } from "react";

type LoginProps = {
  searchParams: Promise<Message>;
};

/** ログイン画面を表示する。 */
export default function Login(props: LoginProps) {
  return (
    <Suspense
      fallback={<div className="w-full max-w-md mx-auto">読み込み中...</div>}
    >
      <LoginForm searchParams={props.searchParams} />
    </Suspense>
  );
}

/** URLのメッセージを読み込み、ログインフォームを表示する。 */
async function LoginForm({ searchParams }: LoginProps) {
  const message = await searchParams;
  return (
    <form className="flex-1 flex flex-col min-w-64 max-w-md w-full mx-auto">
      <h1 className="text-2xl font-medium">ログイン</h1>
      <p className="text-sm text-foreground">
        Don't have an account?{" "}
        <Link className="text-foreground font-medium underline" href="/sign-up">
          新規登録
        </Link>
      </p>
      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        <Label htmlFor="email">Email</Label>
        <Input name="email" placeholder="you@example.com" required />
        <div className="flex justify-between items-center">
          <Label htmlFor="password">Password</Label>
          <Link
            className="text-xs text-foreground underline"
            href="/forgot-password">
            パスワードを忘れましたか?
          </Link>
        </div>
        <Input
          type="password"
          name="password"
          placeholder="Your password"
          required
        />
        <SubmitButton pendingText="Signing In..." formAction={signInAction}>
          ログイン
        </SubmitButton>
        <FormMessage message={message} />
      </div>
    </form>
  );
}
