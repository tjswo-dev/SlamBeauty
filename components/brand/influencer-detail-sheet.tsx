"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { dummyInfluencers } from "@/lib/dummy-data";
import {
  X,
  Star,
  MapPin,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  MessageSquare,
  ExternalLink,
  ThumbsUp,
  BarChart2,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Influencer = typeof dummyInfluencers[0];

interface InfluencerDetailSheetProps {
  influencer: Influencer | null;
  onClose: () => void;
  onRequest?: (id: string) => void;
  mode?: "view" | "approve";
  applicantMessage?: string;
  onApprove?: () => void;
  onReject?: () => void;
}

function formatNumber(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`;
  return n.toLocaleString();
}

function formatCurrency(n: number) {
  return `${(n / 10000).toFixed(0)}만원`;
}

export function InfluencerDetailSheet({
  influencer,
  onClose,
  onRequest,
  mode = "view",
  applicantMessage,
  onApprove,
  onReject,
}: InfluencerDetailSheetProps) {
  const [requested, setRequested] = useState(false);

  if (!influencer) return null;

  const discount = Math.round(
    (1 - influencer.exclusiveRate / influencer.regularRate) * 100
  );

  const handleRequest = () => {
    setRequested(true);
    onRequest?.(influencer.id);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed right-0 top-0 h-full w-[480px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <span className="text-sm font-semibold text-slate-700">인플루언서 상세 프로필</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Profile hero */}
          <div className="px-6 py-6 border-b border-slate-100">
            <div className="flex items-start gap-4">
              <Avatar size="lg">
                <AvatarImage src={influencer.avatar} alt={influencer.name} />
                <AvatarFallback>{influencer.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-slate-900">{influencer.name}</h2>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-semibold text-slate-700">{influencer.rating}</span>
                  </div>
                </div>
                <div className="text-sm text-slate-500 mb-2">{influencer.handle}</div>
                <div className="flex flex-wrap gap-1.5">
                  {influencer.platforms.map((p) => (
                    <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                  ))}
                  {influencer.secondaryConsent && (
                    <Badge className="text-xs bg-emerald-100 text-emerald-700">2차 활용 동의</Badge>
                  )}
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-lg px-3 py-2.5">
              {influencer.bio}
            </p>
          </div>

          {/* Key metrics */}
          <div className="px-6 py-5 border-b border-slate-100">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">핵심 지표</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "팔로워",
                  value: formatNumber(influencer.followers),
                  icon: Users,
                  color: "text-indigo-600",
                  bg: "bg-indigo-50",
                },
                {
                  label: "참여율",
                  value: `${influencer.engagementRate}%`,
                  icon: TrendingUp,
                  color: "text-emerald-600",
                  bg: "bg-emerald-50",
                  note: "업계 평균 2.8%",
                },
                {
                  label: "평균 좋아요",
                  value: formatNumber(influencer.avgLikes),
                  icon: ThumbsUp,
                  color: "text-purple-600",
                  bg: "bg-purple-50",
                },
                {
                  label: "평균 댓글",
                  value: formatNumber(influencer.avgComments),
                  icon: MessageSquare,
                  color: "text-amber-600",
                  bg: "bg-amber-50",
                },
                {
                  label: "완료 캠페인",
                  value: `${influencer.completedCampaigns}건`,
                  icon: CheckCircle,
                  color: "text-slate-600",
                  bg: "bg-slate-100",
                },
                {
                  label: "응답률",
                  value: `${influencer.responseRate}%`,
                  icon: Clock,
                  color: "text-purple-600",
                  bg: "bg-purple-50",
                },
              ].map((m) => (
                <div key={m.label} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", m.bg)}>
                    <m.icon className={cn("w-4 h-4", m.color)} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">{m.label}</div>
                    <div className="text-sm font-bold text-slate-900">{m.value}</div>
                    {m.note && <div className="text-[10px] text-slate-400">{m.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audience demographics */}
          <div className="px-6 py-5 border-b border-slate-100">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              <span className="flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5" />
                오디언스 분석
              </span>
            </h3>
            <div className="space-y-4">
              {/* Gender */}
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>성별</span>
                  <span className="font-medium">여성 {influencer.audienceGender.female}% / 남성 {influencer.audienceGender.male}%</span>
                </div>
                <div className="flex rounded-full overflow-hidden h-2">
                  <div
                    className="bg-purple-400 h-full"
                    style={{ width: `${influencer.audienceGender.female}%` }}
                  />
                  <div className="bg-indigo-300 h-full flex-1" />
                </div>
              </div>

              {/* Age */}
              <div>
                <div className="text-xs text-slate-500 mb-2">연령대 분포</div>
                <div className="space-y-1.5">
                  {Object.entries(influencer.audienceAge).map(([age, pct]) => (
                    <div key={age} className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-14 shrink-0">{age}세</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-600 w-8 text-right">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500">거주 국가:</span>
                <span className="font-medium text-slate-700">{influencer.countryLabel}</span>
              </div>
            </div>
          </div>

          {/* Categories & platforms */}
          <div className="px-6 py-5 border-b border-slate-100">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">카테고리 & 활동 플랫폼</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {influencer.categories.map((c) => (
                <Badge key={c} variant="default" className="text-xs">{c}</Badge>
              ))}
            </div>
            <div className="flex gap-2">
              {influencer.platforms.map((p) => (
                <span key={p} className="text-xs text-slate-600 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium">{p}</span>
              ))}
            </div>
          </div>

          {/* Portfolio */}
          {influencer.portfolio.length > 0 && (
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">과거 캠페인 실적</h3>
              <div className="space-y-2">
                {influencer.portfolio.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <div className="text-sm font-medium text-slate-700">{p.brand}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{p.result}</div>
                    </div>
                    <a
                      href={p.link}
                      className="p-1.5 rounded-lg hover:bg-white transition-colors text-slate-400 hover:text-indigo-500"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rate card */}
          <div className="px-6 py-5 border-b border-slate-100">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Rate Card</h3>
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs text-slate-400 mb-0.5">일반 단가</div>
                  <div className="text-base text-slate-500 line-through">{formatCurrency(influencer.regularRate)}</div>
                </div>
                <div className="text-slate-200 text-lg">→</div>
                <div className="text-right">
                  <div className="text-xs text-indigo-500 font-semibold mb-0.5">플랫폼 전용 단가</div>
                  <div className="text-2xl font-bold text-indigo-700">{formatCurrency(influencer.exclusiveRate)}</div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-indigo-200">
                <div className="flex items-center gap-1.5 text-xs text-emerald-700">
                  <Shield className="w-3.5 h-3.5" />
                  SlamBeauty 전용 할인
                </div>
                <span className="font-bold text-emerald-600 text-sm">{discount}% 절감</span>
              </div>
            </div>
          </div>

          {/* Applicant message (if review mode) */}
          {mode === "approve" && applicantMessage && (
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">지원 메시지</h3>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 leading-relaxed">
                &ldquo;{applicantMessage}&rdquo;
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
          {mode === "approve" ? (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                onClick={onReject}
              >
                거절
              </Button>
              <Button
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={onApprove}
              >
                <CheckCircle className="w-4 h-4" />
                승인하기
              </Button>
            </div>
          ) : requested ? (
            <div className="flex items-center justify-center gap-2 py-2 text-emerald-600 font-semibold">
              <CheckCircle className="w-4 h-4" />
              협업 요청이 전송되었습니다
            </div>
          ) : (
            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleRequest}
            >
              협업 요청 보내기
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
