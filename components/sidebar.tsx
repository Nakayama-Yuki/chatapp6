"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, User, Menu, X } from "lucide-react";
import { useState } from "react";

// ナビゲーションアイテムの型定義
type NavigationItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
};

/**
 * サイドバーナビゲーションコンポーネント
 * ダッシュボードとチャット画面の切り替えを提供
 */
export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ナビゲーションアイテムの定義
  const navigationItems: NavigationItem[] = [
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
  const isActive = (href: string): boolean => {
    if (href === "/protected") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // モバイルメニューを閉じる
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
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
        aria-label={
          isMobileMenuOpen
            ? "ナビゲーションメニューを閉じる"
            : "ナビゲーションメニューを開く"
        }
        aria-expanded={isMobileMenuOpen}
        aria-controls="sidebar-navigation">
        {isMobileMenuOpen ? (
          <X size={20} aria-hidden="true" />
        ) : (
          <Menu size={20} aria-hidden="true" />
        )}
      </button>

      {/* モバイル用オーバーレイ */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* サイドバー */}
      <aside
        id="sidebar-navigation"
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
        `}
        aria-label="メインナビゲーション">
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
                  onClick={closeMobileMenu}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-lg 
                    transition-all duration-200 group
                    hover:bg-accent hover:text-accent-foreground
                    focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring
                    ${
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-foreground"
                    }
                  `}
                  aria-current={active ? "page" : undefined}>
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
                    aria-hidden="true"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div
                      className={`
                        text-xs
                        ${
                          active
                            ? "text-primary-foreground/90"
                            : "text-muted-foreground/90"
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
