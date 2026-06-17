"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronRight, Info, AtSign, Video, Star } from "lucide-react";

const categories = ["뷰티", "스킨케어", "메이크업", "K-뷰티", "패션", "라이프스타일", "웰니스", "다이어트", "여행", "푸드"];
const countries = ["대한민국", "미국", "일본", "싱가포르", "태국", "베트남", "인도네시아", "말레이시아", "기타"];

export default function InfluencerOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [country, setCountry] = useState("대한민국");
  const [secondaryConsent, setSecondaryConsent] = useState(false);
  const [regularRate, setRegularRate] = useState("");
  const [exclusiveRate, setExclusiveRate] = useState("");

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/influencer/dashboard");
  };

  const discountPercent =
    regularRate && exclusiveRate
      ? Math.round((1 - Number(exclusiveRate) / Number(regularRate)) * 100)
      : null;

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">인플루언서 프로필 등록</h1>
        <p className="text-sm text-slate-500 mt-1">정보를 상세히 입력할수록 더 많은 캠페인 기회를 얻을 수 있습니다</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => step > s && setStep(s)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                s === step
                  ? "bg-purple-600 text-white"
                  : s < step
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {s < step ? "✓" : s}
            </button>
            <span className={`text-sm ${s === step ? "font-semibold text-slate-900" : "text-slate-400"}`}>
              {s === 1 ? "기본 정보" : s === 2 ? "Rate Card" : "동의 & 완료"}
            </span>
            {s < 3 && <div className="w-8 h-px bg-slate-200 mx-1" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>SNS 계정 연동</CardTitle>
                <CardDescription>주요 활동 SNS 계정을 연결하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <AtSign className="w-4 h-4 text-purple-500" />
                      Instagram
                    </span>
                  </label>
                  <div className="flex">
                    <span className="flex items-center px-3 bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg text-sm text-slate-400">@</span>
                    <Input className="rounded-l-none" placeholder="username" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-red-500" />
                      YouTube
                    </span>
                  </label>
                  <Input placeholder="채널 URL을 입력하세요" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">TikTok</label>
                  <div className="flex">
                    <span className="flex items-center px-3 bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg text-sm text-slate-400">@</span>
                    <Input className="rounded-l-none" placeholder="username" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">이름 *</label>
                    <Input placeholder="홍길동" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">거주 국가 *</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                    >
                      {countries.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">배송지 주소 *</label>
                  <Input placeholder="제품 수령 주소를 입력하세요" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">선호 카테고리 * (최대 3개)</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        disabled={!selectedCategories.includes(cat) && selectedCategories.length >= 3}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          selectedCategories.includes(cat)
                            ? "bg-purple-600 text-white"
                            : selectedCategories.length >= 3
                            ? "bg-slate-50 text-slate-300 cursor-not-allowed"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="button" onClick={() => setStep(2)} className="bg-purple-600 hover:bg-purple-700 text-white">
                다음
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <Star className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-purple-700 mb-1">Rate Card란?</h3>
                  <p className="text-sm text-purple-600 leading-relaxed">
                    인플루언서 단가 정보를 등록하세요. <strong>플랫폼 전용 단가</strong>를 일반 단가보다 낮게 설정할수록 브랜드로부터 더 많은 협업 요청을 받을 수 있습니다.
                  </p>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Rate Card 입력</CardTitle>
                <CardDescription>콘텐츠 1개 기준 단가를 입력해주세요 (원)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    일반 단가 (Regular Rate)
                  </label>
                  <div className="flex">
                    <Input
                      type="number"
                      placeholder="800,000"
                      value={regularRate}
                      onChange={(e) => setRegularRate(e.target.value)}
                      className="rounded-r-none"
                    />
                    <span className="flex items-center px-3 bg-slate-50 border border-l-0 border-slate-200 rounded-r-lg text-sm text-slate-500 whitespace-nowrap">원</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">외부 브랜드와 직접 협업 시 적용되는 단가</p>
                </div>

                <div className="relative">
                  <div className="absolute -top-3 left-4">
                    <span className="bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">핵심</span>
                  </div>
                  <div className="border-2 border-purple-300 rounded-xl p-5 bg-purple-50/50">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      플랫폼 전용 단가 (Exclusive Partner Rate)
                    </label>
                    <div className="flex">
                      <Input
                        type="number"
                        placeholder="580,000"
                        value={exclusiveRate}
                        onChange={(e) => setExclusiveRate(e.target.value)}
                        className="rounded-r-none border-purple-300 focus:ring-purple-400"
                      />
                      <span className="flex items-center px-3 bg-purple-100 border border-l-0 border-purple-300 rounded-r-lg text-sm text-purple-600 whitespace-nowrap">원</span>
                    </div>
                    <p className="text-xs text-purple-600 mt-2 font-medium">
                      💡 SlamBeauty 플랫폼을 통한 캠페인에만 적용되는 특별 단가입니다. 낮게 설정할수록 브랜드 선택 확률이 높아집니다!
                    </p>

                    {discountPercent !== null && discountPercent > 0 && (
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <span className="text-slate-500">할인율:</span>
                        <span className="font-bold text-emerald-600 text-base">{discountPercent}% 할인</span>
                        <span className="text-xs text-slate-400">(브랜드에게 표시됨)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700">
                    등록된 단가는 브랜드에게 공개됩니다. 실제 캠페인 협의 시 조정 가능합니다.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>이전</Button>
              <Button type="button" onClick={() => setStep(3)} className="bg-purple-600 hover:bg-purple-700 text-white">
                다음
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>약관 동의</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "서비스 이용약관 동의 (필수)", required: true },
                  { label: "개인정보 처리방침 동의 (필수)", required: true },
                  { label: "마케팅 정보 수신 동의 (선택)", required: false },
                ].map((item, i) => (
                  <label key={i} className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-5 h-5 rounded border-2 border-slate-300 group-hover:border-purple-400 flex items-center justify-center shrink-0">
                      <input type="checkbox" className="sr-only" required={item.required} />
                      <div className="w-3 h-3 rounded-sm bg-transparent group-has-[:checked]:bg-purple-600" />
                    </div>
                    <span className="text-sm text-slate-700">{item.label}</span>
                  </label>
                ))}

                <div className="mt-2 p-4 border border-slate-200 rounded-xl">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={secondaryConsent}
                      onChange={(e) => setSecondaryConsent(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded accent-purple-600"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-700">2차 활용 동의 (선택)</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        내가 제작한 콘텐츠를 브랜드가 SNS 광고, 홈페이지 등에 2차 활용하는 것에 동의합니다.
                        동의 시 추가 보상이 제공될 수 있습니다.
                      </p>
                      {secondaryConsent && (
                        <p className="text-xs text-purple-600 font-medium mt-1">
                          ✓ 2차 활용 동의 — 브랜드에게 표시됩니다
                        </p>
                      )}
                    </div>
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>프로필 요약</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">거주 국가</span>
                    <span className="font-medium text-slate-900">{country}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">선호 카테고리</span>
                    <span className="font-medium text-slate-900">{selectedCategories.join(", ") || "미선택"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">일반 단가</span>
                    <span className="font-medium text-slate-900">{regularRate ? `${Number(regularRate).toLocaleString()}원` : "미입력"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">플랫폼 전용 단가</span>
                    <span className="font-semibold text-purple-600">{exclusiveRate ? `${Number(exclusiveRate).toLocaleString()}원` : "미입력"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">2차 활용 동의</span>
                    <span className={`font-medium ${secondaryConsent ? "text-emerald-600" : "text-slate-400"}`}>
                      {secondaryConsent ? "동의함" : "비동의"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setStep(2)}>이전</Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-8">
                프로필 등록 완료
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
