"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Bell, CreditCard, Shield, ChevronRight, Check } from "lucide-react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">브랜드 설정</h1>
        <p className="text-sm text-slate-500 mt-1">계정 및 알림 설정을 관리합니다</p>
      </div>

      <div className="space-y-6">
        {/* Brand profile */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              브랜드 프로필
            </CardTitle>
            <CardDescription>브랜드 기본 정보를 입력하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">브랜드명</label>
                <Input defaultValue="글로우랩 코리아" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">업종</label>
                <Input defaultValue="K-뷰티 / 스킨케어" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">담당자명</label>
              <Input defaultValue="김마케팅" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">담당자 이메일</label>
              <Input type="email" defaultValue="marketing@glowlab.kr" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">브랜드 웹사이트</label>
              <Input defaultValue="https://www.glowlab.kr" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">브랜드 소개</label>
              <textarea
                className="w-full h-20 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                defaultValue="K-뷰티 스킨케어 전문 브랜드 글로우랩입니다. 과학적 성분 설계와 감각적 패키지로 글로벌 시장을 공략합니다."
              />
            </div>
          </CardContent>
        </Card>

        {/* Target settings */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-sm">캠페인 기본 타겟 설정</CardTitle>
            <CardDescription>캠페인 등록 시 기본값으로 사용됩니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">주요 타겟 국가</label>
              <div className="flex flex-wrap gap-2">
                {["대한민국", "미국", "일본", "동남아시아"].map((c, i) => (
                  <span
                    key={c}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                      i < 2 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">주요 타겟 연령</label>
              <div className="flex gap-2">
                {["18-24", "25-34", "35-44"].map((a, i) => (
                  <span
                    key={a}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                      i < 2 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {a}세
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-400" />
              알림 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "새 지원자 알림", desc: "캠페인에 인플루언서가 지원하면 알림", on: true },
              { label: "콘텐츠 제출 알림", desc: "인플루언서가 콘텐츠 링크를 제출하면 알림", on: true },
              { label: "협업 요청 수락/거절 알림", desc: "Track 1 협업 요청에 응답이 오면 알림", on: true },
              { label: "정산 관련 알림", desc: "정산 처리 현황 알림", on: false },
              { label: "마케팅 이메일", desc: "SlamBeauty 서비스 업데이트 및 팁", on: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <div className="text-sm font-medium text-slate-700">{item.label}</div>
                  <div className="text-xs text-slate-400">{item.desc}</div>
                </div>
                <button
                  className={`w-10 h-6 rounded-full transition-all ${item.on ? "bg-indigo-600" : "bg-slate-200"}`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-sm mx-auto transition-all ${
                      item.on ? "translate-x-2" : "-translate-x-2"
                    }`}
                  />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Billing */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-400" />
              결제 정보
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-3 border border-slate-100 rounded-xl px-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 bg-slate-800 rounded-md flex items-center justify-center text-white text-[10px] font-bold">
                  VISA
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-700">•••• •••• •••• 4242</div>
                  <div className="text-xs text-slate-400">만료 08/28</div>
                </div>
              </div>
              <button className="text-xs text-indigo-600 hover:underline">변경</button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            className={`px-8 transition-all ${
              saved ? "bg-emerald-600 hover:bg-emerald-700" : "bg-indigo-600 hover:bg-indigo-700"
            } text-white`}
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                저장됨
              </>
            ) : (
              "설정 저장"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
