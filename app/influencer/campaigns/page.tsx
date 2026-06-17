"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X, Users, Menu, Send, Calendar, Truck, Package, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";

const CATEGORIES = ["전체", "스킨케어", "선케어", "메이크업", "헤어케어", "라이프스타일"];
const GOOGLE_SVG = (
  <svg width="18" height="18" viewBox="0 0 18 18" className="shrink-0">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/>
  </svg>
);

type Campaign = {
  id: string;
  brand_name: string;
  product_name: string;
  product_image_url: string | null;
  category: string;
  guidelines: string[];
  budget_per_influencer: number;
  recruit_count: number;
  recruit_start_date: string;
  recruit_deadline: string;
  selection_deadline: string;
  shipping_date: string;
  content_deadline: string;
  status: string;
};

function getDDay(deadline: string) {
  const now = new Date();
  const due = new Date(deadline);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/* ── Login modal ─────────────────────────────────────────────────────────── */
function LoginModal({ onClose, onLogin }: { onClose: () => void; onLogin: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white w-full rounded-t-2xl sm:rounded-2xl sm:max-w-sm shadow-2xl p-6 sm:p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-1">로그인이 필요합니다</h3>
        <p className="text-sm text-slate-500 mb-6">캠페인 신청을 위해 로그인해주세요</p>
        <button
          onClick={onLogin}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700 transition-all shadow-sm"
        >
          {GOOGLE_SVG}
          Google로 로그인
        </button>
        <button onClick={onClose} className="w-full mt-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-slate-600 transition-colors">
          닫기
        </button>
      </div>
    </div>
  );
}

/* ── Apply modal ─────────────────────────────────────────────────────────── */
function ApplyModal({
  campaign,
  onClose,
  onSubmit,
}: {
  campaign: Campaign;
  onClose: () => void;
  onSubmit: (msg: string) => void;
}) {
  const [message, setMessage] = useState("");

  const canSubmit = message.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white w-full rounded-t-2xl sm:rounded-2xl sm:max-w-lg shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start gap-3 p-5 border-b border-slate-100">
          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-indigo-100 flex items-center justify-center">
            {campaign.product_image_url ? (
              <img src={campaign.product_image_url} alt={campaign.product_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-indigo-600 font-bold text-sm">{campaign.brand_name.slice(0, 1)}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400">{campaign.brand_name}</p>
            <p className="text-sm font-bold text-slate-900 truncate">{campaign.product_name}</p>
            <p className="text-xs text-purple-600 font-medium mt-0.5">{(campaign.budget_per_influencer / 10000).toFixed(0)}만원</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-all shrink-0">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Message */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              브랜드에게 메시지 <span className="text-red-400">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="지원 이유, 콘텐츠 제작 방향, 내 강점 등을 자유롭게 작성해주세요."
              rows={5}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none leading-relaxed"
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-slate-400">최소 30자 이상 권장</span>
              <span className="text-xs text-slate-400">{message.length}자</span>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
            취소
          </button>
          <button
            onClick={() => canSubmit && onSubmit(message)}
            disabled={!canSubmit}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold transition-all"
          >
            <Send className="w-4 h-4" />
            신청하기
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function CampaignsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("전체");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [applyTarget, setApplyTarget] = useState<Campaign | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("campaigns")
        .select("*")
        .eq("status", "recruiting")
        .order("created_at", { ascending: false });
      setCampaigns((data as Campaign[]) ?? []);
      setLoadingCampaigns(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = [...campaigns];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.product_name.toLowerCase().includes(q) || c.brand_name.toLowerCase().includes(q));
    }
    if (category !== "전체") list = list.filter((c) => c.category === category);
    return list;
  }, [search, category, campaigns]);

  const handleApplyClick = (e: React.MouseEvent, campaign: Campaign) => {
    e.stopPropagation();
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setApplyTarget(campaign);
  };

  const handleCardClick = (id: string) => {
    router.push(`/influencer/campaigns/${id}`);
  };

  const handleSubmitApply = async (msg: string) => {
    const supabase = createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) return;
    await (supabase.from("campaign_applications") as ReturnType<typeof supabase.from>).insert({
      campaign_id: applyTarget!.id,
      influencer_id: currentUser.id,
      message: msg,
    });
    setAppliedIds((prev) => new Set([...prev, applyTarget!.id]));
    setApplyTarget(null);
  };

  const handleGoogleLogin = () => {
    const supabase = createClient();
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?role=influencer` },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Top Nav ────────────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between relative">
          {/* Logo */}
          <Link href="/influencer/campaigns" className="text-base sm:text-lg font-bold text-purple-600 shrink-0">
            SlamBeauty
          </Link>

          {/* Center title */}
          <span className="hidden md:block text-sm font-semibold text-slate-700 absolute left-1/2 -translate-x-1/2">
            오픈 캠페인
          </span>

          {/* Right — desktop auth + mobile hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:block">
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold">
                    {(user.email ?? "U").slice(0, 1).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700 hidden lg:block">{user.email}</span>
                </div>
              ) : (
                <Link href="/influencer/login" className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-all">
                  로그인
                </Link>
              )}
            </div>
            <button
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-all"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="메뉴"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
            </button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 px-4 py-3 space-y-1 bg-white">
            <Link href="/influencer/campaigns" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold text-purple-600 bg-purple-50">
              오픈 캠페인
            </Link>
            <Link href="/influencer/active" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">
              진행 중 캠페인
            </Link>
            <Link href="/influencer/settlement" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">
              정산 관리
            </Link>
            <Link href="/influencer/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">
              마이페이지
            </Link>
            {!user && (
              <Link href="/influencer/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">
                {GOOGLE_SVG}
                로그인
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* Guest banner */}
      {!user && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-amber-700">로그인 없이 탐색 중입니다. 신청하려면 로그인하세요.</p>
            <Link href="/influencer/login" className="text-xs sm:text-sm font-semibold text-amber-800 underline whitespace-nowrap">로그인하기</Link>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-5 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">오픈 캠페인 리스트</h1>
          <p className="text-sm text-slate-500 mt-1">나에게 맞는 K-뷰티 캠페인을 찾아 지원하세요</p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="캠페인명, 브랜드명 검색"
            className="w-full pl-9 pr-10 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>

        {/* Category chips */}
        <div className="flex gap-2 mb-5 sm:mb-6 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap scrollbar-none">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0",
                category === c ? "bg-purple-600 text-white shadow-sm shadow-purple-200" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {loadingCampaigns ? (
          <div className="py-20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          </div>
        ) : (
          <>
            <div className="text-sm text-slate-500 mb-4">
              <span className="font-semibold text-slate-800">{filtered.length}개</span>의 캠페인
            </div>

            {/* Campaign list */}
            <div className="space-y-4 sm:space-y-5">
              {filtered.length === 0 ? (
                <div className="py-16 sm:py-20 text-center text-slate-400">
                  <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">조건에 맞는 캠페인이 없습니다</p>
                </div>
              ) : (
                filtered.map((campaign) => {
                  const dday = getDDay(campaign.recruit_deadline);
                  const isApplied = appliedIds.has(campaign.id);
                  return (
                    <div
                      key={campaign.id}
                      onClick={() => handleCardClick(campaign.id)}
                      className="bg-white rounded-2xl border border-slate-200 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-50 transition-all cursor-pointer overflow-hidden"
                    >
                      <div className="p-4 sm:p-5">
                        <div className="flex gap-4 sm:gap-5 items-start">

                          {/* 맨 왼쪽: 제품 사진 */}
                          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0">
                            {campaign.product_image_url ? (
                              <img
                                src={campaign.product_image_url}
                                alt={campaign.product_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-xl font-bold">
                                {campaign.brand_name.slice(0, 1)}
                              </div>
                            )}
                          </div>

                          {/* 오른쪽: 정보 */}
                          <div className="flex-1 min-w-0">

                            {/* 브랜드명 + 제품명 */}
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              <h2 className="text-lg sm:text-xl font-bold text-slate-900">{campaign.brand_name}</h2>
                              {isApplied && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium">지원 완료</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-sm font-semibold text-slate-500">{campaign.product_name}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 font-medium">{campaign.category}</span>
                              <span className={cn("text-xs font-bold ml-auto", dday <= 3 ? "text-red-600" : dday <= 7 ? "text-amber-600" : "text-emerald-600")}>
                                {dday <= 0 ? "마감" : `D-${dday}`}
                              </span>
                            </div>

                            {/* 핵심 날짜 */}
                            <div className="grid grid-cols-3 gap-2 mb-3">
                              <div className="bg-slate-50 rounded-lg px-2.5 py-2">
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium mb-0.5">
                                  <Calendar className="w-2.5 h-2.5" />모집 기간
                                </div>
                                <div className="text-[11px] font-semibold text-slate-800 leading-tight">
                                  {campaign.recruit_start_date} ~<br className="hidden sm:block" /> {campaign.recruit_deadline}
                                </div>
                              </div>
                              <div className="bg-slate-50 rounded-lg px-2.5 py-2">
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium mb-0.5">
                                  <Truck className="w-2.5 h-2.5" />배송 예정일
                                </div>
                                <div className="text-[11px] font-semibold text-slate-800">{campaign.shipping_date}</div>
                              </div>
                              <div className="bg-slate-50 rounded-lg px-2.5 py-2">
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium mb-0.5">
                                  <Package className="w-2.5 h-2.5" />콘텐츠 마감
                                </div>
                                <div className="text-[11px] font-semibold text-slate-800">{campaign.content_deadline}</div>
                              </div>
                            </div>

                            {/* 콘텐츠 가이드라인 */}
                            <div className="mb-3.5">
                              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">콘텐츠 가이드라인</p>
                              <ul className="space-y-1">
                                {(campaign.guidelines ?? []).slice(0, 3).map((g, i) => (
                                  <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                                    <span className="text-purple-400 shrink-0 mt-0.5">•</span>
                                    <span className="line-clamp-1">{g}</span>
                                  </li>
                                ))}
                                {(campaign.guidelines ?? []).length > 3 && (
                                  <li className="text-xs text-slate-400">+{campaign.guidelines.length - 3}개 더</li>
                                )}
                              </ul>
                            </div>

                            {/* 하단 */}
                            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                              <div className="flex items-center gap-3 text-xs text-slate-500">
                                <div className="flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5" />
                                  <span className="font-semibold text-slate-700">{campaign.recruit_count}명</span>
                                </div>
                                <span className="font-bold text-slate-800 text-sm">{(campaign.budget_per_influencer / 10000).toFixed(0)}만원</span>
                              </div>
                              {isApplied ? (
                                <span className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-sm font-semibold">지원 완료</span>
                              ) : (
                                <button
                                  onClick={(e) => handleApplyClick(e, campaign)}
                                  className="px-4 sm:px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-sm font-semibold transition-all"
                                >
                                  신청하기
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {applyTarget && (
        <ApplyModal campaign={applyTarget} onClose={() => setApplyTarget(null)} onSubmit={handleSubmitApply} />
      )}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLogin={() => {
            setShowLoginModal(false);
            handleGoogleLogin();
          }}
        />
      )}
    </div>
  );
}
