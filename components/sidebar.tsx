"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, User, Menu, X } from "lucide-react";
import { useState } from "react";

/**
 * サイドバーナビゲーションコンポーネント
 * ダッシュボードとチャット画面の切り替えを提供
 */
export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ナビゲーションアイテム
  const navigationItems = [
    {
      label: "ダッシュボード",
      href: "/protected",
      icon: Home,
      description: "メインダッシュボード",
    },
    {
      label: "チャット",
      href: "/protected/chat",
      icon: MessageSquare,
      description: "リアルタイムチャット",
    },
    {
      label: "プロフィール",
      href: "/protected/profile",
      icon: User,
      description: "プロフィール設定",
    },
  ];

  // リンクがアクティブかどうかを判定
  const isActive = (href: string) => {
    if (href === "/protected") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // モバイルメニューの切り替え
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* モバイル用メニューボタン */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-background border rounded-md shadow-md"
        onClick={toggleMobileMenu}
        aria-label="メニューを開く">
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* モバイル用オーバーレイ */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* サイドバー */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-background border-r shadow-lg lg:shadow-none
          transform transition-transform duration-300 ease-in-out
          ${
            isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
          flex flex-col
        `}>
        {/* ナビゲーションメニュー */}
        <nav className="flex-1 px-4 pb-4">
          <div className="pt-20 lg:pt-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                  flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                  hover:bg-accent hover:text-accent-foreground
                  ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground"
                  }
                  group
                `}>
                  <Icon
                    size={20}
                    className={`
                    ${
                      active
                        ? "text-primary-foreground"
                        : "text-muted-foreground"
                    }
                    group-hover:text-accent-foreground
                  `}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div
                      className={`
                      text-xs opacity-70
                      ${
                        active
                          ? "text-primary-foreground"
                          : "text-muted-foreground"
                      }
                      group-hover:text-accent-foreground
                    `}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}
