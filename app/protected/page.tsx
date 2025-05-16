import { createClient } from "@/utils/supabase/server";
import { InfoIcon, MessageSquare } from "lucide-react";
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
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated
          user
        </div>
      </div>
      
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Your user details</h2>
        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
      
      <div className="mt-8">
        <h2 className="font-bold text-2xl mb-4">機能</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            href="/protected/chat" 
            className="flex items-center gap-3 p-4 bg-accent rounded-lg hover:bg-accent/80 transition"
          >
            <div className="bg-foreground/10 p-3 rounded-full">
              <MessageSquare size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">リアルタイムチャット</h3>
              <p className="text-sm opacity-70">Supabaseを使ったリアルタイムチャットを試す</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
