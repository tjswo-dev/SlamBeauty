"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type CampaignInfluencer = {
  id: string;
  status: string;
  influencer_id: string;
};

type CampaignApplication = {
  id: string;
  status: string;
  influencer_id: string;
};

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
  status: "recruiting" | "in_progress" | "review" | "completed";
  created_at: string;
  campaign_influencers: CampaignInfluencer[];
  campaign_applications: CampaignApplication[];
};

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
  influencers: CampaignInfluencer[],
  statuses: string[]
) => influencers.filter((i) => statuses.includes(i.status)).length;

const statusFilterMap: Record<string, Campaign["status"] | null> = {
  "전체": null,
  "모집 중": "recruiting",
  "진행 중": "in_progress",
  "검수 중": "review",
  "완료": "completed",
};

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("전체");

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.push("/brand/login");
          return;
        }
        const { data } = await supabase
          .from("campaigns")
          .select(`
            *,
            campaign_influencers(id, status, influencer_id),
            campaign_applications(id, status, influencer_id)
          `)
          .eq("brand_id", session.user.id)
          .order("created_at", { ascending: false });
        setCampaigns((data as Campaign[]) ?? []);
      } catch {
        // 오류 시 빈 목록 표시
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">캠페인 목록</h1>
          <p className="text-sm text-slate-500 mt-1">
            전체 {campaigns.length}건 · 진행 중{" "}
            {campaigns.filter((c) => c.status !== "completed").length}건
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
        {Object.keys(statusFilterMap).map((tab) => {
          const count = tab === "전체"
            ? campaigns.length
            : campaigns.filter((c) => c.status === statusFilterMap[tab]).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeFilter === tab
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeFilter === tab ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {(() => {
        const filtered = activeFilter === "전체"
          ? campaigns
          : campaigns.filter((c) => c.status === statusFilterMap[activeFilter]);
        return filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">
              {campaigns.length === 0 ? "아직 등록된 캠페인이 없습니다" : `'${activeFilter}' 캠페인이 없습니다`}
            </p>
            {campaigns.length === 0 && <p className="text-xs mt-1">첫 번째 캠페인을 등록해보세요</p>}
          </div>
        ) : (
        <div className="space-y-4">
          {filtered.map((campaign) => {
            const s = statusConfig[campaign.status];
            const influencers = campaign.campaign_influencers ?? [];
            const applications = campaign.campaign_applications ?? [];
            const submittedCount = infStatusCount(influencers, ["submitted"]);
            const revisionCount = infStatusCount(influencers, ["revision"]);
            const shippedCount = infStatusCount(influencers, ["shipped", "received"]);
            const finalCount = infStatusCount(influencers, ["final_ok", "settled"]);
            const pendingCount = applications.filter((a) => a.status === "pending").length;

            return (
              <Link key={campaign.id} href={`/brand/campaigns/${campaign.id}`}>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-50 transition-all cursor-pointer group">
                  <div className="flex gap-5 items-start">

                    {/* 맨 왼쪽: 제품 사진 */}
                    <div className="w-28 h-28 rounded-xl shrink-0 overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                      {campaign.product_image_url ? (
                        <img
                          src={campaign.product_image_url}
                          alt={campaign.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageOff className="w-8 h-8 text-indigo-300" />
                      )}
                    </div>

                    {/* 오른쪽: 정보 */}
                    <div className="flex-1 min-w-0">

                      {/* 브랜드명 + 제품명 + 상태 */}
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <h2 className="text-xl font-bold text-slate-900">{campaign.brand_name}</h2>
                        <span className="text-slate-300">·</span>
                        <span className="text-base font-semibold text-slate-500">{campaign.product_name}</span>
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
                            {campaign.recruit_start_date} ~ {campaign.recruit_deadline}
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded-xl px-3 py-2.5">
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium mb-1">
                            <Truck className="w-3 h-3" />
                            배송 예정일
                          </div>
                          <div className="text-xs font-semibold text-slate-800">{campaign.shipping_date}</div>
                        </div>
                        <div className="bg-slate-50 rounded-xl px-3 py-2.5">
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium mb-1">
                            <Package className="w-3 h-3" />
                            콘텐츠 마감
                          </div>
                          <div className="text-xs font-semibold text-slate-800">{campaign.content_deadline}</div>
                        </div>
                      </div>

                      {/* 콘텐츠 가이드라인 */}
                      <div className="mb-4">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">콘텐츠 가이드라인</p>
                        <ul className="space-y-1">
                          {(campaign.guidelines ?? []).slice(0, 3).map((g, i) => (
                            <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                              <span className="text-indigo-400 shrink-0 mt-0.5">•</span>
                              <span className="line-clamp-1">{g}</span>
                            </li>
                          ))}
                          {(campaign.guidelines ?? []).length > 3 && (
                            <li className="text-xs text-slate-400">+{campaign.guidelines.length - 3}개 더</li>
                          )}
                        </ul>
                      </div>

                      {/* 하단: 인플루언서 현황 */}
                      <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {influencers.slice(0, 4).map((ci) => (
                              <div
                                key={ci.id}
                                className="w-7 h-7 rounded-full border-2 border-white bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold"
                              >
                                {ci.influencer_id.slice(0, 1).toUpperCase()}
                              </div>
                            ))}
                          </div>
                          <span className="text-sm text-slate-600">
                            {influencers.length}
                            <span className="text-slate-400">/{campaign.recruit_count}명</span>
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
                          {pendingCount > 0 && (
                            <span className="flex items-center gap-1 text-indigo-600 font-semibold">
                              <Users className="w-3.5 h-3.5" />지원 대기 {pendingCount}
                            </span>
                          )}
                        </div>

                        <span className="text-sm font-bold text-indigo-600 shrink-0">
                          {formatCurrency(campaign.budget_per_influencer)}/인
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
        );
      })()}
    </div>
  );
}
