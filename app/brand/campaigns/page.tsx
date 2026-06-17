"use client";

import Link from "next/link";
import { dummyBrandCampaigns } from "@/lib/dummy-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  PlusCircle,
  ChevronRight,
  Users,
  Wallet,
  Eye,
  FileCheck,
  Truck,
  Clock,
  AlertCircle,
} from "lucide-react";

function formatCurrency(n: number) {
  return `${(n / 10000).toFixed(0)}만원`;
}

const statusConfig = {
  recruiting: {
    label: "모집 중",
    color: "bg-indigo-100 text-indigo-700",
    dot: "bg-indigo-500",
  },
  in_progress: {
    label: "진행 중",
    color: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
  },
  review: {
    label: "검수 중",
    color: "bg-purple-100 text-purple-700",
    dot: "bg-purple-500",
  },
  completed: {
    label: "완료",
    color: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
};

const infStatusCount = (
  influencers: { status: string }[],
  statuses: string[]
) => influencers.filter((i) => statuses.includes(i.status)).length;

export default function CampaignsPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">캠페인 목록</h1>
          <p className="text-sm text-slate-500 mt-1">
            전체 {dummyBrandCampaigns.length}건 · 진행 중{" "}
            {dummyBrandCampaigns.filter((c) => c.status !== "completed").length}건
          </p>
        </div>
        <Link href="/brand/campaign/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <PlusCircle className="w-4 h-4" />새 캠페인 등록
          </Button>
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-6">
        {["전체", "모집 중", "진행 중", "검수 중", "완료"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "전체"
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {dummyBrandCampaigns.map((campaign) => {
          const s = statusConfig[campaign.status];
          const submittedCount = infStatusCount(campaign.influencers, ["submitted"]);
          const revisionCount = infStatusCount(campaign.influencers, ["revision"]);
          const shippedCount = infStatusCount(campaign.influencers, ["shipped", "received"]);
          const finalCount = infStatusCount(campaign.influencers, ["final_ok", "settled"]);
          const budgetUsed =
            infStatusCount(campaign.influencers, ["final_ok", "settled"]) *
            campaign.budgetPerInfluencer;

          return (
            <Link key={campaign.id} href={`/brand/campaigns/${campaign.id}`}>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-50 transition-all cursor-pointer group">
                <div className="flex items-start gap-5">
                  {/* Left: product info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-bold text-slate-900">{campaign.productName}</h3>
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${s.color}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {campaign.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-4">
                      {campaign.description}
                    </p>

                    {/* Influencer pipeline summary */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {campaign.influencers.slice(0, 4).map((ci) => (
                            <Avatar key={ci.influencer.id} size="sm" className="border-2 border-white">
                              <AvatarImage src={ci.influencer.avatar} />
                              <AvatarFallback>{ci.influencer.name[0]}</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <span className="text-sm text-slate-600">
                          {campaign.influencers.length}
                          <span className="text-slate-400">/{campaign.recruitCount}명</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        {shippedCount > 0 && (
                          <span className="flex items-center gap-1 text-blue-600">
                            <Truck className="w-3.5 h-3.5" />
                            배송 중 {shippedCount}
                          </span>
                        )}
                        {submittedCount > 0 && (
                          <span className="flex items-center gap-1 text-amber-600 font-semibold">
                            <Eye className="w-3.5 h-3.5" />
                            검수 대기 {submittedCount}
                          </span>
                        )}
                        {revisionCount > 0 && (
                          <span className="flex items-center gap-1 text-red-600 font-semibold">
                            <AlertCircle className="w-3.5 h-3.5" />
                            수정 요청 {revisionCount}
                          </span>
                        )}
                        {finalCount > 0 && (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <FileCheck className="w-3.5 h-3.5" />
                            완료 {finalCount}
                          </span>
                        )}
                        {campaign.pendingApplicants.length > 0 && (
                          <span className="flex items-center gap-1 text-indigo-600 font-semibold">
                            <Users className="w-3.5 h-3.5" />
                            지원 대기 {campaign.pendingApplicants.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: dates & budget */}
                  <div className="shrink-0 text-right space-y-2 min-w-[140px]">
                    <div>
                      <div className="text-xs text-slate-400 mb-0.5">1인당 단가</div>
                      <div className="text-base font-bold text-indigo-600">
                        {formatCurrency(campaign.budgetPerInfluencer)}
                      </div>
                    </div>
                    <div className="text-xs text-slate-400">
                      총 예산{" "}
                      <span className="font-semibold text-slate-700">
                        {formatCurrency(campaign.totalBudget)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-end text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>콘텐츠 마감 {campaign.contentDeadline}</span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="text-[10px] text-slate-400">집행</span>
                      <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full"
                          style={{
                            width: `${(budgetUsed / campaign.totalBudget) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {Math.round((budgetUsed / campaign.totalBudget) * 100)}%
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0 mt-1" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
