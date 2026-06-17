"use client";

import { useState } from "react";
import {
  Package,
  CheckCircle2,
  Circle,
  Clock,
  ChevronDown,
  ChevronUp,
  Send,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Truck,
  Upload,
  Eye,
  CheckCheck,
} from "lucide-react";
import Link from "next/link";
import { dummyMyActiveCampaigns, MyCampaign, MyCampaignStatus } from "@/lib/dummy-data";
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
  const now = new Date("2026-06-02");
  const due = new Date(deadline);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

const statusConfig: Record<MyCampaignStatus, { label: string; color: string; bg: string; border: string; icon: React.ReactNode; step: number }> = {
  approved:      { label: "배송 준비 중", color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200", icon: <Package className="w-4 h-4" />, step: 1 },
  shipped:       { label: "배송 중", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", icon: <Truck className="w-4 h-4" />, step: 2 },
  received:      { label: "제품 수령 완료", color: "text-cyan-700", bg: "bg-cyan-50", border: "border-cyan-200", icon: <CheckCircle2 className="w-4 h-4" />, step: 3 },
  uploading:     { label: "콘텐츠 업로드 대기", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: <Upload className="w-4 h-4" />, step: 4 },
  submitted:     { label: "검수 중", color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200", icon: <Eye className="w-4 h-4" />, step: 5 },
  revision:      { label: "수정 요청", color: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: <RefreshCw className="w-4 h-4" />, step: 5 },
  approved_final:{ label: "최종 승인", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: <CheckCheck className="w-4 h-4" />, step: 6 },
  settled:       { label: "정산 완료", color: "text-slate-700", bg: "bg-slate-50", border: "border-slate-200", icon: <CheckCheck className="w-4 h-4" />, step: 7 },
};

const PIPELINE_STEPS = [
  { key: "approved", label: "승인", step: 1 },
  { key: "shipped", label: "배송", step: 2 },
  { key: "received", label: "수령", step: 3 },
  { key: "uploading", label: "업로드", step: 4 },
  { key: "submitted", label: "검수", step: 5 },
  { key: "approved_final", label: "최종승인", step: 6 },
  { key: "settled", label: "정산", step: 7 },
];

function CampaignCard({ campaign }: { campaign: MyCampaign }) {
  const [expanded, setExpanded] = useState(campaign.status === "uploading" || campaign.status === "revision");
  const [contentLink, setContentLink] = useState(campaign.submittedLink ?? "");
  const [submitted, setSubmitted] = useState(false);
  const [checklist, setChecklist] = useState<boolean[]>(campaign.guidelines.map(() => false));

  const cfg = statusConfig[campaign.status];
  const dday = getDDay(campaign.contentDeadline);
  const currentStep = cfg.step;

  const allChecked = checklist.every(Boolean);

  const toggleCheck = (i: number) => {
    setChecklist((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  };

  return (
    <div className={cn("bg-white rounded-2xl border-2 transition-all", cfg.border)}>
      {/* Card header */}
      <div
        className="p-5 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ backgroundColor: campaign.brandLogoColor }}
            >
              {campaign.brandLogo}
            </div>
            <div>
              <div className="text-xs text-slate-400">{campaign.brandName}</div>
              <div className="text-base font-bold text-slate-900">{campaign.productName}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={cn("flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full font-semibold", cfg.color, cfg.bg)}>
              {cfg.icon}
              {cfg.label}
            </span>
            <div className={cn("text-xs font-bold px-2 py-1 rounded-lg", dday <= 3 ? "bg-red-50 text-red-600" : dday <= 7 ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-600")}>
              D-{dday}
            </div>
            {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </div>

        {/* Pipeline progress */}
        <div className="mt-4">
          <div className="flex items-center gap-0">
            {PIPELINE_STEPS.map((step, i) => {
              const done = step.step < currentStep;
              const active = step.step === currentStep;
              return (
                <div key={step.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all",
                        done ? "bg-emerald-500 text-white" :
                        active ? "bg-purple-500 text-white ring-4 ring-purple-100" :
                        "bg-slate-100 text-slate-400"
                      )}
                    >
                      {done ? "✓" : step.step}
                    </div>
                    <div className={cn("text-[9px] mt-1", active ? "text-purple-600 font-semibold" : done ? "text-emerald-600" : "text-slate-400")}>
                      {step.label}
                    </div>
                  </div>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <div className={cn("flex-1 h-0.5 mx-1 -mt-4", done ? "bg-emerald-300" : "bg-slate-100")} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-slate-100 p-5 space-y-5">
          {/* Tracking info */}
          {campaign.trackingNumber && (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50">
              <Truck className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <div className="text-xs text-slate-500">
                  {campaign.courier} · 운송장번호
                </div>
                <div className="text-sm font-semibold text-slate-800">{campaign.trackingNumber}</div>
              </div>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="ml-auto text-xs text-indigo-600 hover:underline flex items-center gap-1"
              >
                배송 조회 <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Revision note */}
          {campaign.status === "revision" && campaign.revisionNote && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-red-700 mb-1">수정 요청 내용</div>
                <p className="text-sm text-red-600 leading-relaxed">{campaign.revisionNote}</p>
              </div>
            </div>
          )}

          {/* Guidelines checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-800">콘텐츠 가이드라인</h4>
              <span className="text-xs text-slate-400">
                {checklist.filter(Boolean).length}/{checklist.length} 확인됨
              </span>
            </div>
            <div className="space-y-2">
              {campaign.guidelines.map((g, i) => (
                <div
                  key={i}
                  onClick={() => toggleCheck(i)}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all",
                    checklist[i] ? "bg-emerald-50 border border-emerald-200" : "bg-slate-50 hover:bg-slate-100"
                  )}
                >
                  {checklist[i] ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                  )}
                  <span className={cn("text-sm", checklist[i] ? "text-emerald-700 line-through" : "text-slate-600")}>{g}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Content link submission */}
          {(campaign.status === "uploading" || campaign.status === "revision") && (
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                콘텐츠 링크 제출
              </label>
              {!allChecked && (
                <div className="flex items-center gap-2 text-xs text-amber-600 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  가이드라인을 모두 확인한 후 제출하세요
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="url"
                  value={contentLink}
                  onChange={(e) => setContentLink(e.target.value)}
                  placeholder="https://instagram.com/p/..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                <button
                  onClick={() => contentLink.trim() && setSubmitted(true)}
                  disabled={!contentLink.trim() || !allChecked}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  제출
                </button>
              </div>
              {submitted && (
                <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  콘텐츠 링크가 제출되었습니다. 브랜드 검수를 기다려주세요.
                </div>
              )}
            </div>
          )}

          {/* Submitted link display */}
          {campaign.status === "submitted" && campaign.submittedLink && (
            <div>
              <div className="text-sm font-bold text-slate-800 mb-2">제출된 콘텐츠</div>
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-violet-50 border border-violet-200">
                <ExternalLink className="w-4 h-4 text-violet-500 shrink-0" />
                <a
                  href={campaign.submittedLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-violet-600 hover:underline truncate flex-1"
                >
                  {campaign.submittedLink}
                </a>
                <span className="text-xs text-violet-400 shrink-0">검수 중</span>
              </div>
              {campaign.submittedAt && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  제출일: {campaign.submittedAt}
                </div>
              )}
            </div>
          )}

          {/* Receipt confirmation for shipped */}
          {campaign.status === "shipped" && (
            <div>
              <button className="w-full py-3 rounded-xl border-2 border-blue-200 bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition-all">
                제품 수령 확인하기
              </button>
              <p className="text-xs text-slate-400 text-center mt-2">
                제품을 수령하셨으면 확인 버튼을 눌러주세요
              </p>
            </div>
          )}

          {/* Payment info */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50">
            <div className="text-xs text-slate-500">지급 예정 금액</div>
            <div className="text-right">
              <div className="text-sm font-bold text-slate-900">{campaign.payment.toLocaleString()}원</div>
              <div className="text-[10px] text-slate-400">
                실수령액 {(campaign.payment * 0.9).toLocaleString()}원 (수수료 10% 제외)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ActiveCampaignsPage() {
  const { isLoggedIn, login, mounted } = useInfluencerAuth();

  const urgent = dummyMyActiveCampaigns.filter(
    (c) => c.status === "uploading" || c.status === "revision"
  );
  const normal = dummyMyActiveCampaigns.filter(
    (c) => c.status !== "uploading" && c.status !== "revision"
  );

  if (mounted && !isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7 text-purple-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">로그인이 필요합니다</h2>
          <p className="text-sm text-slate-500 mb-6">진행 중 캠페인을 확인하려면 로그인해주세요</p>
          <button
            onClick={() => login()}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700 transition-all shadow-sm"
          >
            {GOOGLE_SVG}
            Google로 로그인
          </button>
          <Link href="/influencer/campaigns" className="block mt-3 text-sm text-slate-400 hover:text-slate-600 transition-colors">
            오픈 캠페인 보러가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Mobile header — desktop uses sidebar */}
      <header className="md:hidden bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-4 h-14 flex items-center justify-between">
          <Link href="/influencer/campaigns" className="text-base font-bold text-purple-600">SlamBeauty</Link>
          <nav className="flex items-center gap-1">
            <Link href="/influencer/campaigns" className="text-xs text-slate-500 px-2.5 py-1.5 rounded-lg hover:bg-slate-100">캠페인</Link>
            <Link href="/influencer/active" className="text-xs font-semibold text-purple-600 px-2.5 py-1.5 rounded-lg bg-purple-50">진행중</Link>
            <Link href="/influencer/settlement" className="text-xs text-slate-500 px-2.5 py-1.5 rounded-lg hover:bg-slate-100">정산</Link>
            <Link href="/influencer/profile" className="text-xs text-slate-500 px-2.5 py-1.5 rounded-lg hover:bg-slate-100">마이페이지</Link>
          </nav>
        </div>
      </header>

      <div className="p-4 sm:p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">진행 중 캠페인</h1>
        <p className="text-sm text-slate-500 mt-1">
          현재 참여 중인 캠페인 현황을 확인하고 액션을 처리하세요
        </p>
      </div>

      {/* Summary pills */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {[
          { label: "전체", count: dummyMyActiveCampaigns.length, color: "bg-slate-100 text-slate-700" },
          { label: "처리 필요", count: urgent.length, color: "bg-red-50 text-red-700 border border-red-200" },
          { label: "진행 중", count: normal.length, color: "bg-blue-50 text-blue-700" },
        ].map((p) => (
          <div key={p.label} className={cn("flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-semibold", p.color)}>
            {p.label}
            <span className="font-bold">{p.count}</span>
          </div>
        ))}
      </div>

      {/* Urgent section */}
      {urgent.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-bold text-red-700">처리 필요</h2>
          </div>
          <div className="space-y-4">
            {urgent.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        </div>
      )}

      {/* Normal section */}
      {normal.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-700">진행 중</h2>
          </div>
          <div className="space-y-4">
            {normal.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
