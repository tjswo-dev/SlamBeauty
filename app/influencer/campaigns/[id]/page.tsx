"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, Clock, Users, CheckCircle2, Circle, AlertCircle,
  X, Send, Building2, CalendarDays, CreditCard, Menu,
} from "lucide-react";
import { dummyOpenCampaigns, dummyMyApplications } from "@/lib/dummy-data";
import { useInfluencerAuth } from "@/lib/use-influencer-auth";
import { cn } from "@/lib/utils";

const GOOGLE_SVG = (
  <svg width="18" height="18" viewBox="0 0 18 18" className="shrink-0">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/>
  </svg>
);

function getDDay(deadline: string) {
  const now = new Date("2026-06-16");
  const due = new Date(deadline);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function LoginModal({ onClose, onLogin }: { onClose: () => void; onLogin: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white w-full rounded-t-2xl sm:rounded-2xl sm:max-w-sm shadow-2xl p-6 sm:p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-1">로그인이 필요합니다</h3>
        <p className="text-sm text-slate-500 mb-6">캠페인 신청을 위해 로그인해주세요</p>
        <button onClick={onLogin} className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700 transition-all shadow-sm">
          {GOOGLE_SVG}
          Google로 로그인
        </button>
        <button onClick={onClose} className="w-full mt-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-slate-600 transition-colors">닫기</button>
      </div>
    </div>
  );
}

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isLoggedIn, isProfileComplete, login, mounted } = useInfluencerAuth();
  const campaign = dummyOpenCampaigns.find((c) => c.id === id);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [message, setMessage] = useState("");
  const [secondaryConsent, setSecondaryConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isApplied = submitted || dummyMyApplications.some((a) => a.campaignId === id);

  if (!campaign) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <p className="mb-4">캠페인을 찾을 수 없습니다.</p>
          <button onClick={() => router.back()} className="text-purple-600 text-sm hover:underline">돌아가기</button>
        </div>
      </div>
    );
  }

  const dday = getDDay(campaign.deadline);
  const c = campaign as typeof campaign & { recruitStartDate?: string; shippingDate?: string; desiredConditions?: string[] };

  const handleApplyClick = () => {
    if (!isLoggedIn) { setShowLoginModal(true); return; }
    if (!isProfileComplete) { router.push("/influencer/profile"); return; }
    setShowApplyModal(true);
  };

  const handleApply = () => {
    if (!message.trim()) return;
    setSubmitted(true);
    setShowApplyModal(false);
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Top Nav ────────────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between relative">
          <Link href="/influencer/campaigns" className="text-base sm:text-lg font-bold text-purple-600 shrink-0">SlamBeauty</Link>
          <div className="hidden md:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
            <Link href="/influencer/campaigns" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">캠페인 목록</Link>
            <Link href="/influencer/profile" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">마이페이지</Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              {mounted && isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold">김</div>
                  <span className="text-sm font-medium text-slate-700 hidden lg:block">Kim Soo Yeon</span>
                </div>
              ) : (
                <Link href="/influencer/login" className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold">로그인</Link>
              )}
            </div>
            <button className="md:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setMobileMenuOpen(v => !v)}>
              {mobileMenuOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 px-4 py-3 space-y-1 bg-white">
            <Link href="/influencer/campaigns" onClick={() => setMobileMenuOpen(false)} className="flex px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">캠페인 목록</Link>
            <Link href="/influencer/profile" onClick={() => setMobileMenuOpen(false)} className="flex px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">마이페이지</Link>
          </div>
        )}
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-5 sm:mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          오픈 캠페인 목록
        </button>

        {/* ── Hero card ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-5">
          <div className="h-1.5 sm:h-2 bg-gradient-to-r from-purple-400 to-violet-500" />
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
              {(c as { productImage?: string }).productImage ? (
                <img src={(c as { productImage?: string }).productImage} alt={campaign.productName}
                  className="w-full h-48 sm:w-24 sm:h-24 rounded-xl object-cover sm:shrink-0" />
              ) : (
                <div className="w-full h-32 sm:w-24 sm:h-24 rounded-xl flex items-center justify-center text-white text-xl font-bold sm:shrink-0"
                  style={{ backgroundColor: campaign.brandLogoColor }}>
                  {campaign.brandLogo}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 mb-1">{campaign.brandName} · {campaign.category}</p>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">{campaign.productName}</h1>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {[
                    { label: "지급액", value: `${(campaign.budget / 10000).toFixed(0)}만원`, urgent: false },
                    { label: "모집 인원", value: `${campaign.recruitCount}명`, urgent: false },
                    { label: "지원자", value: `${campaign.currentApplicants}명`, urgent: false },
                    { label: "지원 마감", value: dday <= 0 ? "마감" : `D-${dday}`, urgent: dday <= 3 },
                  ].map((s) => (
                    <div key={s.label} className={cn("rounded-xl px-3 sm:px-4 py-2 text-center", s.urgent ? "bg-red-50" : "bg-slate-50")}>
                      <div className="text-[10px] text-slate-400 mb-0.5">{s.label}</div>
                      <div className={cn("text-sm sm:text-base font-bold", s.urgent ? "text-red-600" : "text-slate-900")}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2-column on desktop, single column on mobile ──────────── */}
        <div className="flex flex-col md:grid md:grid-cols-5 gap-5">
          {/* Main content */}
          <div className="md:col-span-3 space-y-4 sm:space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <h2 className="text-sm font-bold text-slate-800">브랜드 소개</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{campaign.brandDesc}</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
              <h2 className="text-sm font-bold text-slate-800 mb-3">캠페인 소개</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{campaign.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {campaign.platforms.map((p) => (
                  <span key={p} className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg font-medium">{p}</span>
                ))}
                <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg font-medium">타겟 {campaign.targetAge}세</span>
                {campaign.secondaryUse && (
                  <span className="text-xs px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg font-medium border border-amber-100">2차 활용 동의 요청</span>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
              <h2 className="text-sm font-bold text-slate-800 mb-3">콘텐츠 가이드라인</h2>
              <ul className="space-y-2.5">
                {campaign.guidelines.map((g, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">{g}</span>
                  </li>
                ))}
              </ul>
            </div>

            {c.desiredConditions && c.desiredConditions.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-slate-400 shrink-0" />
                  <h2 className="text-sm font-bold text-slate-800">희망 인플루언서 조건</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {c.desiredConditions.map((cond, i) => (
                    <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 font-medium border border-purple-100">{cond}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="md:col-span-2 space-y-4 sm:space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays className="w-4 h-4 text-slate-400 shrink-0" />
                <h2 className="text-sm font-bold text-slate-800">일정</h2>
              </div>
              <div className="space-y-3">
                {[
                  { label: "모집 시작", date: c.recruitStartDate ?? "-", highlight: false },
                  { label: "모집 마감", date: campaign.deadline, highlight: dday <= 3 },
                  { label: "배송 예정일", date: c.shippingDate ?? "-", highlight: false },
                  { label: "콘텐츠 마감", date: campaign.contentDeadline, highlight: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full shrink-0", item.highlight ? "bg-red-400" : "bg-slate-300")} />
                      <span className="text-xs text-slate-500">{item.label}</span>
                    </div>
                    <span className={cn("text-xs font-semibold", item.highlight ? "text-red-600" : "text-slate-700")}>{item.date}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
                <h2 className="text-sm font-bold text-slate-800">지급 정보</h2>
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">캠페인 지급액</span>
                  <span className="font-semibold text-slate-800">{campaign.budget.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">플랫폼 수수료 (10%)</span>
                  <span className="text-slate-500">-{(campaign.budget * 0.1).toLocaleString()}원</span>
                </div>
                <div className="border-t border-slate-100 pt-2.5 flex justify-between text-sm">
                  <span className="font-semibold text-slate-800">실수령액</span>
                  <span className="font-bold text-purple-600">{(campaign.budget * 0.9).toLocaleString()}원</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-slate-400 shrink-0" />
                <h2 className="text-sm font-bold text-slate-800">지원 현황</h2>
              </div>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-2xl font-bold text-slate-900">{campaign.currentApplicants}</span>
                <span className="text-slate-400 text-sm mb-0.5">/ {campaign.recruitCount}명 모집</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", campaign.currentApplicants / campaign.recruitCount >= 2 ? "bg-red-400" : campaign.currentApplicants / campaign.recruitCount >= 1 ? "bg-amber-400" : "bg-emerald-400")}
                  style={{ width: `${Math.min((campaign.currentApplicants / (campaign.recruitCount * 2)) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">경쟁률 {(campaign.currentApplicants / campaign.recruitCount).toFixed(1)}:1</p>
            </div>

            {isApplied ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <div className="text-sm font-semibold text-emerald-700">지원 완료</div>
                <div className="text-xs text-emerald-500 mt-1">브랜드 검토 후 결과를 알려드립니다</div>
              </div>
            ) : (
              <button
                onClick={handleApplyClick}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-bold text-sm transition-all shadow-lg shadow-purple-200 active:scale-[0.98]"
              >
                이 캠페인 지원하기
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Modals ────────────────────────────────────────────────────── */}
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} onLogin={() => { login(); setShowLoginModal(false); }} />}

      {showApplyModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white w-full rounded-t-2xl sm:rounded-2xl sm:max-w-lg shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-bold text-slate-900">캠페인 지원하기</h3>
                <p className="text-xs text-slate-400 mt-0.5">{campaign.brandName} · {campaign.productName}</p>
              </div>
              <button onClick={() => setShowApplyModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-all">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-purple-50 border border-purple-100">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold">김</div>
                <div>
                  <div className="text-sm font-semibold text-purple-700">@sooyeon_beauty</div>
                  <div className="text-xs text-purple-400">Instagram 87,400 · YouTube 12,300</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  브랜드에게 메시지 <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="이 캠페인에 지원하는 이유, 콘텐츠 제작 방향, 자신의 강점 등을 자유롭게 작성해주세요."
                  rows={5}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none leading-relaxed"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-slate-400">최소 30자 이상 권장</span>
                  <span className="text-xs text-slate-400">{message.length}자</span>
                </div>
              </div>

              {campaign.secondaryUse && (
                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-amber-100 bg-amber-50 cursor-pointer" onClick={() => setSecondaryConsent((v) => !v)}>
                  {secondaryConsent ? <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" /> : <Circle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                  <div>
                    <p className="text-xs font-semibold text-amber-700 mb-0.5">2차 활용 동의 (이 캠페인 필수)</p>
                    <p className="text-xs text-amber-600 leading-relaxed">제작한 콘텐츠를 브랜드 광고 소재로 활용하는 데 동의합니다.</p>
                  </div>
                </div>
              )}

              {campaign.secondaryUse && !secondaryConsent && (
                <div className="flex items-center gap-2 text-xs text-amber-600">
                  <AlertCircle className="w-3.5 h-3.5" />
                  2차 활용 동의가 필요한 캠페인입니다
                </div>
              )}
            </div>

            <div className="p-5 pt-0 flex gap-3">
              <button onClick={() => setShowApplyModal(false)} className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">취소</button>
              <button
                onClick={handleApply}
                disabled={!message.trim() || (campaign.secondaryUse && !secondaryConsent)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold transition-all"
              >
                <Send className="w-4 h-4" />
                지원 제출
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
