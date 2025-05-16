"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * チャットアプリのナビゲーションコンポーネント
 */
export default function ChatNavigation() {
  const pathname = usePathname();

  // ナビゲーションリンクのアクティブ状態を確認する関数
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  // ナビゲーションリンクのスタイル
  const linkStyle = (path: string) => {
    return `px-4 py-2 rounded-md transition ${
      isActive(path) ? "bg-foreground/10 font-medium" : "hover:bg-foreground/5"
    }`;
  };

  return (
    <nav className="w-full flex items-center justify-between mb-8 gap-4">
      <div className="flex items-center gap-4">
        <Link href="/protected" className={linkStyle("/protected")}>
          ダッシュボード
        </Link>
        <Link href="/protected/chat" className={linkStyle("/protected/chat")}>
          チャット
        </Link>
      </div>
    </nav>
  );
}
