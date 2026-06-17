"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  dummyBrandCampaigns,
  type CampaignInfluencer,
  type CampaignInfluencerStatus,
} from "@/lib/dummy-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InfluencerDetailSheet } from "@/components/brand/influencer-detail-sheet";
import { dummyInfluencers } from "@/lib/dummy-data";
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
  Star,
  TrendingUp,
  Sparkles,
} from "lucide-react";

function formatCurrency(n: number) {
  return `${(n / 10000).toFixed(0)}만원`;
}

function formatNumber(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`;
  return n.toLocaleString();
}

const infStatusConfig: Record<
  CampaignInfluencerStatus,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  approved: {
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

type ReviewState = {
  [infId: string]: { open: boolean; revisionNote: string };
};

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;
  const campaign = dummyBrandCampaigns.find((c) => c.id === campaignId);

  const [influencers, setInfluencers] = useState<CampaignInfluencer[]>(
    campaign?.influencers ?? []
  );
  const [applicants, setApplicants] = useState(campaign?.pendingApplicants ?? []);
  const [selectedInf, setSelectedInf] = useState<typeof dummyInfluencers[0] | null>(null);
  const [sheetMode, setSheetMode] = useState<"view" | "approve">("view");
  const [activeApplicantId, setActiveApplicantId] = useState<string | null>(null);
  const [reviewState, setReviewState] = useState<ReviewState>({});
  const [trackingInputs, setTrackingInputs] = useState<Record<string, { number: string; courier: string }>>({});

  if (!campaign) {
    return (
      <div className="p-8 text-center text-slate-500">
        캠페인을 찾을 수 없습니다.
      </div>
    );
  }

  const updateInfluencerStatus = (infId: string, status: CampaignInfluencerStatus, extra?: Partial<CampaignInfluencer>) => {
    setInfluencers((prev) =>
      prev.map((ci) =>
        ci.influencer.id === infId ? { ...ci, status, ...extra } : ci
      )
    );
  };

  const handleApproveApplicant = (appId: string, infId: string) => {
    const applicant = applicants.find((a) => a.id === appId);
    if (!applicant) return;
    setInfluencers((prev) => [
      ...prev,
      { influencer: applicant.influencer, status: "approved", payment: campaign.budgetPerInfluencer },
    ]);
    setApplicants((prev) => prev.filter((a) => a.id !== appId));
    setSelectedInf(null);
  };

  const handleRejectApplicant = (appId: string) => {
    setApplicants((prev) => prev.filter((a) => a.id !== appId));
    setSelectedInf(null);
  };

  const openApplicantSheet = (appId: string) => {
    const app = applicants.find((a) => a.id === appId);
    if (app) {
      setSelectedInf(app.influencer);
      setSheetMode("approve");
      setActiveApplicantId(appId);
    }
  };

  const openViewSheet = (inf: typeof dummyInfluencers[0]) => {
    setSelectedInf(inf);
    setSheetMode("view");
  };

  const toggleReview = (infId: string) => {
    setReviewState((prev) => ({
      ...prev,
      [infId]: { open: !prev[infId]?.open, revisionNote: prev[infId]?.revisionNote ?? "" },
    }));
  };

  const completedCount = influencers.filter((i) => ["final_ok", "settled"].includes(i.status)).length;
  const budgetSpent = completedCount * campaign.budgetPerInfluencer;
  const submittedForReview = influencers.filter((i) => i.status === "submitted");

  const pipelineSteps: CampaignInfluencerStatus[] = ["approved", "shipped", "received", "submitted", "final_ok"];

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/brand/campaigns" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          캠페인 목록
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-700 font-medium">{campaign.productName}</span>
      </div>

      {/* Campaign header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-xl font-bold text-slate-900">{campaign.productName}</h1>
              <Badge variant="secondary">{campaign.category}</Badge>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">{campaign.description}</p>

            {/* Guidelines */}
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">콘텐츠 가이드라인</div>
              <div className="flex flex-wrap gap-2">
                {campaign.guidelines.map((g, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5">
                    <FileText className="w-3 h-3 text-slate-400" />
                    {g}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="shrink-0 space-y-3 text-right min-w-[160px]">
            <div>
              <div className="text-xs text-slate-400 mb-0.5">타겟</div>
              <div className="text-sm font-semibold text-slate-700">{campaign.targetCountry} · {campaign.targetAge}세</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-0.5">1인당 단가</div>
              <div className="text-lg font-bold text-indigo-600">{formatCurrency(campaign.budgetPerInfluencer)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-0.5">콘텐츠 마감</div>
              <div className="text-sm font-semibold text-slate-700">{campaign.contentDeadline}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Budget bar + mini stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "총 예산",
            value: formatCurrency(campaign.totalBudget),
            icon: Wallet,
            color: "text-slate-700",
            bg: "bg-slate-50",
          },
          {
            label: "확정 인플루언서",
            value: `${influencers.length}/${campaign.recruitCount}명`,
            icon: Users,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
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
          },
        ].map((s) => (
          <Card
            key={s.label}
            className={`border-slate-200 ${s.urgent ? "border-amber-300" : ""}`}
          >
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
        {/* Influencer pipeline — left 2/3 */}
        <div className="col-span-2 space-y-4">
          {/* Section: Content pending review — highlighted */}
          {submittedForReview.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-bold text-amber-700">콘텐츠 검수 대기 ({submittedForReview.length}건)</h2>
              </div>
              <div className="space-y-3">
                {submittedForReview.map((ci) => (
                  <div
                    key={ci.influencer.id}
                    className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar size="md">
                        <AvatarImage src={ci.influencer.avatar} />
                        <AvatarFallback>{ci.influencer.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{ci.influencer.name}</span>
                          <span className="text-sm text-slate-400">{ci.influencer.handle}</span>
                          <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full border border-amber-300">
                            검수 대기
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">제출일: {ci.submittedAt}</div>
                      </div>
                    </div>

                    {/* Submitted link */}
                    <div className="flex items-center gap-2 bg-white border border-amber-200 rounded-lg px-3 py-2.5 mb-4">
                      <ExternalLink className="w-4 h-4 text-indigo-500 shrink-0" />
                      <a
                        href={ci.submittedLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:underline truncate flex-1"
                      >
                        {ci.submittedLink}
                      </a>
                      <a
                        href={ci.submittedLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-md px-2 py-1 hover:bg-indigo-50 transition-colors"
                      >
                        열기
                      </a>
                    </div>

                    {/* Checklist */}
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

                    {/* Revision note (toggle) */}
                    {reviewState[ci.influencer.id]?.open && (
                      <div className="mb-3">
                        <textarea
                          className="w-full text-sm border border-red-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none bg-white"
                          rows={3}
                          placeholder="수정 요청 사항을 구체적으로 입력해주세요 (예: 해시태그 #UV쉴드 누락, SPF 수치 언급 필요)"
                          value={reviewState[ci.influencer.id]?.revisionNote ?? ""}
                          onChange={(e) =>
                            setReviewState((prev) => ({
                              ...prev,
                              [ci.influencer.id]: {
                                ...prev[ci.influencer.id],
                                revisionNote: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          if (!reviewState[ci.influencer.id]?.open) {
                            toggleReview(ci.influencer.id);
                          } else {
                            updateInfluencerStatus(ci.influencer.id, "revision", {
                              note: reviewState[ci.influencer.id]?.revisionNote,
                            });
                          }
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-all"
                      >
                        <RotateCcw className="w-4 h-4" />
                        {reviewState[ci.influencer.id]?.open ? "수정 요청 보내기" : "수정 요청"}
                      </button>
                      <button
                        onClick={() => updateInfluencerStatus(ci.influencer.id, "final_ok")}
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

          {/* All influencers — pipeline view */}
          <div>
            <h2 className="text-sm font-bold text-slate-700 mb-3">전체 인플루언서 현황</h2>
            <div className="space-y-3">
              {influencers.map((ci) => {
                const s = infStatusConfig[ci.status];
                const currentStep = pipelineSteps.indexOf(ci.status);

                return (
                  <div
                    key={ci.influencer.id}
                    className={`bg-white border rounded-xl p-5 transition-all ${
                      ci.status === "revision" ? "border-red-200 bg-red-50/30" :
                      ci.status === "final_ok" ? "border-emerald-200 bg-emerald-50/20" :
                      "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button onClick={() => openViewSheet(ci.influencer)}>
                        <Avatar size="md" className="hover:ring-2 hover:ring-indigo-300 transition-all">
                          <AvatarImage src={ci.influencer.avatar} />
                          <AvatarFallback>{ci.influencer.name[0]}</AvatarFallback>
                        </Avatar>
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <button
                            onClick={() => openViewSheet(ci.influencer)}
                            className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors text-sm"
                          >
                            {ci.influencer.name}
                          </button>
                          <span className="text-xs text-slate-400">{ci.influencer.handle}</span>
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${s.color} ${s.bg} border ${s.border}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                            {s.label}
                          </span>
                          {ci.status === "revision" && ci.note && (
                            <span className="text-xs text-red-500 flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              수정 요청 발송
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {ci.influencer.rating}
                          </span>
                          <span>{formatNumber(ci.influencer.followers)} 팔로워</span>
                          <span className="text-emerald-600 font-medium">참여율 {ci.influencer.engagementRate}%</span>
                        </div>

                        {/* Pipeline step dots */}
                        <div className="flex items-center gap-1 mb-3">
                          {pipelineSteps.map((step, idx) => {
                            const stepConfig = infStatusConfig[step];
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
                                  <div
                                    className={`w-6 h-px mx-0.5 ${done ? "bg-indigo-300" : "bg-slate-200"}`}
                                  />
                                )}
                              </div>
                            );
                          })}
                          <span className="ml-2 text-[10px] text-slate-400">
                            {["배송 준비", "배송 중", "수령", "검수 대기", "완료"][currentStep >= 0 ? currentStep : 0]}
                          </span>
                        </div>

                        {/* Tracking */}
                        {ci.trackingNumber && (
                          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-2.5 py-2 mb-2 w-fit">
                            <Truck className="w-3.5 h-3.5 text-blue-500" />
                            <span>{ci.courier}</span>
                            <span className="font-mono font-medium text-slate-700">{ci.trackingNumber}</span>
                          </div>
                        )}

                        {/* Submitted link (non-review state) */}
                        {ci.submittedLink && ci.status !== "submitted" && (
                          <a
                            href={ci.submittedLink}
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
                        {ci.status === "approved" && (
                          <div className="space-y-2">
                            <div className="text-xs text-slate-400 mb-1">운송장 입력</div>
                            <div className="flex gap-1.5">
                              <input
                                className="w-28 text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                placeholder="택배사"
                                value={trackingInputs[ci.influencer.id]?.courier ?? ""}
                                onChange={(e) =>
                                  setTrackingInputs((prev) => ({
                                    ...prev,
                                    [ci.influencer.id]: { ...prev[ci.influencer.id], courier: e.target.value },
                                  }))
                                }
                              />
                              <input
                                className="w-36 text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 font-mono"
                                placeholder="운송장 번호"
                                value={trackingInputs[ci.influencer.id]?.number ?? ""}
                                onChange={(e) =>
                                  setTrackingInputs((prev) => ({
                                    ...prev,
                                    [ci.influencer.id]: { ...prev[ci.influencer.id], number: e.target.value },
                                  }))
                                }
                              />
                            </div>
                            <button
                              onClick={() =>
                                updateInfluencerStatus(ci.influencer.id, "shipped", {
                                  trackingNumber: trackingInputs[ci.influencer.id]?.number,
                                  courier: trackingInputs[ci.influencer.id]?.courier,
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
                            onClick={() => updateInfluencerStatus(ci.influencer.id, "received")}
                            className="text-xs px-3 py-2 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-medium transition-all"
                          >
                            수령 확인
                          </button>
                        )}
                        {ci.status === "final_ok" && (
                          <button
                            onClick={() => updateInfluencerStatus(ci.influencer.id, "settled")}
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
          </div>
        </div>

        {/* Right column: applicants + campaign info */}
        <div className="col-span-1 space-y-4">
          {/* Applicants */}
          {applicants.length > 0 && (
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
                        <AvatarImage src={app.influencer.avatar} />
                        <AvatarFallback>{app.influencer.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {app.influencer.name}
                        </div>
                        <div className="text-xs text-slate-400">{app.influencer.handle}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                      <span>{formatNumber(app.influencer.followers)} 팔로워</span>
                      <span className="text-emerald-600 font-medium">{app.influencer.engagementRate}%</span>
                    </div>

                    <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-2 mb-3 line-clamp-2 leading-relaxed">
                      {app.message}
                    </div>

                    <div className="flex items-center justify-between mb-2 text-xs">
                      <span className="text-slate-400">플랫폼 전용 단가</span>
                      <span className="font-bold text-indigo-600">
                        {formatCurrency(app.influencer.exclusiveRate)}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openApplicantSheet(app.id)}
                        className="flex-1 text-xs py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium transition-all"
                      >
                        상세 보기
                      </button>
                      <button
                        onClick={() => handleApproveApplicant(app.id, app.influencer.id)}
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
                  { label: "모집 시작", date: campaign.recruitStartDate },
                  { label: "모집 마감", date: campaign.recruitDeadline },
                  { label: "선정 마감", date: (() => {
                    const d = new Date(campaign.recruitDeadline);
                    d.setDate(d.getDate() + 1);
                    return d.toISOString().split("T")[0];
                  })() },
                  { label: "배송 날짜", date: campaign.shippingDate },
                  { label: "콘텐츠 마감", date: campaign.contentDeadline },
                ];
                return (
                  <div className="relative">
                    {/* 세로 연결선 */}
                    <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-100" />
                    <div className="space-y-3">
                      {steps.map((item, i) => {
                        const isPast = item.date <= today;
                        const isCurrent = !isPast && (i === 0 || steps[i - 1].date <= today);
                        return (
                          <div key={i} className="flex items-center gap-3 relative">
                            <div className={`w-3.5 h-3.5 rounded-full shrink-0 border-2 z-10 ${
                              isPast
                                ? "bg-indigo-500 border-indigo-500"
                                : isCurrent
                                ? "bg-white border-indigo-400"
                                : "bg-white border-slate-200"
                            }`} />
                            <div className="flex-1 flex justify-between text-xs">
                              <span className={isPast || isCurrent ? "text-slate-700 font-medium" : "text-slate-400"}>
                                {item.label}
                              </span>
                              <span className={`font-medium tabular-nums ${isPast ? "text-indigo-600" : isCurrent ? "text-indigo-500" : "text-slate-400"}`}>
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
                  <span className="font-semibold text-slate-900">{formatCurrency(campaign.totalBudget)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">확정 인원</span>
                  <span className="font-semibold text-slate-900">{influencers.length}명 × {formatCurrency(campaign.budgetPerInfluencer)}</span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between text-sm">
                  <span className="text-slate-500">집행 완료</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(budgetSpent)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">잔여 예산</span>
                  <span className="font-semibold text-slate-700">{formatCurrency(campaign.totalBudget - influencers.length * campaign.budgetPerInfluencer)}</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${(budgetSpent / campaign.totalBudget) * 100}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  집행률 {Math.round((budgetSpent / campaign.totalBudget) * 100)}%
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
              ? applicants.find((a) => a.id === activeApplicantId)?.message
              : undefined
          }
          onApprove={() => activeApplicantId && handleApproveApplicant(activeApplicantId, selectedInf.id)}
          onReject={() => activeApplicantId && handleRejectApplicant(activeApplicantId)}
        />
      )}
    </div>
  );
}
