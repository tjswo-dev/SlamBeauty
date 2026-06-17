"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  PlusCircle,
  Megaphone,
  Users,
  Zap,
  LogOut,
  Bell,
  ChevronRight,
  Building2,
  LogIn,
} from "lucide-react";
import { useBrandAuth } from "@/lib/use-brand-auth";

const navGroups = [
  {
    label: "캠페인",
    items: [
      { label: "캠페인 목록", icon: Megaphone, href: "/brand/campaigns" },
      { label: "새 캠페인 등록", icon: PlusCircle, href: "/brand/campaign/new" },
    ],
  },
  {
    label: "매칭",
    items: [
      { label: "인플루언서 추천", icon: Users, href: "/brand/matching" },
    ],
  },
  {
    label: "계정",
    items: [
      { label: "브랜드 설정", icon: Building2, href: "/brand/settings" },
    ],
  },
];

export function BrandSidebar() {
  const pathname = usePathname();
  const { isLoggedIn, user, logout, mounted } = useBrandAuth();

  const displayName = user?.user_metadata?.brand_name
    ?? user?.user_metadata?.full_name
    ?? user?.email?.split("@")[0]
    ?? "브랜드";

  const initial = displayName[0]?.toUpperCase() ?? "B";

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-white border-r border-slate-200 flex flex-col z-40">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 px-6 py-5 border-b border-slate-100 hover:opacity-80 transition-opacity">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-bold text-slate-900">SlamBeauty</span>
      </Link>

      {/* Brand identity */}
      <div className="px-3 mt-4">
        {mounted && isLoggedIn ? (
          <div className="flex items-center gap-2.5 px-3 py-3 rounded-xl bg-indigo-50 border border-indigo-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <div className="text-xs text-indigo-400 font-medium">브랜드 워크스페이스</div>
              <div className="text-sm font-semibold text-indigo-700 truncate">{displayName}</div>
            </div>
          </div>
        ) : (
          <Link
            href="/brand/login"
            className="flex items-center gap-2.5 px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-indigo-50 hover:border-indigo-100 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-slate-400" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-slate-400 font-medium">로그인이 필요합니다</div>
              <div className="text-sm font-semibold text-indigo-600">로그인 →</div>
            </div>
          </Link>
        )}
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <div className="px-3 mb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-4 h-4 shrink-0",
                        isActive ? "text-indigo-600" : "text-slate-400"
                      )}
                    />
                    <span className="flex-1">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Notifications */}
      <div className="px-3 pb-2">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all">
          <Bell className="w-4 h-4 text-slate-400" />
          <span className="flex-1 text-left">알림</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        </button>
      </div>

      {/* Login / Logout */}
      <div className="px-3 pb-4 border-t border-slate-100 pt-3">
        {mounted && isLoggedIn ? (
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </button>
        ) : (
          <Link
            href="/brand/login"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
          >
            <LogIn className="w-4 h-4" />
            로그인
          </Link>
        )}
      </div>
    </aside>
  );
}
