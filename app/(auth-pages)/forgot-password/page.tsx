import { forgotPasswordAction } from "@/lib/auth/actions";
import { FormMessage, type Message } from "@/components/form-message";
import SubmitButton from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";

export default async function ForgotPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <>
      <form className="flex-1 flex flex-col w-full gap-2 text-foreground [&>input]:mb-6 min-w-64 max-w-md mx-auto">
        <div>
          <h1 className="text-2xl font-medium">パスワードをリセット</h1>
          <p className="text-sm text-secondary-foreground">
            Already have an account?{" "}
            <Link className="text-primary underline" href="/sign-in">
              ログイン
            </Link>
          </p>
        </div>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label htmlFor="email">Email</Label>
          <Input name="email" placeholder="you@example.com" required />
          <SubmitButton formAction={forgotPasswordAction}>
            パスワードをリセット
          </SubmitButton>
          <FormMessage message={searchParams} />
        </div>
      </form>
      <div className="max-w-md w-full mx-auto mt-4">
        <SmtpMessage />
      </div>
    </>
  );
}
