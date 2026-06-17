"use client";

import { dummyBrandCampaigns } from "@/lib/dummy-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  TrendingUp,
  Users,
  Eye,
  Heart,
  DollarSign,
  BarChart2,
  Target,
  Zap,
} from "lucide-react";

function formatCurrency(n: number) {
  return `${(n / 10000).toFixed(0)}만원`;
}

function formatNumber(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`;
  return n.toLocaleString();
}

const mockMetrics = {
  totalReach: 312000,
  totalEngagements: 16800,
  avgEngagementRate: 5.38,
  totalSpent: 4240000,
  costPerEngagement: 252,
  contentCount: 7,
  finalApproved: 3,
  campaignCount: 3,
};

export default function AnalyticsPage() {
  const topInfluencers = dummyBrandCampaigns
    .flatMap((c) => c.influencers)
    .filter((ci) => ["final_ok", "submitted"].includes(ci.status))
    .sort((a, b) => b.influencer.engagementRate - a.influencer.engagementRate)
    .slice(0, 5);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">성과 분석</h1>
        <p className="text-sm text-slate-500 mt-1">2026년 5~6월 캠페인 종합 성과</p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "예상 총 도달",
            value: formatNumber(mockMetrics.totalReach),
            sub: "누적 팔로워 기준",
            icon: Eye,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
          },
          {
            label: "총 인게이지먼트",
            value: formatNumber(mockMetrics.totalEngagements),
            sub: `평균 참여율 ${mockMetrics.avgEngagementRate}%`,
            icon: Heart,
            color: "text-pink-600",
            bg: "bg-pink-50",
          },
          {
            label: "집행 비용",
            value: formatCurrency(mockMetrics.totalSpent),
            sub: "정산 완료 기준",
            icon: DollarSign,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "CPE (인게이지먼트당 비용)",
            value: `${mockMetrics.costPerEngagement}원`,
            sub: "업계 평균 대비 -38%",
            icon: Target,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
        ].map((s) => (
          <Card key={s.label} className="border-slate-200">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
                </div>
                <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Campaign performance */}
        <div className="col-span-2 space-y-4">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-slate-400" />
                캠페인별 성과
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "비타C 브라이트닝 앰플", reach: 87400, engagement: 4.2, content: 1, status: "진행 중", color: "bg-indigo-500" },
                { name: "UV 쉴드 선크림 SPF50+", reach: 224600, engagement: 5.5, content: 4, status: "검수 중", color: "bg-purple-500" },
                { name: "시카 수분 진정 크림", reach: 0, engagement: 0, content: 0, status: "모집 중", color: "bg-slate-300" },
              ].map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-800">{item.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-xs">도달 {formatNumber(item.reach)}</span>
                      <span className="text-emerald-600 text-xs font-semibold">참여율 {item.engagement}%</span>
                      <Badge variant="secondary" className="text-xs">{item.status}</Badge>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`${item.color} h-full rounded-full`}
                      style={{ width: `${(item.reach / 250000) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Content quality */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-slate-400" />
                미드티어 효율 비교
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: "참여율", mid: 5.38, mega: 1.2, unit: "%" },
                  { label: "CPE (인게이지먼트당 비용)", mid: 252, mega: 1840, unit: "원", reverse: true },
                  { label: "콘텐츠 신뢰도 지수", mid: 88, mega: 62, unit: "점" },
                ].map((item) => {
                  const better = item.reverse
                    ? item.mid < item.mega
                    : item.mid > item.mega;
                  const pct = item.reverse
                    ? Math.round(((item.mega - item.mid) / item.mega) * 100)
                    : Math.round(((item.mid - item.mega) / item.mega) * 100);
                  return (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                        <span className="font-medium text-slate-700">{item.label}</span>
                        <span className="text-emerald-600 font-semibold">
                          미드티어가 {pct}% {item.reverse ? "절감" : "높음"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 w-16">미드티어</span>
                            <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-indigo-500 h-full rounded-full"
                                style={{
                                  width: item.reverse
                                    ? `${(item.mid / item.mega) * 100}%`
                                    : `${(item.mid / (item.mid + item.mega)) * 100 * 1.6}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs font-bold text-indigo-700 w-16 text-right">
                              {item.mid.toLocaleString()}{item.unit}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 w-16">메가</span>
                            <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-slate-300 h-full rounded-full"
                                style={{
                                  width: item.reverse
                                    ? "100%"
                                    : `${(item.mega / (item.mid + item.mega)) * 100 * 1.6}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-slate-400 w-16 text-right">
                              {item.mega.toLocaleString()}{item.unit}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top performing influencers */}
        <div className="space-y-4">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-400" />
                높은 성과 인플루언서
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topInfluencers.map((ci, i) => (
                <div key={ci.influencer.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-300 w-4">{i + 1}</span>
                  <Avatar size="sm">
                    <AvatarImage src={ci.influencer.avatar} />
                    <AvatarFallback>{ci.influencer.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-800 truncate">{ci.influencer.name}</div>
                    <div className="text-[10px] text-slate-400">{ci.influencer.handle}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-600">{ci.influencer.engagementRate}%</div>
                    <div className="text-[10px] text-slate-400">참여율</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-sm">카테고리별 참여율</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { cat: "스킨케어", rate: 5.8, count: 4 },
                { cat: "K-뷰티", rate: 5.5, count: 2 },
                { cat: "메이크업", rate: 5.1, count: 2 },
                { cat: "뷰티", rate: 4.7, count: 5 },
                { cat: "라이프스타일", rate: 3.9, count: 2 },
              ].map((item) => (
                <div key={item.cat} className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 w-20">{item.cat}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-400 h-full rounded-full"
                      style={{ width: `${(item.rate / 7) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 w-10 text-right">{item.rate}%</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
