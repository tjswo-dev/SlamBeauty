"use client";

import { useState, useMemo } from "react";
import { dummyInfluencers } from "@/lib/dummy-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InfluencerDetailSheet } from "@/components/brand/influencer-detail-sheet";
import {
  Star,
  MapPin,
  Users,
  TrendingUp,
  Check,
  CalendarDays,
  Clock,
  Filter,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Shield,
} from "lucide-react";

function formatNumber(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`;
  return n.toLocaleString();
}

function formatCurrency(n: number) {
  return `${(n / 10000).toFixed(0)}만원`;
}

const categoryOptions = ["전체", "뷰티", "K-뷰티", "스킨케어", "메이크업", "패션", "라이프스타일", "웰니스"];
const platformOptions = ["전체", "Instagram", "YouTube", "TikTok"];
const sortOptions = [
  { value: "engagement", label: "참여율 높은 순" },
  { value: "followers", label: "팔로워 많은 순" },
  { value: "rate_low", label: "단가 낮은 순" },
  { value: "rating", label: "평점 높은 순" },
];

const nextMonday = (() => {
  const d = new Date("2026-06-02");
  const day = d.getDay();
  const diff = (8 - day) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" });
})();

export default function MatchingPage() {
  const [activeTab, setActiveTab] = useState<"track1" | "track2">("track1");
  const [requestedIds, setRequestedIds] = useState<string[]>([]);
  const [selectedInf, setSelectedInf] = useState<typeof dummyInfluencers[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedPlatform, setSelectedPlatform] = useState("전체");
  const [sortBy, setSortBy] = useState("engagement");
  const [minFollowers, setMinFollowers] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleRequest = (id: string) => {
    setRequestedIds((prev) => [...prev, id]);
    setSelectedInf(null);
  };

  const filtered = useMemo(() => {
    let list = [...dummyInfluencers];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (inf) =>
          inf.name.toLowerCase().includes(q) ||
          inf.handle.toLowerCase().includes(q) ||
          inf.categories.some((c) => c.toLowerCase().includes(q))
      );
    }
    if (selectedCategory !== "전체") {
      list = list.filter((inf) => inf.categories.includes(selectedCategory));
    }
    if (selectedPlatform !== "전체") {
      list = list.filter((inf) => inf.platforms.includes(selectedPlatform));
    }
    if (minFollowers) {
      list = list.filter((inf) => inf.followers >= Number(minFollowers));
    }
    if (maxBudget) {
      list = list.filter((inf) => inf.exclusiveRate <= Number(maxBudget) * 10000);
    }

    list.sort((a, b) => {
      if (sortBy === "engagement") return b.engagementRate - a.engagementRate;
      if (sortBy === "followers") return b.followers - a.followers;
      if (sortBy === "rate_low") return a.exclusiveRate - b.exclusiveRate;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });

    return list;
  }, [searchQuery, selectedCategory, selectedPlatform, sortBy, minFollowers, maxBudget]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">인플루언서 매칭</h1>
          <p className="text-sm text-slate-500 mt-1">
            브랜드 타겟 국가와 거주 국가가 일치하는 인플루언서를 매주 추천합니다
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "track1", label: "Track 1 · 이번 주 추천", count: filtered.length },
          { key: "track2", label: "Track 2 · 지원자 검토", count: 3 },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as "track1" | "track2")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300"
            }`}
          >
            {tab.label}
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === tab.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {activeTab === "track1" && (
        <>
          {/* Update banner */}
          <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 mb-5">
            <div className="flex items-center gap-3">
              <CalendarDays className="w-4 h-4 text-indigo-500 shrink-0" />
              <div>
                <span className="text-sm font-semibold text-indigo-700">이번 주 추천 리스트</span>
                <span className="text-sm text-indigo-500 ml-2">({nextMonday} 업데이트 예정)</span>
              </div>
              <span className="flex items-center gap-1 text-xs text-indigo-400">
                <Clock className="w-3.5 h-3.5" />
                매주 월요일 오전 9시 갱신
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs text-indigo-600 font-medium">대한민국 거주 인플루언서</span>
            </div>
          </div>

          {/* Search & Filter bar */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="이름, 핸들, 카테고리 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              {categoryOptions.slice(1).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? "전체" : cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-all ${
                showFilters ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              상세 필터
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Advanced filters */}
          {showFilters && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500 whitespace-nowrap">최소 팔로워</label>
                <Input
                  type="number"
                  placeholder="10,000"
                  value={minFollowers}
                  onChange={(e) => setMinFollowers(e.target.value)}
                  className="w-28 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500 whitespace-nowrap">최대 예산 (만원)</label>
                <Input
                  type="number"
                  placeholder="80"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  className="w-24 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500">플랫폼</label>
                <div className="flex gap-1.5">
                  {platformOptions.map((p) => (
                    <button
                      key={p}
                      onClick={() => setSelectedPlatform(p)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        selectedPlatform === p
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("전체");
                  setSelectedPlatform("전체");
                  setMinFollowers("");
                  setMaxBudget("");
                }}
                className="text-xs text-slate-400 hover:text-slate-600 ml-auto"
              >
                초기화
              </button>
            </div>
          )}

          <div className="text-xs text-slate-400 mb-3">{filtered.length}명 표시 중</div>

          {/* Influencer list */}
          <div className="space-y-3">
            {filtered.map((inf, idx) => {
              const discount = Math.round((1 - inf.exclusiveRate / inf.regularRate) * 100);
              const isRequested = requestedIds.includes(inf.id);

              return (
                <div
                  key={inf.id}
                  className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex items-center gap-4 hover:border-indigo-200 hover:shadow-sm transition-all group"
                >
                  <div className="text-sm font-bold text-slate-300 w-6 text-center shrink-0">
                    {idx + 1}
                  </div>

                  <button onClick={() => setSelectedInf(inf)}>
                    <Avatar size="lg" className="hover:ring-2 hover:ring-indigo-300 transition-all">
                      <AvatarFallback>{inf.name[0]}</AvatarFallback>
                    </Avatar>
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <button
                        onClick={() => setSelectedInf(inf)}
                        className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors"
                      >
                        {inf.name}
                      </button>
                      <span className="text-sm text-slate-400">{inf.handle}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-semibold text-slate-600">{inf.rating}</span>
                      </div>
                      {inf.secondaryConsent && (
                        <Badge className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-1.5">
                          2차 활용 동의
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {inf.countryLabel}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {formatNumber(inf.followers)}
                      </span>
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {inf.engagementRate}%
                      </span>
                      <div className="flex gap-1">
                        {inf.platforms.map((p) => (
                          <span key={p} className="text-xs bg-slate-100 text-slate-500 rounded px-1.5 py-0.5">
                            {p}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-1">
                        {inf.categories.slice(0, 2).map((cat) => (
                          <Badge key={cat} variant="secondary" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Rate */}
                  <div className="text-right shrink-0">
                    <div className="text-xs text-slate-400 mb-0.5 flex items-center gap-1 justify-end">
                      <Shield className="w-3 h-3 text-indigo-400" />
                      플랫폼 전용
                    </div>
                    <div className="text-base font-bold text-indigo-600">
                      {formatCurrency(inf.exclusiveRate)}
                    </div>
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="text-xs text-slate-400 line-through">{formatCurrency(inf.regularRate)}</span>
                      <span className="text-xs font-semibold text-emerald-600">{discount}%↓</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="shrink-0 flex gap-2">
                    <button
                      onClick={() => setSelectedInf(inf)}
                      className="px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      상세 보기
                    </button>
                    {isRequested ? (
                      <div className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                        <Check className="w-3.5 h-3.5" />
                        요청됨
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRequest(inf.id)}
                        className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        협업 요청
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === "track2" && (
        <div className="text-center py-16 text-slate-400">
          <Users className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <div className="text-sm">캠페인별 지원자는 캠페인 상세 페이지에서 관리합니다</div>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => (window.location.href = "/brand/campaigns")}
          >
            캠페인 목록으로
          </Button>
        </div>
      )}

      {/* Detail sheet */}
      {selectedInf && (
        <InfluencerDetailSheet
          influencer={selectedInf}
          onClose={() => setSelectedInf(null)}
          onRequest={handleRequest}
          mode="view"
        />
      )}
    </div>
  );
}
