"use client";

import Link from "next/link";
import { useState } from "react";
import {
  dummyBrandCampaigns,
  dummyPendingActions,
  dummyInfluencers,
} from "@/lib/dummy-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Megaphone,
  Users,
  Wallet,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronRight,
  Truck,
  Eye,
  FileCheck,
  PlusCircle,
  TrendingUp,
  ArrowRight,
  Package,
} from "lucide-react";

function formatCurrency(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(0)}만원`;
  return `${n.toLocaleString()}원`;
}

const statusConfig = {
  recruiting: { label: "모집 중", color: "bg-indigo-100 text-indigo-700", dot: "bg-indigo-500" },
  in_progress: { label: "진행 중", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  review: { label: "검수 중", color: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
  completed: { label: "완료", color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
};

const influencerStatusConfig = {
  approved: { label: "배송 준비", color: "text-slate-500", dotColor: "bg-slate-400" },
  shipped: { label: "배송 중", color: "text-blue-600", dotColor: "bg-blue-500" },
  received: { label: "수령 완료", color: "text-indigo-600", dotColor: "bg-indigo-500" },
  submitted: { label: "검수 대기", color: "text-amber-600", dotColor: "bg-amber-500" },
  revision: { label: "수정 요청", color: "text-red-600", dotColor: "bg-red-500" },
  final_ok: { label: "최종 승인", color: "text-emerald-600", dotColor: "bg-emerald-500" },
  settled: { label: "정산 완료", color: "text-slate-400", dotColor: "bg-slate-300" },
};

const actionTypeConfig = {
  content_review: { label: "콘텐츠 검수", icon: Eye, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  applicant_review: { label: "지원자 검토", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200" },
  shipping: { label: "발송 필요", icon: Truck, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
};

export default function BrandDashboardPage() {
  const [dismissedActions, setDismissedActions] = useState<string[]>([]);
  const visibleActions = dummyPendingActions.filter(
    (a) => !dismissedActions.includes(a.id)
  );
  const highActions = visibleActions.filter((a) => a.urgency === "high");
  const otherActions = visibleActions.filter((a) => a.urgency !== "high");

  // Budget summary
  const totalBudget = dummyBrandCampaigns.reduce((s, c) => s + c.totalBudget, 0);
  const spentBudget = dummyBrandCampaigns.reduce(
    (s, c) =>
      s +
      c.influencers.filter((inf) =>
        ["final_ok", "settled"].includes(inf.status)
      ).length *
        c.budgetPerInfluencer,
    0
  );
  const inProgressBudget = dummyBrandCampaigns.reduce(
    (s, c) =>
      s +
      c.influencers.filter((inf) =>
        ["approved", "shipped", "received", "submitted", "revision"].includes(inf.status)
      ).length *
        c.budgetPerInfluencer,
    0
  );

  // Influencer counts
  const totalInfluencers = dummyBrandCampaigns.reduce(
    (s, c) => s + c.influencers.length,
    0
  );
  const pendingApplicants = dummyBrandCampaigns.reduce(
    (s, c) => s + c.pendingApplicants.length,
    0
  );

  return (
    <div className="p-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">대시보드</h1>
          <p className="text-sm text-slate-500 mt-1">
            {new Date().toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </p>
        </div>
        <Link href="/brand/campaign/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <PlusCircle className="w-4 h-4" />
            새 캠페인 등록
          </Button>
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "진행 중 캠페인",
            value: `${dummyBrandCampaigns.filter((c) => c.status !== "completed").length}건`,
            sub: `총 ${dummyBrandCampaigns.length}건 중`,
            icon: Megaphone,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
          },
          {
            label: "협업 인플루언서",
            value: `${totalInfluencers}명`,
            sub: `지원 대기 ${pendingApplicants}명`,
            icon: Users,
            color: "text-pink-600",
            bg: "bg-pink-50",
          },
          {
            label: "집행 예산",
            value: formatCurrency(spentBudget),
            sub: `총 예산 ${formatCurrency(totalBudget)}`,
            icon: Wallet,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "처리 필요 액션",
            value: `${visibleActions.length}건`,
            sub: `긴급 ${highActions.length}건`,
            icon: AlertCircle,
            color: "text-amber-600",
            bg: "bg-amber-50",
            urgent: highActions.length > 0,
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            className={`border-slate-200 ${stat.urgent ? "border-amber-300 shadow-amber-100 shadow-sm" : ""}`}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
                </div>
                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Budget progress bar */}
      <Card className="mb-8 border-slate-200">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-slate-700">전체 예산 현황</div>
            <div className="text-xs text-slate-400">{formatCurrency(totalBudget)} 총 예산</div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full rounded-l-full"
              style={{ width: `${(spentBudget / totalBudget) * 100}%` }}
              title="정산 완료"
            />
            <div
              className="bg-amber-400 h-full"
              style={{ width: `${(inProgressBudget / totalBudget) * 100}%` }}
              title="진행 중"
            />
          </div>
          <div className="flex items-center gap-6 mt-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-500">정산 완료 {formatCurrency(spentBudget)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-slate-500">진행 중 {formatCurrency(inProgressBudget)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              <span className="text-slate-500">잔여 {formatCurrency(totalBudget - spentBudget - inProgressBudget)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-5 gap-6">
        {/* Pending Actions — left column (3/5) */}
        <div className="col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">처리 필요 액션</h2>
            {visibleActions.length > 0 && (
              <span className="text-xs text-slate-400">{visibleActions.length}건 대기 중</span>
            )}
          </div>

          {/* High urgency */}
          {highActions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-red-500 uppercase tracking-wider">
                <AlertCircle className="w-3.5 h-3.5" />
                긴급 처리 필요
              </div>
              {highActions.map((action) => {
                const cfg = actionTypeConfig[action.type as keyof typeof actionTypeConfig];
                return (
                  <div
                    key={action.id}
                    className={`flex items-start gap-4 p-4 rounded-xl border ${cfg.border} ${cfg.bg} group`}
                  >
                    <div className={`w-9 h-9 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center shrink-0`}>
                      <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                        <span className="text-xs text-red-500 font-medium bg-red-100 px-1.5 py-0.5 rounded-full">
                          D-{action.daysLeft}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-slate-800 mb-0.5 truncate">
                        {action.campaignName} · {action.influencerName}
                      </div>
                      <div className="text-xs text-slate-500">{action.description}</div>
                    </div>
                    <Link href={`/brand/campaigns/${action.campaignId}`}>
                      <button className="shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-all">
                        처리하기
                      </button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          {/* Other actions */}
          {otherActions.length > 0 && (
            <div className="space-y-2">
              {highActions.length > 0 && (
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-4">
                  일반 처리 항목
                </div>
              )}
              {otherActions.map((action) => {
                const cfg = actionTypeConfig[action.type as keyof typeof actionTypeConfig];
                return (
                  <div
                    key={action.id}
                    className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all group"
                  >
                    <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                      <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                        <span className="text-xs text-slate-400">D-{action.daysLeft}</span>
                      </div>
                      <div className="text-sm font-semibold text-slate-800 mb-0.5 truncate">
                        {action.campaignName} · {action.influencerName}
                      </div>
                      <div className="text-xs text-slate-500">{action.description}</div>
                    </div>
                    <Link href={`/brand/campaigns/${action.campaignId}`}>
                      <button className="shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all opacity-0 group-hover:opacity-100">
                        처리하기
                      </button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          {visibleActions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-slate-200 rounded-xl">
              <CheckCircle className="w-8 h-8 text-emerald-400 mb-3" />
              <div className="text-sm font-semibold text-slate-600">모든 항목 처리 완료</div>
              <div className="text-xs text-slate-400 mt-1">현재 처리가 필요한 항목이 없습니다</div>
            </div>
          )}
        </div>

        {/* Campaign status — right column (2/5) */}
        <div className="col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">캠페인 현황</h2>
            <Link href="/brand/campaigns" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
              전체 보기 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {dummyBrandCampaigns.map((campaign) => {
              const s = statusConfig[campaign.status];
              const completedCount = campaign.influencers.filter((i) =>
                ["final_ok", "settled"].includes(i.status)
              ).length;
              const reviewCount = campaign.influencers.filter((i) =>
                i.status === "submitted"
              ).length;

              return (
                <Link key={campaign.id} href={`/brand/campaigns/${campaign.id}`}>
                  <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate mb-1">
                          {campaign.productName}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${s.color}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                            {s.label}
                          </span>
                          <span className="text-xs text-slate-400">{campaign.category}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0 mt-0.5" />
                    </div>

                    {/* Influencer progress */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex -space-x-2">
                        {campaign.influencers.slice(0, 3).map((ci) => (
                          <Avatar key={ci.influencer.id} size="sm" className="border-2 border-white">
                            <AvatarImage src={ci.influencer.avatar} />
                            <AvatarFallback>{ci.influencer.name[0]}</AvatarFallback>
                          </Avatar>
                        ))}
                        {campaign.influencers.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs text-slate-500 font-medium">
                            +{campaign.influencers.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">
                        {campaign.influencers.length}/{campaign.recruitCount}명 확정
                      </span>
                      {reviewCount > 0 && (
                        <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">
                          검수 {reviewCount}건
                        </span>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all"
                        style={{
                          width: `${(completedCount / campaign.recruitCount) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>완료 {completedCount}명</span>
                      <span>목표 {campaign.recruitCount}명</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Quick stats */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
            <div className="text-xs font-semibold text-indigo-600 mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              이번 주 현황
            </div>
            <div className="space-y-2">
              {[
                {
                  icon: FileCheck,
                  label: "콘텐츠 승인 완료",
                  value: `${dummyBrandCampaigns.reduce((s, c) => s + c.influencers.filter((i) => i.status === "final_ok").length, 0)}건`,
                },
                {
                  icon: Package,
                  label: "제품 발송 완료",
                  value: `${dummyBrandCampaigns.reduce((s, c) => s + c.influencers.filter((i) => ["shipped", "received", "submitted", "revision", "final_ok", "settled"].includes(i.status)).length, 0)}건`,
                },
                {
                  icon: Clock,
                  label: "평균 콘텐츠 제출 소요일",
                  value: "4.8일",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <item.icon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="text-xs text-indigo-700 flex-1">{item.label}</span>
                  <span className="text-xs font-bold text-indigo-800">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
