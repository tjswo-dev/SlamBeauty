"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Megaphone,
  Package,
  CreditCard,
  User,
  Zap,
  LogOut,
  Bell,
  ChevronRight,
  X,
  Lock,
} from "lucide-react";
import { dummyMyActiveCampaigns } from "@/lib/dummy-data";
import { useInfluencerAuth } from "@/lib/use-influencer-auth";

const GOOGLE_SVG = (
  <svg width="18" height="18" viewBox="0 0 18 18" className="shrink-0">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/>
  </svg>
);

const navGroups = [
  {
    label: "캠페인",
    items: [
      { label: "오픈 캠페인", icon: Megaphone, href: "/influencer/campaigns", protected: false },
      { label: "진행 중 캠페인", icon: Package, href: "/influencer/active", protected: true },
    ],
  },
  {
    label: "수익",
    items: [
      { label: "정산 관리", icon: CreditCard, href: "/influencer/settlement", protected: true },
    ],
  },
  {
    label: "프로필",
    items: [
      { label: "내 프로필", icon: User, href: "/influencer/profile", protected: true },
    ],
  },
];

const urgentCount = dummyMyActiveCampaigns.filter(
  (c) => c.status === "uploading" || c.status === "revision"
).length;

export function InfluencerSidebar() {
  const pathname = usePathname();
  const { isLoggedIn, user, login, logout } = useInfluencerAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLogin = async () => {
    await login();
  };

  return (
    <>
      <aside className="fixed left-0 top-0 h-full w-60 bg-white border-r border-slate-200 flex flex-col z-40">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 px-6 py-5 border-b border-slate-100 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900">SlamBeauty</span>
        </Link>

        {/* Identity / login CTA */}
        <div className="px-3 mt-4">
          {isLoggedIn ? (
            <div className="flex items-center gap-2.5 px-3 py-3 rounded-xl bg-purple-50 border border-purple-100">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {user?.user_metadata?.full_name?.[0] ?? user?.email?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0">
                <div className="text-xs text-purple-400 font-medium">인플루언서</div>
                <div className="text-sm font-semibold text-purple-700 truncate">
                  {user?.user_metadata?.full_name ?? user?.email ?? ""}
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="w-full flex items-center gap-2.5 px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-purple-50 hover:border-purple-100 transition-all text-left"
            >
              <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-slate-400" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-slate-400 font-medium">로그인이 필요합니다</div>
                <div className="text-sm font-semibold text-purple-600">Google로 로그인 →</div>
              </div>
            </button>
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
                  const isActive =
                    pathname === item.href || pathname.startsWith(item.href);
                  const needsLogin = item.protected && !isLoggedIn;

                  const cls = cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-purple-50 text-purple-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  );

                  const inner = (
                    <>
                      <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-purple-600" : needsLogin ? "text-slate-300" : "text-slate-400")} />
                      <span className={cn("flex-1 text-left", needsLogin && "text-slate-400")}>{item.label}</span>
                      {item.label === "진행 중 캠페인" && !needsLogin && urgentCount > 0 && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${isActive ? "bg-purple-200 text-purple-700" : "bg-amber-100 text-amber-700"}`}>
                          {urgentCount}
                        </span>
                      )}
                      {item.label === "오픈 캠페인" && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${isActive ? "bg-purple-200 text-purple-700" : "bg-indigo-100 text-indigo-600"}`}>
                          5
                        </span>
                      )}
                      {needsLogin && <Lock className="w-3 h-3 text-slate-300 shrink-0" />}
                    </>
                  );

                  return needsLogin ? (
                    <button key={item.label} onClick={() => setShowLoginModal(true)} className={cls}>
                      {inner}
                    </button>
                  ) : (
                    <Link key={item.label} href={item.href} className={cls}>
                      {inner}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Notifications */}
        <div className="px-3 pb-2">
          <button
            onClick={() => !isLoggedIn && setShowLoginModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
          >
            <div className="relative">
              <Bell className="w-4 h-4 text-slate-400" />
              {isLoggedIn && urgentCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </div>
            <span className="flex-1">알림</span>
            {isLoggedIn && urgentCount > 0 && (
              <span className="text-xs bg-red-100 text-red-600 font-semibold px-1.5 py-0.5 rounded-full">
                {urgentCount}
              </span>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          </button>
        </div>

        {/* Logout / home */}
        <div className="px-3 pb-4 border-t border-slate-100 pt-3">
          {isLoggedIn ? (
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
            >
              <LogOut className="w-4 h-4" />
              홈으로
            </Link>
          )}
        </div>
      </aside>

      {/* Login modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white w-full rounded-t-2xl sm:rounded-2xl sm:max-w-sm shadow-2xl p-6 sm:p-8">
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-xl font-bold text-slate-900">로그인이 필요합니다</h3>
              <button onClick={() => setShowLoginModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-all">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-6">해당 기능을 사용하려면 로그인해주세요</p>
            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700 transition-all shadow-sm"
            >
              {GOOGLE_SVG}
              Google로 로그인
            </button>
            <button onClick={() => setShowLoginModal(false)} className="w-full mt-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-slate-600 transition-colors">
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  );
}
