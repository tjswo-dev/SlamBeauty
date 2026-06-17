"use client";

import { useState, useMemo, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InfluencerDetailSheet, type SheetInfluencer } from "@/components/brand/influencer-detail-sheet";
import {
  Users,
  Check,
  CalendarDays,
  Clock,
  Filter,
  Search,
  SlidersHorizontal,
  MapPin,
  Loader2,
} from "lucide-react";

type InfluencerRow = {
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

function formatNumber(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`;
  return n.toLocaleString();
}

function getPrimaryHandle(row: InfluencerRow): string {
  if (row.primary_platform === "Instagram" && row.instagram_handle) return `@${row.instagram_handle}`;
  if (row.primary_platform === "TikTok" && row.tiktok_handle) return `@${row.tiktok_handle}`;
  if (row.primary_platform === "Twitter" && row.twitter_handle) return `@${row.twitter_handle}`;
  if (row.instagram_handle) return `@${row.instagram_handle}`;
  if (row.tiktok_handle) return `@${row.tiktok_handle}`;
  if (row.twitter_handle) return `@${row.twitter_handle}`;
  return "";
}

function getActivePlatforms(row: InfluencerRow): string[] {
  const platforms: string[] = [];
  if (row.instagram_handle) platforms.push("Instagram");
  if (row.tiktok_handle) platforms.push("TikTok");
  if (row.twitter_handle) platforms.push("Twitter");
  return platforms;
}

function getTotalFollowers(row: InfluencerRow): number {
  return (row.instagram_followers ?? 0) + (row.tiktok_followers ?? 0) + (row.twitter_followers ?? 0);
}

function mapToSheet(row: InfluencerRow): SheetInfluencer {
  return {
    id: row.user_id,
    name: row.name,
    handle: getPrimaryHandle(row),
    avatar: row.avatar_url ?? "",
    bio: row.bio ?? "",
    followers: getTotalFollowers(row),
    platforms: getActivePlatforms(row),
    categories: row.categories ?? [],
  };
}

const categoryOptions = ["전체", "뷰티", "K-뷰티", "스킨케어", "메이크업", "패션", "라이프스타일", "웰니스"];
const platformOptions = ["전체", "Instagram", "TikTok", "Twitter"];

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
  const [selectedInf, setSelectedInf] = useState<SheetInfluencer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedPlatform, setSelectedPlatform] = useState("전체");
  const [sortBy, setSortBy] = useState("followers");
  const [minFollowers, setMinFollowers] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [influencers, setInfluencers] = useState<InfluencerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInfluencers = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await (supabase.from("influencer_profiles") as ReturnType<typeof supabase.from>).select(
        "user_id, name, avatar_url, bio, instagram_handle, tiktok_handle, twitter_handle, instagram_followers, tiktok_followers, twitter_followers, primary_platform, categories"
      );
      if (!error && data) {
        setInfluencers(data as InfluencerRow[]);
      }
      setLoading(false);
    };
    fetchInfluencers();
  }, []);

  const handleRequest = (id: string) => {
    setRequestedIds((prev) => [...prev, id]);
    setSelectedInf(null);
  };

  const filtered = useMemo(() => {
    let list = [...influencers];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (inf) =>
          inf.name.toLowerCase().includes(q) ||
          getPrimaryHandle(inf).toLowerCase().includes(q) ||
          (inf.categories ?? []).some((c) => c.toLowerCase().includes(q))
      );
    }
    if (selectedCategory !== "전체") {
      list = list.filter((inf) => (inf.categories ?? []).includes(selectedCategory));
    }
    if (selectedPlatform !== "전체") {
      list = list.filter((inf) => getActivePlatforms(inf).includes(selectedPlatform));
    }
    if (minFollowers) {
      list = list.filter((inf) => getTotalFollowers(inf) >= Number(minFollowers));
    }

    list.sort((a, b) => getTotalFollowers(b) - getTotalFollowers(a));

    return list;
  }, [influencers, searchQuery, selectedCategory, selectedPlatform, sortBy, minFollowers]);

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
              <option value="followers">팔로워 많은 순</option>
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
                }}
                className="text-xs text-slate-400 hover:text-slate-600 ml-auto"
              >
                초기화
              </button>
            </div>
          )}

          <div className="text-xs text-slate-400 mb-3">{filtered.length}명 표시 중</div>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
              <span className="ml-2 text-sm text-slate-400">인플루언서 불러오는 중...</span>
            </div>
          )}

          {/* Empty state */}
          {!loading && influencers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Users className="w-10 h-10 mb-3 text-slate-300" />
              <div className="text-sm">등록된 인플루언서가 없습니다</div>
            </div>
          )}

          {/* Influencer list */}
          {!loading && (
            <div className="space-y-3">
              {filtered.map((inf, idx) => {
                const sheetInf = mapToSheet(inf);
                const isRequested = requestedIds.includes(inf.user_id);
                const handle = getPrimaryHandle(inf);
                const platforms = getActivePlatforms(inf);
                const totalFollowers = getTotalFollowers(inf);

                return (
                  <div
                    key={inf.user_id}
                    className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex items-center gap-4 hover:border-indigo-200 hover:shadow-sm transition-all group"
                  >
                    <div className="text-sm font-bold text-slate-300 w-6 text-center shrink-0">
                      {idx + 1}
                    </div>

                    <button onClick={() => setSelectedInf(sheetInf)}>
                      <Avatar size="lg" className="hover:ring-2 hover:ring-indigo-300 transition-all">
                        <AvatarImage src={inf.avatar_url ?? ""} alt={inf.name} />
                        <AvatarFallback>{inf.name[0]}</AvatarFallback>
                      </Avatar>
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <button
                          onClick={() => setSelectedInf(sheetInf)}
                          className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors"
                        >
                          {inf.name}
                        </button>
                        {handle && <span className="text-sm text-slate-400">{handle}</span>}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {formatNumber(totalFollowers)}
                        </span>
                        <div className="flex gap-1">
                          {platforms.map((p) => (
                            <span key={p} className="text-xs bg-slate-100 text-slate-500 rounded px-1.5 py-0.5">
                              {p}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-1">
                          {(inf.categories ?? []).slice(0, 2).map((cat) => (
                            <Badge key={cat} variant="secondary" className="text-xs">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="shrink-0 flex gap-2">
                      <button
                        onClick={() => setSelectedInf(sheetInf)}
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
                          onClick={() => handleRequest(inf.user_id)}
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
          )}
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
