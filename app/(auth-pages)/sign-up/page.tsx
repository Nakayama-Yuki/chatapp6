import { signUpAction } from "@/lib/auth/actions";
import { FormMessage, type Message } from "@/components/form-message";
import SubmitButton from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import { Suspense } from "react";

type SignupProps = {
  searchParams: Promise<Message>;
};

/** 新規登録画面を表示する。 */
export default function Signup(props: SignupProps) {
  return (
    <Suspense
      fallback={<div className="w-full max-w-md mx-auto">読み込み中...</div>}
    >
      <SignupForm searchParams={props.searchParams} />
    </Suspense>
  );
}

/** URLのメッセージを読み込み、新規登録フォームを表示する。 */
async function SignupForm({ searchParams }: SignupProps) {
  const message = await searchParams;
  if ("message" in message) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={message} />
      </div>
    );
  }

  return (
    <>
      <form className="flex flex-col min-w-64 max-w-md w-full mx-auto">
        <h1 className="text-2xl font-medium">新規登録</h1>
        <p className="text-sm text text-foreground">
          既にアカウントをお持ちですか?{" "}
          <Link className="text-primary font-medium underline" href="/sign-in">
            ログイン
          </Link>
        </p>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          {/* 名前入力欄 */}
          <Label htmlFor="name">名前</Label>
          <Input name="name" placeholder="あなたの名前" />
          <Label htmlFor="email">Email</Label>
          <Input name="email" placeholder="you@example.com" required />
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            name="password"
            placeholder="Your password"
            minLength={6}
            required
          />
          <SubmitButton formAction={signUpAction} pendingText="Signing up...">
            新規登録
          </SubmitButton>
          <FormMessage message={message} />
        </div>
      </form>
      <div className="max-w-md w-full mx-auto mt-4">
        <SmtpMessage />
      </div>
    </>
  );
}
