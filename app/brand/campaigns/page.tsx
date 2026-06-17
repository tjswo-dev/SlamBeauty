"use client";

import Link from "next/link";
import { dummyBrandCampaigns } from "@/lib/dummy-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  PlusCircle,
  ChevronRight,
  Users,
  Eye,
  FileCheck,
  Truck,
  AlertCircle,
  Calendar,
  Package,
  ImageOff,
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
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all">
            <PlusCircle className="w-4 h-4" />새 캠페인 등록
          </button>
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

          return (
            <Link key={campaign.id} href={`/brand/campaigns/${campaign.id}`}>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-50 transition-all cursor-pointer group">
                <div className="flex gap-5 items-start">

                  {/* 맨 왼쪽: 제품 사진 */}
                  <div className="w-28 h-28 rounded-xl shrink-0 overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                    <ImageOff className="w-8 h-8 text-indigo-300" />
                  </div>

                  {/* 오른쪽: 정보 */}
                  <div className="flex-1 min-w-0">

                    {/* 브랜드명 (가장 크게) + 제품명 + 상태 */}
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <h2 className="text-xl font-bold text-slate-900">{campaign.brandName}</h2>
                      <span className="text-slate-300">·</span>
                      <span className="text-base font-semibold text-slate-500">{campaign.productName}</span>
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ml-auto ${s.color}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                    </div>

                    {/* 핵심 날짜 정보 */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-slate-50 rounded-xl px-3 py-2.5">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium mb-1">
                          <Calendar className="w-3 h-3" />
                          모집 기간
                        </div>
                        <div className="text-xs font-semibold text-slate-800">
                          {campaign.recruitStartDate} ~ {campaign.recruitDeadline}
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-xl px-3 py-2.5">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium mb-1">
                          <Truck className="w-3 h-3" />
                          배송 예정일
                        </div>
                        <div className="text-xs font-semibold text-slate-800">{campaign.shippingDate}</div>
                      </div>
                      <div className="bg-slate-50 rounded-xl px-3 py-2.5">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium mb-1">
                          <Package className="w-3 h-3" />
                          콘텐츠 마감
                        </div>
                        <div className="text-xs font-semibold text-slate-800">{campaign.contentDeadline}</div>
                      </div>
                    </div>

                    {/* 콘텐츠 가이드라인 */}
                    <div className="mb-4">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">콘텐츠 가이드라인</p>
                      <ul className="space-y-1">
                        {campaign.guidelines.slice(0, 3).map((g, i) => (
                          <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                            <span className="text-indigo-400 shrink-0 mt-0.5">•</span>
                            <span className="line-clamp-1">{g}</span>
                          </li>
                        ))}
                        {campaign.guidelines.length > 3 && (
                          <li className="text-xs text-slate-400">+{campaign.guidelines.length - 3}개 더</li>
                        )}
                      </ul>
                    </div>

                    {/* 하단: 인플루언서 현황 */}
                    <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
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

                      <div className="flex items-center gap-3 text-xs flex-1">
                        {shippedCount > 0 && (
                          <span className="flex items-center gap-1 text-blue-600">
                            <Truck className="w-3.5 h-3.5" />배송 중 {shippedCount}
                          </span>
                        )}
                        {submittedCount > 0 && (
                          <span className="flex items-center gap-1 text-amber-600 font-semibold">
                            <Eye className="w-3.5 h-3.5" />검수 대기 {submittedCount}
                          </span>
                        )}
                        {revisionCount > 0 && (
                          <span className="flex items-center gap-1 text-red-600 font-semibold">
                            <AlertCircle className="w-3.5 h-3.5" />수정 요청 {revisionCount}
                          </span>
                        )}
                        {finalCount > 0 && (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <FileCheck className="w-3.5 h-3.5" />완료 {finalCount}
                          </span>
                        )}
                        {campaign.pendingApplicants.length > 0 && (
                          <span className="flex items-center gap-1 text-indigo-600 font-semibold">
                            <Users className="w-3.5 h-3.5" />지원 대기 {campaign.pendingApplicants.length}
                          </span>
                        )}
                      </div>

                      <span className="text-sm font-bold text-indigo-600 shrink-0">
                        {formatCurrency(campaign.budgetPerInfluencer)}/인
                      </span>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
