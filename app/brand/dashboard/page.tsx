"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { CampaignStatus, InfluencerCampaignStatus } from "@/lib/supabase/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Megaphone, Users, Wallet, CheckCircle, AlertCircle, Clock,
  ChevronRight, Truck, Eye, FileCheck, PlusCircle, TrendingUp,
  ArrowRight, Package,
} from "lucide-react";

function formatCurrency(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(0)}만원`;
  return `${n.toLocaleString()}원`;
}

const statusConfig: Record<CampaignStatus, { label: string; color: string; dot: string }> = {
  recruiting: { label: "모집 중", color: "bg-indigo-100 text-indigo-700", dot: "bg-indigo-500" },
  in_progress: { label: "진행 중", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  review: { label: "검수 중", color: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
  completed: { label: "완료", color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
};

const actionTypeConfig = {
  content_review: { label: "콘텐츠 검수", icon: Eye, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  applicant_review: { label: "지원자 검토", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200" },
  shipping: { label: "발송 필요", icon: Truck, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
};

type CampaignRow = {
  id: string;
  product_name: string;
  category: string;
  status: CampaignStatus;
  recruit_count: number;
  budget_per_influencer: number;
  recruit_deadline: string;
  content_deadline: string;
  campaign_influencers: { id: string; status: InfluencerCampaignStatus }[];
  campaign_applications: { id: string; status: string }[];
};

type PendingAction = {
  id: string;
  type: "content_review" | "applicant_review" | "shipping";
  urgency: "high" | "normal";
  campaignId: string;
  campaignName: string;
  daysLeft: number;
  description: string;
};

function derivePendingActions(campaigns: CampaignRow[]): PendingAction[] {
  const actions: PendingAction[] = [];
  const today = new Date();

  for (const campaign of campaigns) {
    const daysToContent = Math.ceil(
      (new Date(campaign.content_deadline).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysToRecruit = Math.ceil(
      (new Date(campaign.recruit_deadline).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    const submittedCount = campaign.campaign_influencers.filter((ci) => ci.status === "submitted").length;
    const pendingApps = campaign.campaign_applications.filter((a) => a.status === "pending").length;
    const selectedCount = campaign.campaign_influencers.filter((ci) => ci.status === "selected").length;

    if (submittedCount > 0) {
      actions.push({
        id: `${campaign.id}-review`,
        type: "content_review",
        urgency: daysToContent <= 3 ? "high" : "normal",
        campaignId: campaign.id,
        campaignName: campaign.product_name,
        daysLeft: Math.max(daysToContent, 0),
        description: `${submittedCount}명의 콘텐츠가 검수 대기 중입니다`,
      });
    }

    if (pendingApps > 0) {
      actions.push({
        id: `${campaign.id}-applicants`,
        type: "applicant_review",
        urgency: daysToRecruit <= 2 ? "high" : "normal",
        campaignId: campaign.id,
        campaignName: campaign.product_name,
        daysLeft: Math.max(daysToRecruit, 0),
        description: `${pendingApps}명이 캠페인 참여를 신청했습니다`,
      });
    }

    if (selectedCount > 0) {
      actions.push({
        id: `${campaign.id}-shipping`,
        type: "shipping",
        urgency: "normal",
        campaignId: campaign.id,
        campaignName: campaign.product_name,
        daysLeft: 7,
        description: `${selectedCount}명에게 제품 발송이 필요합니다`,
      });
    }
  }

  return actions;
}

export default function BrandDashboardPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/brand/login");
        return;
      }
      (supabase.from("campaigns") as ReturnType<typeof supabase.from>)
        .select(`
          id, product_name, category, status, recruit_count, budget_per_influencer, recruit_deadline, content_deadline,
          campaign_influencers(id, status),
          campaign_applications(id, status)
        `)
        .eq("brand_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data }: { data: CampaignRow[] | null }) => {
          setCampaigns(data ?? []);
          setLoading(false);
        });
    });
  }, [router]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-400 text-sm">로딩 중...</div>
      </div>
    );
  }

  const pendingActions = derivePendingActions(campaigns);
  const highActions = pendingActions.filter((a) => a.urgency === "high");
  const otherActions = pendingActions.filter((a) => a.urgency !== "high");

  const totalBudget = campaigns.reduce((s, c) => s + c.budget_per_influencer * c.recruit_count, 0);
  const spentBudget = campaigns.reduce(
    (s, c) =>
      s +
      c.campaign_influencers.filter((ci) => ["final_ok", "settled"].includes(ci.status)).length *
        c.budget_per_influencer,
    0
  );
  const inProgressBudget = campaigns.reduce(
    (s, c) =>
      s +
      c.campaign_influencers.filter((ci) =>
        ["selected", "shipped", "received", "submitted", "revision"].includes(ci.status)
      ).length *
        c.budget_per_influencer,
    0
  );

  const totalInfluencers = campaigns.reduce((s, c) => s + c.campaign_influencers.length, 0);
  const pendingApplicantsTotal = campaigns.reduce(
    (s, c) => s + c.campaign_applications.filter((a) => a.status === "pending").length,
    0
  );
  const activeCampaigns = campaigns.filter((c) => c.status !== "completed");

  const pageHeader = (
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
  );

  if (campaigns.length === 0) {
    return (
      <div className="p-8">
        {pageHeader}
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
            <Megaphone className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-700 mb-2">아직 캠페인이 없습니다</h2>
          <p className="text-sm text-slate-400 mb-6 max-w-sm">
            첫 번째 캠페인을 등록하고 인플루언서와 협업을 시작해보세요
          </p>
          <Link href="/brand/campaign/new">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <PlusCircle className="w-4 h-4" />
              첫 캠페인 등록하기
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {pageHeader}

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "진행 중 캠페인",
            value: `${activeCampaigns.length}건`,
            sub: `총 ${campaigns.length}건 중`,
            icon: Megaphone,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            urgent: false,
          },
          {
            label: "협업 인플루언서",
            value: `${totalInfluencers}명`,
            sub: `지원 대기 ${pendingApplicantsTotal}명`,
            icon: Users,
            color: "text-pink-600",
            bg: "bg-pink-50",
            urgent: false,
          },
          {
            label: "집행 예산",
            value: formatCurrency(spentBudget),
            sub: `총 예산 ${formatCurrency(totalBudget)}`,
            icon: Wallet,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            urgent: false,
          },
          {
            label: "처리 필요 액션",
            value: `${pendingActions.length}건`,
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
      {totalBudget > 0 && (
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
                <span className="text-slate-500">
                  잔여 {formatCurrency(Math.max(totalBudget - spentBudget - inProgressBudget, 0))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-5 gap-6">
        {/* Pending Actions — left column (3/5) */}
        <div className="col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">처리 필요 액션</h2>
            {pendingActions.length > 0 && (
              <span className="text-xs text-slate-400">{pendingActions.length}건 대기 중</span>
            )}
          </div>

          {highActions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-red-500 uppercase tracking-wider">
                <AlertCircle className="w-3.5 h-3.5" />
                긴급 처리 필요
              </div>
              {highActions.map((action) => {
                const cfg = actionTypeConfig[action.type];
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
                        {action.campaignName}
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

          {otherActions.length > 0 && (
            <div className="space-y-2">
              {highActions.length > 0 && (
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-4">
                  일반 처리 항목
                </div>
              )}
              {otherActions.map((action) => {
                const cfg = actionTypeConfig[action.type];
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
                        {action.campaignName}
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

          {pendingActions.length === 0 && (
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
            {campaigns.map((campaign) => {
              const s = statusConfig[campaign.status];
              const confirmedCount = campaign.campaign_influencers.length;
              const completedCount = campaign.campaign_influencers.filter((i) =>
                ["final_ok", "settled"].includes(i.status)
              ).length;
              const reviewCount = campaign.campaign_influencers.filter((i) => i.status === "submitted").length;

              return (
                <Link key={campaign.id} href={`/brand/campaigns/${campaign.id}`}>
                  <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate mb-1">
                          {campaign.product_name}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${s.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                            {s.label}
                          </span>
                          <span className="text-xs text-slate-400">{campaign.category}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0 mt-0.5" />
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-slate-500">
                        {confirmedCount}/{campaign.recruit_count}명 확정
                      </span>
                      {reviewCount > 0 && (
                        <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">
                          검수 {reviewCount}건
                        </span>
                      )}
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all"
                        style={{
                          width: `${campaign.recruit_count > 0 ? (completedCount / campaign.recruit_count) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>완료 {completedCount}명</span>
                      <span>목표 {campaign.recruit_count}명</span>
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
              전체 현황
            </div>
            <div className="space-y-2">
              {[
                {
                  icon: FileCheck,
                  label: "콘텐츠 승인 완료",
                  value: `${campaigns.reduce((s, c) => s + c.campaign_influencers.filter((i) => i.status === "final_ok").length, 0)}건`,
                },
                {
                  icon: Package,
                  label: "제품 발송 완료",
                  value: `${campaigns.reduce(
                    (s, c) =>
                      s +
                      c.campaign_influencers.filter((i) =>
                        ["shipped", "received", "submitted", "revision", "final_ok", "settled"].includes(i.status)
                      ).length,
                    0
                  )}건`,
                },
                {
                  icon: Clock,
                  label: "검수 대기 콘텐츠",
                  value: `${campaigns.reduce((s, c) => s + c.campaign_influencers.filter((i) => i.status === "submitted").length, 0)}건`,
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
