"use client";

import Link from "next/link";
import { ArrowRight, Star, TrendingUp, Users, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">SlamBeauty</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span>K-뷰티 × 인플루언서 매칭 플랫폼</span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-4 py-2 text-sm text-indigo-700 font-medium">
          <Star className="w-3.5 h-3.5 fill-indigo-500 text-indigo-500" />
          <span>미드티어 인플루언서 × K-뷰티 브랜드 전문 매칭</span>
        </div>

        <h1 className="text-center text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6 max-w-3xl">
          진짜 영향력을 가진
          <br />
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            인플루언서
          </span>
          와 만나세요
        </h1>

        <p className="text-center text-lg text-slate-500 max-w-xl mb-16 leading-relaxed">
          팔로워 1만~10만의 미드티어 인플루언서는 높은 참여율로<br />
          K-뷰티 캠페인 최고의 파트너입니다
        </p>

        {/* CTA Split Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          <Link href="/brand/login">
            <div className="group relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-indigo-600 to-purple-700 text-white cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-200">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs font-medium text-indigo-200 mb-2 uppercase tracking-wider">For Brand</div>
                <h2 className="text-2xl font-bold mb-3">나는 브랜드사입니다</h2>
                <p className="text-indigo-100 text-sm leading-relaxed mb-6">
                  K-뷰티 캠페인에 최적화된 인플루언서를 찾고 싶다면
                </p>
                <div className="flex items-center gap-2 text-white font-semibold">
                  <span>캠페인 시작하기</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>

          <Link href="/influencer/campaigns">
            <div className="group relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-purple-500 to-violet-600 text-white cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-200">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs font-medium text-purple-200 mb-2 uppercase tracking-wider">For Influencer</div>
                <h2 className="text-2xl font-bold mb-3">나는 인플루언서입니다</h2>
                <p className="text-purple-100 text-sm leading-relaxed mb-6">
                  나에게 맞는 K-뷰티 브랜드 캠페인에 참여하고 싶다면
                </p>
                <div className="flex items-center gap-2 text-white font-semibold">
                  <span>캠페인 둘러보기</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-3 gap-12 text-center">
          <div>
            <div className="text-3xl font-bold text-slate-900 mb-1">1,240+</div>
            <div className="text-sm text-slate-500">등록 인플루언서</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 mb-1">320+</div>
            <div className="text-sm text-slate-500">진행 캠페인</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 mb-1">5.2%</div>
            <div className="text-sm text-slate-500">평균 참여율</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-16">
            왜 미드티어 인플루언서인가요?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">높은 참여율</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                메가 인플루언서 대비 3-5배 높은 팔로워 참여율로 실질적인 구매 전환에 강합니다
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">높은 신뢰도</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                팔로워와의 친밀한 관계를 바탕으로 광고보다 친구 추천처럼 느껴지는 콘텐츠를 만듭니다
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">합리적인 비용</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                메가 인플루언서 대비 1/5 수준의 비용으로 더 많은 캠페인을 더 효율적으로 운영할 수 있습니다
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
