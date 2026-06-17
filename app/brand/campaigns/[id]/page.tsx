"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { CampaignStatus, InfluencerCampaignStatus } from "@/lib/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InfluencerDetailSheet, type SheetInfluencer } from "@/components/brand/influencer-detail-sheet";
import {
  ArrowLeft,
  ChevronRight,
  Truck,
  Eye,
  CheckCircle,
  X,
  AlertCircle,
  ExternalLink,
  Users,
  Wallet,
  Clock,
  FileText,
  MessageSquare,
  RotateCcw,
  Sparkles,
  Megaphone,
} from "lucide-react";

function formatCurrency(n: number) {
  return `${(n / 10000).toFixed(0)}만원`;
}

function formatNumber(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`;
  return n.toLocaleString();
}

const infStatusConfig: Record<
  InfluencerCampaignStatus,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  selected: {
    label: "배송 준비",
    color: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
  shipped: {
    label: "배송 중",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  received: {
    label: "수령 완료",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    dot: "bg-indigo-500",
  },
  submitted: {
    label: "검수 대기",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  revision: {
    label: "수정 요청",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-500",
  },
  final_ok: {
    label: "최종 승인",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  settled: {
    label: "정산 완료",
    color: "text-slate-400",
    bg: "bg-slate-50",
    border: "border-slate-100",
    dot: "bg-slate-300",
  },
};

type InfluencerProfile = {
  id: string;
  user_id: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  instagram_handle: string | null;
  tiktok_handle: string | null;
  twitter_handle: string | null;
  instagram_followers: number | null;
  tiktok_followers: number | null;
  twitter_followers: number | null;
  primary_platform: string | null;
  categories: string[];
};

type ActiveInfluencer = {
  id: string;
  influencer_id: string;
  status: InfluencerCampaignStatus;
  tracking_number: string | null;
  content_url: string | null;
  revision_note: string | null;
  profile: InfluencerProfile | null;
};

type Applicant = {
  id: string;
  influencer_id: string;
  message: string | null;
  profile: InfluencerProfile | null;
};

type CampaignData = {
  id: string;
  product_name: string;
  category: string;
  description: string;
  guidelines: string[];
  status: CampaignStatus;
  recruit_count: number;
  budget_per_influencer: number;
  recruit_start_date: string;
  recruit_deadline: string;
  shipping_date: string;
  content_deadline: string;
  target_countries: string[];
  target_age_min: number;
  target_age_max: number;
};

type ReviewState = {
  [rowId: string]: { open: boolean; revisionNote: string };
};

function mapToSheetInfluencer(profile: InfluencerProfile): SheetInfluencer {
  const platforms: string[] = [];
  if (profile.instagram_handle) platforms.push("Instagram");
  if (profile.tiktok_handle) platforms.push("TikTok");
  if (profile.twitter_handle) platforms.push("Twitter");

  const followers =
    (profile.instagram_followers ?? 0) +
    (profile.tiktok_followers ?? 0) +
    (profile.twitter_followers ?? 0);

  const handle =
    profile.instagram_handle
      ? `@${profile.instagram_handle}`
      : profile.tiktok_handle
      ? `@${profile.tiktok_handle}`
      : profile.twitter_handle
      ? `@${profile.twitter_handle}`
      : "";

  return {
    id: profile.user_id,
    name: profile.name,
    handle,
    avatar: profile.avatar_url ?? "",
    bio: profile.bio ?? "",
    followers,
    platforms: platforms.length > 0 ? platforms : [profile.primary_platform ?? "Instagram"],
    categories: profile.categories ?? [],
  };
}

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [influencers, setInfluencers] = useState<ActiveInfluencer[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [selectedInf, setSelectedInf] = useState<SheetInfluencer | null>(null);
  const [sheetMode, setSheetMode] = useState<"view" | "approve">("view");
  const [activeApplicantId, setActiveApplicantId] = useState<string | null>(null);
  const [reviewState, setReviewState] = useState<ReviewState>({});
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      try {
      const { data: campaignData, error: campaignError } = await (supabase.from("campaigns") as ReturnType<typeof supabase.from>)
        .select(
          "id, product_name, category, description, guidelines, status, recruit_count, budget_per_influencer, recruit_start_date, recruit_deadline, shipping_date, content_deadline, target_countries, target_age_min, target_age_max"
        )
        .eq("id", campaignId)
        .single();

      if (campaignError || !campaignData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setCampaign(campaignData as CampaignData);

      const { data: infRows } = await (supabase.from("campaign_influencers") as ReturnType<typeof supabase.from>)
        .select("id, influencer_id, status, tracking_number, content_url, revision_note")
        .eq("campaign_id", campaignId);

      const { data: appRows } = await (supabase.from("campaign_applications") as ReturnType<typeof supabase.from>)
        .select("id, influencer_id, message, status")
        .eq("campaign_id", campaignId)
        .eq("status", "pending");

      type InfRow = { id: string; influencer_id: string; status: string; tracking_number: string | null; content_url: string | null; revision_note: string | null };
      type AppRow = { id: string; influencer_id: string; message: string | null; status: string };

      const typedInfRows = (infRows as InfRow[]) ?? [];
      const typedAppRows = (appRows as AppRow[]) ?? [];

      const allIds = [
        ...typedInfRows.map((r) => r.influencer_id),
        ...typedAppRows.map((r) => r.influencer_id),
      ];
      const uniqueIds = [...new Set(allIds)];

      let profileMap: Map<string, InfluencerProfile> = new Map();
      if (uniqueIds.length > 0) {
        const { data: profiles } = await (supabase.from("influencer_profiles") as ReturnType<typeof supabase.from>)
          .select(
            "id, user_id, name, avatar_url, bio, instagram_handle, tiktok_handle, twitter_handle, instagram_followers, tiktok_followers, twitter_followers, primary_platform, categories"
          )
          .in("user_id", uniqueIds);
        ((profiles as InfluencerProfile[]) ?? []).forEach((p) => profileMap.set(p.user_id, p));
      }

      setInfluencers(
        typedInfRows.map((r) => ({
          id: r.id,
          influencer_id: r.influencer_id,
          status: r.status as InfluencerCampaignStatus,
          tracking_number: r.tracking_number,
          content_url: r.content_url,
          revision_note: r.revision_note,
          profile: profileMap.get(r.influencer_id) ?? null,
        }))
      );

      setApplicants(
        typedAppRows.map((r) => ({
          id: r.id,
          influencer_id: r.influencer_id,
          message: r.message,
          profile: profileMap.get(r.influencer_id) ?? null,
        }))
      );

      setLoading(false);
      } catch {
        setNotFound(true);
        setLoading(false);
      }
    }

    fetchData();
  }, [campaignId]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-400 text-sm">로딩 중...</div>
      </div>
    );
  }

  if (notFound || !campaign) {
    return (
      <div className="p-8 text-center text-slate-500">
        캠페인을 찾을 수 없습니다.
      </div>
    );
  }

  const updateInfluencerStatus = async (
    rowId: string,
    status: InfluencerCampaignStatus,
    extra?: { tracking_number?: string; revision_note?: string }
  ) => {
    const supabase = createClient();
    await (supabase.from("campaign_influencers") as ReturnType<typeof supabase.from>)
      .update({ status, updated_at: new Date().toISOString(), ...extra })
      .eq("id", rowId);

    setInfluencers((prev) =>
      prev.map((ci) => (ci.id === rowId ? { ...ci, status, ...extra } : ci))
    );
  };

  const handleApproveApplicant = async (appId: string, influencerId: string) => {
    const supabase = createClient();
    const now = new Date().toISOString();
    const applicant = applicants.find((a) => a.id === appId);
    if (!applicant) return;

    await (supabase.from("campaign_applications") as ReturnType<typeof supabase.from>)
      .update({ status: "approved", reviewed_at: now })
      .eq("id", appId);

    const { data: newRow } = await (supabase.from("campaign_influencers") as ReturnType<typeof supabase.from>)
      .insert({ campaign_id: campaignId, influencer_id: influencerId, status: "selected" })
      .select("id, influencer_id, status, tracking_number, content_url, revision_note")
      .single();

    if (newRow) {
      const row = newRow as { id: string; influencer_id: string };
      setInfluencers((prev) => [
        ...prev,
        {
          id: row.id,
          influencer_id: row.influencer_id,
          status: "selected" as InfluencerCampaignStatus,
          tracking_number: null,
          content_url: null,
          revision_note: null,
          profile: applicant.profile,
        },
      ]);
    }
    setApplicants((prev) => prev.filter((a) => a.id !== appId));
    setSelectedInf(null);
  };

  const handleRejectApplicant = async (appId: string) => {
    const supabase = createClient();
    await (supabase.from("campaign_applications") as ReturnType<typeof supabase.from>)
      .update({ status: "rejected", reviewed_at: new Date().toISOString() })
      .eq("id", appId);
    setApplicants((prev) => prev.filter((a) => a.id !== appId));
    setSelectedInf(null);
  };

  const openApplicantSheet = (appId: string) => {
    const app = applicants.find((a) => a.id === appId);
    if (app?.profile) {
      setSelectedInf(mapToSheetInfluencer(app.profile));
      setSheetMode("approve");
      setActiveApplicantId(appId);
    }
  };

  const openViewSheet = (profile: InfluencerProfile) => {
    setSelectedInf(mapToSheetInfluencer(profile));
    setSheetMode("view");
  };

  const toggleReview = (rowId: string) => {
    setReviewState((prev) => ({
      ...prev,
      [rowId]: { open: !prev[rowId]?.open, revisionNote: prev[rowId]?.revisionNote ?? "" },
    }));
  };

  const completedCount = influencers.filter((i) => ["final_ok", "settled"].includes(i.status)).length;
  const totalBudget = campaign.recruit_count * campaign.budget_per_influencer;
  const budgetSpent = completedCount * campaign.budget_per_influencer;
  const submittedForReview = influencers.filter((i) => i.status === "submitted");

  const pipelineSteps: InfluencerCampaignStatus[] = ["selected", "shipped", "received", "submitted", "final_ok"];

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/brand/campaigns" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          캠페인 목록
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-700 font-medium">{campaign.product_name}</span>
      </div>

      {/* Campaign header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-xl font-bold text-slate-900">{campaign.product_name}</h1>
              <Badge variant="secondary">{campaign.category}</Badge>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">{campaign.description}</p>

            {campaign.guidelines.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  콘텐츠 가이드라인
                </div>
                <div className="flex flex-wrap gap-2">
                  {campaign.guidelines.map((g, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5"
                    >
                      <FileText className="w-3 h-3 text-slate-400" />
                      {g}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 space-y-3 text-right min-w-[160px]">
            <div>
              <div className="text-xs text-slate-400 mb-0.5">타겟 국가</div>
              <div className="text-sm font-semibold text-slate-700">
                {campaign.target_countries.join(", ")}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-0.5">타겟 연령</div>
              <div className="text-sm font-semibold text-slate-700">
                {campaign.target_age_min}~{campaign.target_age_max}세
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-0.5">1인당 단가</div>
              <div className="text-lg font-bold text-indigo-600">
                {formatCurrency(campaign.budget_per_influencer)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-0.5">콘텐츠 마감</div>
              <div className="text-sm font-semibold text-slate-700">{campaign.content_deadline}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "총 예산",
            value: formatCurrency(totalBudget),
            icon: Wallet,
            color: "text-slate-700",
            bg: "bg-slate-50",
            urgent: false,
          },
          {
            label: "확정 인플루언서",
            value: `${influencers.length}/${campaign.recruit_count}명`,
            icon: Users,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            urgent: false,
          },
          {
            label: "검수 대기",
            value: `${submittedForReview.length}건`,
            icon: Eye,
            color: "text-amber-600",
            bg: "bg-amber-50",
            urgent: submittedForReview.length > 0,
          },
          {
            label: "완료",
            value: `${completedCount}명`,
            icon: CheckCircle,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            urgent: false,
          },
        ].map((s) => (
          <Card key={s.label} className={`border-slate-200 ${s.urgent ? "border-amber-300" : ""}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">{s.label}</p>
                  <p className="text-lg font-bold text-slate-900">{s.value}</p>
                </div>
                <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: influencer pipeline (2/3) */}
        <div className="col-span-2 space-y-4">
          {/* Content pending review */}
          {submittedForReview.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-bold text-amber-700">
                  콘텐츠 검수 대기 ({submittedForReview.length}건)
                </h2>
              </div>
              <div className="space-y-3">
                {submittedForReview.map((ci) => (
                  <div key={ci.id} className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar size="md">
                        <AvatarImage src={ci.profile?.avatar_url ?? ""} />
                        <AvatarFallback>{ci.profile?.name?.[0] ?? "?"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{ci.profile?.name ?? "알 수 없음"}</span>
                          <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full border border-amber-300">
                            검수 대기
                          </span>
                        </div>
                      </div>
                    </div>

                    {ci.content_url && (
                      <div className="flex items-center gap-2 bg-white border border-amber-200 rounded-lg px-3 py-2.5 mb-4">
                        <ExternalLink className="w-4 h-4 text-indigo-500 shrink-0" />
                        <a
                          href={ci.content_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:underline truncate flex-1"
                        >
                          {ci.content_url}
                        </a>
                        <a
                          href={ci.content_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-md px-2 py-1 hover:bg-indigo-50 transition-colors"
                        >
                          열기
                        </a>
                      </div>
                    )}

                    <div className="mb-4">
                      <div className="text-xs font-semibold text-slate-500 mb-2">가이드라인 체크리스트</div>
                      <div className="space-y-1.5">
                        {campaign.guidelines.map((g, i) => (
                          <label key={i} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="w-3.5 h-3.5 accent-indigo-600" />
                            <span className="text-xs text-slate-600">{g}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {reviewState[ci.id]?.open && (
                      <div className="mb-3">
                        <textarea
                          className="w-full text-sm border border-red-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none bg-white"
                          rows={3}
                          placeholder="수정 요청 사항을 구체적으로 입력해주세요"
                          value={reviewState[ci.id]?.revisionNote ?? ""}
                          onChange={(e) =>
                            setReviewState((prev) => ({
                              ...prev,
                              [ci.id]: { ...prev[ci.id], revisionNote: e.target.value },
                            }))
                          }
                        />
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          if (!reviewState[ci.id]?.open) {
                            toggleReview(ci.id);
                          } else {
                            updateInfluencerStatus(ci.id, "revision", {
                              revision_note: reviewState[ci.id]?.revisionNote,
                            });
                          }
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-all"
                      >
                        <RotateCcw className="w-4 h-4" />
                        {reviewState[ci.id]?.open ? "수정 요청 보내기" : "수정 요청"}
                      </button>
                      <button
                        onClick={() => updateInfluencerStatus(ci.id, "final_ok")}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all"
                      >
                        <CheckCircle className="w-4 h-4" />
                        최종 승인
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All influencers */}
          <div>
            <h2 className="text-sm font-bold text-slate-700 mb-3">전체 인플루언서 현황</h2>

            {influencers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-200 rounded-xl">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-slate-300" />
                </div>
                <div className="text-sm font-medium text-slate-500 mb-1">확정된 인플루언서가 없습니다</div>
                <div className="text-xs text-slate-400">우측 지원자 목록에서 인플루언서를 승인하세요</div>
              </div>
            ) : (
              <div className="space-y-3">
                {influencers.map((ci) => {
                  const s = infStatusConfig[ci.status];
                  const currentStep = pipelineSteps.indexOf(ci.status);

                  return (
                    <div
                      key={ci.id}
                      className={`bg-white border rounded-xl p-5 transition-all ${
                        ci.status === "revision"
                          ? "border-red-200 bg-red-50/30"
                          : ci.status === "final_ok"
                          ? "border-emerald-200 bg-emerald-50/20"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {ci.profile ? (
                          <button onClick={() => openViewSheet(ci.profile!)}>
                            <Avatar size="md" className="hover:ring-2 hover:ring-indigo-300 transition-all">
                              <AvatarImage src={ci.profile.avatar_url ?? ""} />
                              <AvatarFallback>{ci.profile.name[0]}</AvatarFallback>
                            </Avatar>
                          </button>
                        ) : (
                          <Avatar size="md">
                            <AvatarFallback>?</AvatarFallback>
                          </Avatar>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {ci.profile ? (
                              <button
                                onClick={() => openViewSheet(ci.profile!)}
                                className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors text-sm"
                              >
                                {ci.profile.name}
                              </button>
                            ) : (
                              <span className="font-semibold text-slate-400 text-sm">알 수 없음</span>
                            )}
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${s.color} ${s.bg} border ${s.border}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                              {s.label}
                            </span>
                            {ci.status === "revision" && ci.revision_note && (
                              <span className="text-xs text-red-500 flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                수정 요청 발송
                              </span>
                            )}
                          </div>

                          {ci.profile && (
                            <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                              {ci.profile.instagram_followers != null && (
                                <span>
                                  {formatNumber(
                                    (ci.profile.instagram_followers ?? 0) +
                                    (ci.profile.tiktok_followers ?? 0) +
                                    (ci.profile.twitter_followers ?? 0)
                                  )}{" "}
                                  팔로워
                                </span>
                              )}
                              {ci.profile.primary_platform && (
                                <span className="text-indigo-500 font-medium">{ci.profile.primary_platform}</span>
                              )}
                            </div>
                          )}

                          {/* Pipeline step dots */}
                          <div className="flex items-center gap-1 mb-3">
                            {pipelineSteps.map((step, idx) => {
                              const done = idx <= currentStep;
                              const current = idx === currentStep;
                              return (
                                <div key={step} className="flex items-center">
                                  <div
                                    className={`w-2 h-2 rounded-full transition-all ${
                                      current
                                        ? `${s.dot} ring-2 ring-offset-1 ${s.dot.replace("bg-", "ring-")}`
                                        : done
                                        ? "bg-indigo-400"
                                        : "bg-slate-200"
                                    }`}
                                  />
                                  {idx < pipelineSteps.length - 1 && (
                                    <div className={`w-6 h-px mx-0.5 ${done ? "bg-indigo-300" : "bg-slate-200"}`} />
                                  )}
                                </div>
                              );
                            })}
                            <span className="ml-2 text-[10px] text-slate-400">
                              {["배송 준비", "배송 중", "수령", "검수 대기", "완료"][currentStep >= 0 ? currentStep : 0]}
                            </span>
                          </div>

                          {ci.tracking_number && (
                            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-2.5 py-2 mb-2 w-fit">
                              <Truck className="w-3.5 h-3.5 text-blue-500" />
                              <span className="font-mono font-medium text-slate-700">{ci.tracking_number}</span>
                            </div>
                          )}

                          {ci.content_url && ci.status !== "submitted" && (
                            <a
                              href={ci.content_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-indigo-500 hover:underline"
                            >
                              <ExternalLink className="w-3 h-3" />
                              게시물 보기
                            </a>
                          )}
                        </div>

                        {/* Action button per status */}
                        <div className="shrink-0">
                          {ci.status === "selected" && (
                            <div className="space-y-2">
                              <div className="text-xs text-slate-400 mb-1">운송장 입력</div>
                              <input
                                className="w-40 text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 font-mono"
                                placeholder="운송장 번호"
                                value={trackingInputs[ci.id] ?? ""}
                                onChange={(e) =>
                                  setTrackingInputs((prev) => ({ ...prev, [ci.id]: e.target.value }))
                                }
                              />
                              <button
                                onClick={() =>
                                  updateInfluencerStatus(ci.id, "shipped", {
                                    tracking_number: trackingInputs[ci.id],
                                  })
                                }
                                className="w-full text-xs py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-1"
                              >
                                <Truck className="w-3 h-3" />
                                발송 완료
                              </button>
                            </div>
                          )}
                          {ci.status === "shipped" && (
                            <button
                              onClick={() => updateInfluencerStatus(ci.id, "received")}
                              className="text-xs px-3 py-2 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-medium transition-all"
                            >
                              수령 확인
                            </button>
                          )}
                          {ci.status === "final_ok" && (
                            <button
                              onClick={() => updateInfluencerStatus(ci.id, "settled")}
                              className="text-xs px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-semibold transition-all"
                            >
                              정산 처리
                            </button>
                          )}
                          {ci.status === "settled" && (
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              정산 완료
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column: applicants + timeline + budget */}
        <div className="col-span-1 space-y-4">
          {/* Applicants */}
          {applicants.length > 0 ? (
            <Card className="border-indigo-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  지원자 검토
                  <span className="ml-auto text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
                    {applicants.length}명
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {applicants.map((app) => (
                  <div
                    key={app.id}
                    className="border border-slate-200 rounded-xl p-3 hover:border-indigo-200 transition-all"
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <Avatar size="sm">
                        <AvatarImage src={app.profile?.avatar_url ?? ""} />
                        <AvatarFallback>{app.profile?.name?.[0] ?? "?"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {app.profile?.name ?? "알 수 없음"}
                        </div>
                        {app.profile?.primary_platform && (
                          <div className="text-xs text-slate-400">{app.profile.primary_platform}</div>
                        )}
                      </div>
                    </div>

                    {app.profile && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                        <span>
                          {formatNumber(
                            (app.profile.instagram_followers ?? 0) +
                            (app.profile.tiktok_followers ?? 0) +
                            (app.profile.twitter_followers ?? 0)
                          )}{" "}
                          팔로워
                        </span>
                      </div>
                    )}

                    {app.message && (
                      <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-2 mb-3 line-clamp-2 leading-relaxed">
                        {app.message}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => openApplicantSheet(app.id)}
                        className="flex-1 text-xs py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium transition-all"
                      >
                        상세 보기
                      </button>
                      <button
                        onClick={() => handleApproveApplicant(app.id, app.influencer_id)}
                        className="flex-1 text-xs py-1.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all"
                      >
                        승인
                      </button>
                      <button
                        onClick={() => handleRejectApplicant(app.id)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-slate-400" />
                  지원자 검토
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Megaphone className="w-7 h-7 text-slate-200 mb-2" />
                  <div className="text-xs text-slate-400">아직 지원자가 없습니다</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Campaign timeline */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                캠페인 일정
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {(() => {
                const today = new Date().toISOString().split("T")[0];
                const steps = [
                  { label: "모집 시작", date: campaign.recruit_start_date },
                  { label: "모집 마감", date: campaign.recruit_deadline },
                  { label: "배송 날짜", date: campaign.shipping_date },
                  { label: "콘텐츠 마감", date: campaign.content_deadline },
                ];
                return (
                  <div className="relative">
                    <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-100" />
                    <div className="space-y-3">
                      {steps.map((item, i) => {
                        const isPast = item.date <= today;
                        const isCurrent = !isPast && (i === 0 || steps[i - 1].date <= today);
                        return (
                          <div key={i} className="flex items-center gap-3 relative">
                            <div
                              className={`w-3.5 h-3.5 rounded-full shrink-0 border-2 z-10 ${
                                isPast
                                  ? "bg-indigo-500 border-indigo-500"
                                  : isCurrent
                                  ? "bg-white border-indigo-400"
                                  : "bg-white border-slate-200"
                              }`}
                            />
                            <div className="flex-1 flex justify-between text-xs">
                              <span className={isPast || isCurrent ? "text-slate-700 font-medium" : "text-slate-400"}>
                                {item.label}
                              </span>
                              <span
                                className={`font-medium tabular-nums ${
                                  isPast ? "text-indigo-600" : isCurrent ? "text-indigo-500" : "text-slate-400"
                                }`}
                              >
                                {item.date}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Budget breakdown */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Wallet className="w-4 h-4 text-slate-400" />
                예산 현황
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">총 예산</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(totalBudget)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">확정 인원</span>
                  <span className="font-semibold text-slate-900">
                    {influencers.length}명 × {formatCurrency(campaign.budget_per_influencer)}
                  </span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between text-sm">
                  <span className="text-slate-500">집행 완료</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(budgetSpent)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">잔여 예산</span>
                  <span className="font-semibold text-slate-700">
                    {formatCurrency(Math.max(totalBudget - influencers.length * campaign.budget_per_influencer, 0))}
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${totalBudget > 0 ? (budgetSpent / totalBudget) * 100 : 0}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  집행률 {totalBudget > 0 ? Math.round((budgetSpent / totalBudget) * 100) : 0}%
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Influencer detail sheet */}
      {selectedInf && (
        <InfluencerDetailSheet
          influencer={selectedInf}
          onClose={() => setSelectedInf(null)}
          mode={sheetMode}
          applicantMessage={
            sheetMode === "approve"
              ? applicants.find((a) => a.id === activeApplicantId)?.message ?? undefined
              : undefined
          }
          onApprove={() =>
            activeApplicantId &&
            handleApproveApplicant(activeApplicantId, applicants.find((a) => a.id === activeApplicantId)?.influencer_id ?? "")
          }
          onReject={() => activeApplicantId && handleRejectApplicant(activeApplicantId)}
        />
      )}
    </div>
  );
}
