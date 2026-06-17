"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Upload, Plus, X, ChevronRight, Info } from "lucide-react";

const categories = ["스킨케어", "메이크업", "선케어", "헤어케어", "바디케어", "향수", "건강/웰니스", "기타"];
const countries = ["미국", "캐나다", "일본", "동남아시아", "중동"];
const genders = ["여성", "남성", "무관"];
const ageRanges = ["13-18", "18-24", "25-34", "35-44", "45+"];
const platforms = ["Instagram", "TikTok", "Twitter"];

export default function NewCampaignPage() {
  const router = useRouter();
  const [guidelines, setGuidelines] = useState<string[]>([""]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedAges, setSelectedAges] = useState<string[]>([]);
  const [selectedGender, setSelectedGender] = useState<string>("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const [recruitStartDate] = useState(today);
  const [recruitDeadline, setRecruitDeadline] = useState("");
  const [selectionDeadline, setSelectionDeadline] = useState("");
  const [shippingDate, setShippingDate] = useState("");
  const [contentDeadline, setContentDeadline] = useState("");

  const handleRecruitDeadlineChange = (val: string) => {
    setRecruitDeadline(val);
    if (val) {
      const next = new Date(val);
      next.setDate(next.getDate() + 1);
      setSelectionDeadline(next.toISOString().split("T")[0]);
    } else {
      setSelectionDeadline("");
    }
  };

  const handleShippingDateChange = (val: string) => {
    setShippingDate(val);
    if (val) {
      const deadline = new Date(val);
      deadline.setDate(deadline.getDate() + 14);
      setContentDeadline(deadline.toISOString().split("T")[0]);
    } else {
      setContentDeadline("");
    }
  };

  const budgetOptions = [
    { label: "20만원", value: "200000", recommended: false },
    { label: "30만원", value: "300000", recommended: true },
    { label: "50만원", value: "500000", recommended: false },
    { label: "메가급 500만원 이상", value: "5000000", recommended: false },
  ];

  const addGuideline = () => setGuidelines([...guidelines, ""]);
  const removeGuideline = (i: number) => setGuidelines(guidelines.filter((_, idx) => idx !== i));
  const updateGuideline = (i: number, val: string) => {
    const updated = [...guidelines];
    updated[i] = val;
    setGuidelines(updated);
  };

  const toggleItem = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    if (arr.includes(val)) setArr(arr.filter((v) => v !== val));
    else setArr([...arr, val]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/brand/dashboard");
  };

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">캠페인 등록</h1>
        <p className="text-sm text-slate-500 mt-1">상세한 정보를 입력할수록 더 잘 맞는 인플루언서를 찾을 수 있습니다</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => setStep(s)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                s === step
                  ? "bg-indigo-600 text-white"
                  : s < step
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {s < step ? "✓" : s}
            </button>
            <span className={`text-sm ${s === step ? "font-semibold text-slate-900" : "text-slate-400"}`}>
              {s === 1 ? "제품 정보" : s === 2 ? "타겟팅" : "가이드라인 & 예산"}
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
                <CardTitle>브랜드 & 제품 정보</CardTitle>
                <CardDescription>협업할 제품의 상세 정보를 입력하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">브랜드명 *</label>
                    <Input placeholder="예: 글로우랩" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">제품명 *</label>
                    <Input placeholder="예: 비타C 앰플 세럼" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">제품 설명 *</label>
                  <textarea
                    className="w-full h-28 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 resize-none"
                    placeholder="제품의 주요 성분, 효능, 특징, 타겟 고객층 등을 상세히 입력해주세요"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">카테고리 *</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleItem(selectedCategories, setSelectedCategories, cat)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          selectedCategories.includes(cat)
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">제품 이미지</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-indigo-300 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">이미지를 드래그하거나 클릭하여 업로드</p>
                    <p className="text-xs text-slate-300 mt-1">JPG, PNG, WEBP (최대 10MB)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="button" onClick={() => setStep(2)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                다음 단계
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>타겟 설정</CardTitle>
                <CardDescription>캠페인 타겟 국가, 연령대, 희망 인플루언서 조건을 설정하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    타겟 국가 *
                    <span className="ml-2 text-xs text-indigo-500 font-normal">선택한 국가 기준으로 거주 인플루언서 매칭</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {countries.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleItem(selectedCountries, setSelectedCountries, c)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          selectedCountries.includes(c)
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">타겟 연령대</label>
                  <div className="flex flex-wrap gap-2">
                    {ageRanges.map((age) => (
                      <button
                        key={age}
                        type="button"
                        onClick={() => toggleItem(selectedAges, setSelectedAges, age)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          selectedAges.includes(age)
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {age}세
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">타겟 성별</label>
                  <div className="flex gap-2">
                    {genders.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setSelectedGender(g)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          selectedGender === g
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">희망 플랫폼</label>
                  <div className="flex flex-wrap gap-2">
                    {platforms.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => toggleItem(selectedPlatforms, setSelectedPlatforms, p)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          selectedPlatforms.includes(p)
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>이전</Button>
              <Button type="button" onClick={() => setStep(3)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                다음 단계
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>콘텐츠 가이드라인</CardTitle>
                <CardDescription>인플루언서가 지켜야 할 가이드라인을 상세히 작성해주세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {guidelines.map((g, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <Input
                      value={g}
                      onChange={(e) => updateGuideline(i, e.target.value)}
                      placeholder={`가이드라인 ${i + 1} (예: 인스타그램 피드 1개 필수)`}
                    />
                    {guidelines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGuideline(i)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addGuideline}
                  className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  가이드라인 추가
                </button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>예산 & 일정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">캠페인 예산 (1인당) *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {budgetOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSelectedBudget(opt.value)}
                        className={`relative flex items-center justify-between px-4 py-3.5 rounded-xl border-2 text-left transition-all ${
                          selectedBudget === opt.value
                            ? "border-indigo-500 bg-indigo-50"
                            : opt.recommended
                            ? "border-indigo-300 bg-white hover:border-indigo-400"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <span className={`text-base font-bold ${selectedBudget === opt.value ? "text-indigo-700" : "text-slate-900"}`}>
                          {opt.label}
                        </span>
                        {opt.recommended && (
                          <span className="animate-pulse text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500 text-white shrink-0">
                            추천
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">모집 인원</label>
                  <Input type="number" placeholder="5" />
                </div>
                {/* 캠페인 일정 흐름 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">캠페인 일정 *</label>

                  {/* 흐름 표시 */}
                  <div className="flex items-center gap-1 mb-5 overflow-x-auto pb-1">
                    {["모집 시작", "모집 마감", "선정 마감", "배송", "콘텐츠 마감"].map((label, i) => (
                      <div key={label} className="flex items-center shrink-0">
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-bold flex items-center justify-center">{i + 1}</div>
                          <span className="text-[10px] text-slate-400 mt-0.5 whitespace-nowrap">{label}</span>
                        </div>
                        {i < 4 && <div className="w-5 h-px bg-slate-200 mb-3 mx-0.5" />}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {/* 모집 시작일 (오늘, 자동) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-bold flex items-center justify-center">1</span>
                            모집 시작일
                            <span className="text-[10px] text-indigo-400 font-normal">오늘 자동 설정</span>
                          </span>
                        </label>
                        <Input
                          type="date"
                          value={recruitStartDate}
                          readOnly
                          className="bg-indigo-50 text-indigo-700 font-medium cursor-not-allowed"
                        />
                      </div>

                      {/* 모집 마감일 */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                          <span className="inline-flex items-center gap-1">
                            <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-bold flex items-center justify-center">2</span>
                            모집 마감일
                          </span>
                        </label>
                        <Input
                          type="date"
                          value={recruitDeadline}
                          min={recruitStartDate}
                          onChange={(e) => handleRecruitDeadlineChange(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* 선정 마감일 + 배송 날짜 */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-bold flex items-center justify-center">3</span>
                            선정 마감일
                            <span className="text-[10px] text-indigo-400 font-normal">모집 마감 다음날 자동</span>
                          </span>
                        </label>
                        <Input
                          type="date"
                          value={selectionDeadline}
                          onChange={(e) => setSelectionDeadline(e.target.value)}
                          className="bg-indigo-50 text-indigo-700 font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                          <span className="inline-flex items-center gap-1">
                            <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-bold flex items-center justify-center">4</span>
                            배송 날짜
                          </span>
                        </label>
                        <Input
                          type="date"
                          value={shippingDate}
                          onChange={(e) => handleShippingDateChange(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* 콘텐츠 업로드 기한 (배송 +2주 자동) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-bold flex items-center justify-center">5</span>
                            콘텐츠 업로드 기한
                            <span className="text-[10px] text-indigo-400 font-normal">배송일 +2주 자동 설정</span>
                          </span>
                        </label>
                        <Input
                          type="date"
                          value={contentDeadline}
                          onChange={(e) => setContentDeadline(e.target.value)}
                          className="bg-indigo-50 text-indigo-700 font-medium"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700">
                    예산은 인플루언서 승인 후 에스크로 방식으로 처리되며, 콘텐츠 업로드 완료 및 확인 후 정산됩니다.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setStep(2)}>이전</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8">
                캠페인 등록하기
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
