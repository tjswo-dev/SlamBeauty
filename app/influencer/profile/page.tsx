"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check, ChevronDown, ChevronRight, X, Menu, Package,
  Truck, AlertTriangle, Eye, RotateCcw, CheckCircle2,
  ExternalLink, Send, Clock,
} from "lucide-react";
import {
  myProfile,
  dummyMyApplications,
  dummyMyActiveCampaigns,
  type MyCampaign,
} from "@/lib/dummy-data";
import { useInfluencerAuth } from "@/lib/use-influencer-auth";
import { cn } from "@/lib/utils";

type NavItem = "profile" | "applications" | "active" | "completed";

/* ── Progress stepper ──────────────────────────────────────────────────── */
const STEPS = ["신청", "승인", "배송", "수령", "업로드", "검수", "완료"];
const STATUS_STEP: Record<string, number> = {
  approved: 1, shipped: 2, received: 3,
  uploading: 4, submitted: 5, revision: 4,
  approved_final: 6, settled: 6,
};

function ProgressStepper({ status }: { status: string }) {
  const current = STATUS_STEP[status] ?? 0;
  return (
    <div className="flex items-start w-full mt-4 overflow-x-auto pb-1">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center" style={{ flex: i < STEPS.length - 1 ? "1 1 0" : "0 0 auto" }}>
          <div className="flex flex-col items-center shrink-0">
            <div className={cn(
              "w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all",
              i < current ? "bg-purple-600 text-white" :
              i === current ? "bg-white ring-2 ring-purple-400 text-purple-600" :
              "bg-slate-100 text-slate-400"
            )}>
              {i < current ? "✓" : i + 1}
            </div>
            <div className={cn("text-[9px] sm:text-[10px] mt-1 font-medium whitespace-nowrap", i <= current ? "text-purple-600" : "text-slate-400")}>
              {step}
            </div>
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn("h-0.5 flex-1 min-w-[16px] -mt-3.5", i < current ? "bg-purple-400" : "bg-slate-200")} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Status alert + actions ────────────────────────────────────────────── */
function StatusAlert({ campaign }: { campaign: MyCampaign }) {
  const [linkInput, setLinkInput] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const dday = Math.ceil(
    (new Date(campaign.contentDeadline).getTime() - new Date("2026-06-16").getTime()) / (1000 * 60 * 60 * 24)
  );

  if (campaign.status === "approved") {
    return (
      <div className="mt-4 p-3.5 rounded-xl bg-indigo-50 border border-indigo-200">
        <div className="flex items-start gap-2.5">
          <Package className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-indigo-700">캠페인 승인됐습니다!</p>
            <p className="text-xs text-indigo-500 mt-0.5">브랜드에서 제품을 준비 중입니다. 곧 배송 정보가 전달됩니다.</p>
          </div>
        </div>
      </div>
    );
  }

  if (campaign.status === "shipped") {
    return (
      <div className="mt-4 p-3.5 rounded-xl bg-blue-50 border border-blue-200">
        <div className="flex items-start gap-2.5">
          <Truck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-700">제품이 배송 중입니다</p>
            <p className="text-xs text-blue-500 mt-0.5">
              {campaign.courier} · 운송장 번호: <span className="font-bold tracking-wide">{campaign.trackingNumber}</span>
            </p>
          </div>
          <a
            href={`https://www.cjlogistics.com/ko/tool/parcel/tracking?gnbInvcNo=${campaign.trackingNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-xs px-2.5 py-1 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            조회
          </a>
        </div>
      </div>
    );
  }

  if (campaign.status === "received") {
    return (
      <div className="mt-4 p-3.5 rounded-xl bg-teal-50 border border-teal-200">
        <div className="flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-teal-700">제품 수령 완료</p>
            <p className="text-xs text-teal-500 mt-0.5">제품을 활용해 콘텐츠를 제작해주세요. 콘텐츠 마감 D-{dday}</p>
          </div>
        </div>
      </div>
    );
  }

  if (campaign.status === "uploading") {
    return (
      <div className="mt-4 space-y-3">
        <div className={cn("p-3.5 rounded-xl border", dday <= 3 ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200")}>
          <div className="flex items-start gap-2.5">
            <AlertTriangle className={cn("w-4 h-4 shrink-0 mt-0.5", dday <= 3 ? "text-red-500" : "text-amber-500")} />
            <div>
              <p className={cn("text-sm font-semibold", dday <= 3 ? "text-red-700" : "text-amber-700")}>
                콘텐츠 업로드 마감 D-{dday}
              </p>
              <p className={cn("text-xs mt-0.5", dday <= 3 ? "text-red-500" : "text-amber-500")}>
                {campaign.contentDeadline}까지 콘텐츠 링크를 제출해주세요
              </p>
            </div>
          </div>
        </div>
        {!submitted ? (
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2.5">
            <p className="text-xs font-semibold text-slate-700">콘텐츠 링크 제출</p>
            <div className="flex gap-2">
              <input
                type="url"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder="https://instagram.com/p/..."
                className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              <button
                onClick={() => linkInput && setSubmitted(true)}
                disabled={!linkInput}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                제출
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <p className="text-sm font-semibold text-emerald-700">링크 제출 완료! 브랜드 검수 중입니다.</p>
          </div>
        )}
      </div>
    );
  }

  if (campaign.status === "revision") {
    return (
      <div className="mt-4 space-y-3">
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200">
          <div className="flex items-start gap-2.5">
            <RotateCcw className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">수정 요청이 왔습니다</p>
              {campaign.revisionNote && (
                <p className="text-xs text-red-600 mt-1 leading-relaxed">
                  "{campaign.revisionNote}"
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2.5">
          <p className="text-xs font-semibold text-slate-700">수정 후 재제출</p>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://instagram.com/p/..."
              className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <button className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-all">
              <Send className="w-3.5 h-3.5" />
              재제출
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (campaign.status === "submitted") {
    return (
      <div className="mt-4 p-3.5 rounded-xl bg-violet-50 border border-violet-200">
        <div className="flex items-start gap-2.5">
          <Eye className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-violet-700">브랜드 검수 중</p>
            <p className="text-xs text-violet-500 mt-0.5">제출된 콘텐츠를 브랜드가 검토하고 있습니다.</p>
            {campaign.submittedLink && (
              <a href={campaign.submittedLink} target="_blank" rel="noopener noreferrer" className="mt-1.5 inline-flex items-center gap-1 text-xs text-violet-600 font-medium hover:underline">
                <ExternalLink className="w-3 h-3" /> 제출 링크 확인
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

/* ── Campaign list cards ───────────────────────────────────────────────── */
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:       { label: "대기중",    color: "bg-amber-50 text-amber-600" },
  approved:      { label: "승인",      color: "bg-emerald-50 text-emerald-600" },
  rejected:      { label: "미선정",    color: "bg-slate-100 text-slate-500" },
  approved_final:{ label: "최종 승인", color: "bg-emerald-50 text-emerald-600" },
  settled:       { label: "정산 완료", color: "bg-purple-50 text-purple-600" },
  shipped:       { label: "배송 중",   color: "bg-blue-50 text-blue-600" },
  received:      { label: "수령 완료", color: "bg-teal-50 text-teal-600" },
  uploading:     { label: "업로드 대기",color: "bg-amber-50 text-amber-600" },
  submitted:     { label: "검수 중",   color: "bg-violet-50 text-violet-600" },
  revision:      { label: "수정 요청", color: "bg-red-50 text-red-500" },
};

function BrandBadge({ logo, color }: { logo: string; color: string }) {
  return (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: color }}>
      {logo}
    </div>
  );
}

/* ── Main page component ───────────────────────────────────────────────── */
export default function ProfilePage() {
  const router = useRouter();
  const { isLoggedIn, isProfileComplete, saveProfile, logout, mounted } = useInfluencerAuth();
  const [selectedNav, setSelectedNav] = useState<NavItem>("profile");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: myProfile.name,
    phone: "010-1234-5678",
    email: "",
    address: myProfile.address,
    postcode: "06035",
    instagram: myProfile.platforms.find((p) => p.name === "Instagram")?.url ?? "",
    tiktok: "",
    followers: String(myProfile.platforms.find((p) => p.name === "Instagram")?.followers ?? ""),
    paypal: "",
  });

  const activeCampaigns = dummyMyActiveCampaigns.filter(
    (c) => c.status !== "approved_final" && c.status !== "settled"
  );
  const completedCampaigns = dummyMyActiveCampaigns.filter(
    (c) => c.status === "approved_final" || c.status === "settled"
  );

  const handleSave = () => {
    saveProfile();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const setNavAndScroll = (nav: NavItem) => {
    setSelectedNav(nav);
    setMobileMenuOpen(false);
    if (!historyOpen && ["applications", "active", "completed"].includes(nav)) setHistoryOpen(true);
  };

  // ── Not logged in ──────────────────────────────────────────────────────
  if (mounted && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <nav className="bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
            <Link href="/influencer/campaigns" className="text-base sm:text-lg font-bold text-purple-600">SlamBeauty</Link>
            <Link href="/influencer/login" className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold">로그인</Link>
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-slate-500 mb-4">마이페이지를 보려면 로그인이 필요합니다</p>
            <Link href="/influencer/login" className="px-6 py-3 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-all">
              로그인하기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Tab labels for mobile ──────────────────────────────────────────────
  const mobileNavTabs: { key: NavItem; label: string }[] = [
    { key: "profile", label: "본인 정보" },
    { key: "applications", label: "신청한 캠페인" },
    { key: "active", label: "진행중" },
    { key: "completed", label: "완료된 캠페인" },
  ];

  // ── Content renderer ───────────────────────────────────────────────────
  function Content() {
    if (selectedNav === "profile") {
      return (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6">
          <div className="mb-5 sm:mb-6">
            <h2 className="text-lg font-bold text-slate-900">본인 정보 등록</h2>
            <p className="text-sm text-slate-500 mt-0.5">캠페인 신청 및 제품 수령에 필요한 정보를 입력하세요</p>
          </div>

          {!isProfileComplete && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-700 font-medium">
                ⚠️ 본인 정보를 저장해야 캠페인 신청이 가능합니다
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">이름</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">전화번호</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="010-0000-0000"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">이메일</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="example@email.com"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">주소</label>
                <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="도로명 주소 입력"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">우편번호</label>
                <input type="text" value={form.postcode} onChange={(e) => setForm({ ...form, postcode: e.target.value })}
                  placeholder="00000"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Instagram 링크</label>
              <input type="url" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                placeholder="https://instagram.com/username"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">TikTok 링크</label>
                <input type="url" value={form.tiktok} onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
                  placeholder="https://tiktok.com/@username"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">팔로워 수 (Instagram 기준)</label>
                <input type="number" value={form.followers} onChange={(e) => setForm({ ...form, followers: e.target.value })}
                  placeholder="예: 50000"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
              </div>
            </div>

            {/* 정산계좌 — PayPal */}
            <div className="pt-2 border-t border-slate-100">
              <div className="mb-3">
                <h3 className="text-sm font-bold text-slate-800">정산 계좌</h3>
                <p className="text-xs text-slate-400 mt-0.5">정산은 PayPal로 진행됩니다</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">PayPal 이메일</label>
                <input type="email" value={form.paypal} onChange={(e) => setForm({ ...form, paypal: e.target.value })}
                  placeholder="paypal@example.com"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
              </div>
            </div>

            <div className="pt-2">
              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-all active:scale-[0.98]">
                {saved ? <><Check className="w-4 h-4" /> 저장됨</> : "저장하기"}
              </button>
              {isProfileComplete && (
                <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> 정보가 저장됐습니다. 캠페인 신청이 가능합니다.
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (selectedNav === "applications") {
      return (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 mb-4">신청한 캠페인</h2>
          {dummyMyApplications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400">
              <p className="text-sm">신청한 캠페인이 없습니다</p>
            </div>
          ) : (
            dummyMyApplications.map((app) => {
              const info = STATUS_LABELS[app.status] ?? { label: app.status, color: "bg-slate-100 text-slate-500" };
              return (
                <div key={app.id} className={cn("bg-white rounded-2xl border p-4 sm:p-5 transition-all", app.status === "approved" ? "border-emerald-200" : app.status === "rejected" ? "border-slate-200 opacity-60" : "border-slate-200")}>
                  <div className="flex items-start gap-3">
                    <BrandBadge logo={app.brandLogo} color={app.brandLogoColor} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <p className="text-sm font-bold text-slate-900 truncate">{app.productName}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{app.brandName} · 신청일 {app.appliedAt}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", info.color)}>{info.label}</span>
                          <span className="text-sm font-bold text-purple-600">{(app.budget / 10000).toFixed(0)}만원</span>
                        </div>
                      </div>
                      {app.status === "approved" && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          승인됐습니다! 제품 배송을 준비 중입니다.
                        </div>
                      )}
                      {app.status === "rejected" && (
                        <p className="mt-2 text-xs text-slate-400">이번에는 선정되지 않았습니다. 다른 캠페인을 신청해보세요.</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      );
    }

    if (selectedNav === "active") {
      return (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 mb-4">진행중인 캠페인</h2>
          {activeCampaigns.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400">
              <p className="text-sm">진행중인 캠페인이 없습니다</p>
            </div>
          ) : (
            activeCampaigns.map((camp) => {
              const info = STATUS_LABELS[camp.status] ?? { label: camp.status, color: "bg-slate-100 text-slate-500" };
              const dday = Math.ceil(
                (new Date(camp.contentDeadline).getTime() - new Date("2026-06-16").getTime()) / (1000 * 60 * 60 * 24)
              );
              return (
                <div key={camp.id} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <BrandBadge logo={camp.brandLogo} color={camp.brandLogoColor} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{camp.productName}</p>
                          <p className="text-xs text-slate-400">{camp.brandName} · {camp.category}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", info.color)}>{info.label}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span className={cn("font-semibold", dday <= 5 ? "text-red-600" : "text-slate-600")}>콘텐츠 마감 D-{dday}</span>
                        </div>
                        <span className="font-bold text-purple-600">{(camp.payment / 10000).toFixed(0)}만원</span>
                      </div>
                      <ProgressStepper status={camp.status} />
                      <StatusAlert campaign={camp} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      );
    }

    if (selectedNav === "completed") {
      return (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 mb-4">진행완료된 캠페인</h2>
          {completedCampaigns.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400">
              <p className="text-sm">완료된 캠페인이 없습니다</p>
            </div>
          ) : (
            completedCampaigns.map((camp) => (
              <div key={camp.id} className="bg-white rounded-2xl border border-emerald-100 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <BrandBadge logo={camp.brandLogo} color={camp.brandLogoColor} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{camp.productName}</p>
                        <p className="text-xs text-slate-400">{camp.brandName} · {camp.category}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-50 text-emerald-600">
                          {camp.status === "settled" ? "정산 완료" : "최종 승인"}
                        </span>
                        <span className="text-sm font-bold text-purple-600">{(camp.payment / 10000).toFixed(0)}만원</span>
                      </div>
                    </div>
                    {camp.submittedLink && (
                      <a href={camp.submittedLink} target="_blank" rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors">
                        <ExternalLink className="w-3 h-3" />
                        제출 콘텐츠 보기
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      );
    }

    return null;
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Top Nav ──────────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between relative">
          <Link href="/influencer/campaigns" className="text-base sm:text-lg font-bold text-purple-600 shrink-0">SlamBeauty</Link>
          <div className="hidden md:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
            <Link href="/influencer/campaigns" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">캠페인 목록</Link>
            <Link href="/influencer/profile" className="text-sm font-semibold text-purple-600 border-b-2 border-purple-600 pb-0.5">마이페이지</Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold">김</div>
                <span className="text-sm font-medium text-slate-700 hidden lg:block">Kim Soo Yeon</span>
              </div>
              <button onClick={() => { logout(); router.push("/influencer/campaigns"); }} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">로그아웃</button>
            </div>
            <button className="md:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setMobileMenuOpen(v => !v)}>
              {mobileMenuOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 px-4 py-3 space-y-1 bg-white">
            <Link href="/influencer/campaigns" onClick={() => setMobileMenuOpen(false)} className="flex px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">캠페인 목록</Link>
            <button onClick={() => { logout(); router.push("/influencer/campaigns"); }} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50">로그아웃</button>
          </div>
        )}
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* ── Mobile: horizontal scrollable tabs ────────────────────── */}
        <div className="flex md:hidden gap-2 overflow-x-auto pb-3 mb-5 -mx-4 px-4 scrollbar-none border-b border-slate-200">
          {mobileNavTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setNavAndScroll(tab.key)}
              className={cn(
                "shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                selectedNav === tab.key ? "bg-purple-600 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex gap-6">
          {/* ── Desktop sidebar ───────────────────────────────────────── */}
          <aside className="hidden md:block w-60 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden sticky top-24">
              {/* User mini card */}
              <div className="p-4 sm:p-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center text-white text-base font-bold shrink-0">김</div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{myProfile.name}</p>
                    <p className="text-xs text-purple-500 truncate">{myProfile.handle}</p>
                  </div>
                </div>
                {isProfileComplete && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600">
                    <Check className="w-3.5 h-3.5" />
                    정보 등록 완료
                  </div>
                )}
              </div>

              <nav className="p-2">
                <button
                  onClick={() => setSelectedNav("profile")}
                  className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left", selectedNav === "profile" ? "bg-purple-50 text-purple-700 font-semibold" : "text-slate-600 hover:bg-slate-50")}
                >
                  본인 정보 등록
                </button>

                <div className="mt-1">
                  <button
                    onClick={() => setHistoryOpen((v) => !v)}
                    className={cn("w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all", ["applications", "active", "completed"].includes(selectedNav) ? "text-purple-700 font-semibold" : "text-slate-600 hover:bg-slate-50")}
                  >
                    <span>캠페인 이력</span>
                    {historyOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </button>

                  {historyOpen && (
                    <div className="pl-3 mt-1 space-y-0.5">
                      {([
                        { key: "applications" as NavItem, label: "신청한 캠페인", count: dummyMyApplications.length },
                        { key: "active" as NavItem, label: "진행중인 캠페인", count: activeCampaigns.length },
                        { key: "completed" as NavItem, label: "진행완료된 캠페인", count: completedCampaigns.length },
                      ]).map((item) => (
                        <button
                          key={item.key}
                          onClick={() => setSelectedNav(item.key)}
                          className={cn("w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all", selectedNav === item.key ? "bg-purple-50 text-purple-600 font-semibold" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700")}
                        >
                          <span>{item.label}</span>
                          {item.count > 0 && (
                            <span className={cn("text-xs px-1.5 py-0.5 rounded-full font-bold", selectedNav === item.key ? "bg-purple-200 text-purple-700" : "bg-slate-100 text-slate-500")}>
                              {item.count}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </nav>
            </div>
          </aside>

          {/* ── Content area ──────────────────────────────────────────── */}
          <main className="flex-1 min-w-0">
            <Content />
          </main>
        </div>
      </div>
    </div>
  );
}
