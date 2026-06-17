"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  ChevronRight,
  Download,
  Wallet,
  CreditCard,
  CalendarDays,
} from "lucide-react";
import { dummySettlements, myProfile } from "@/lib/dummy-data";
import { useInfluencerAuth } from "@/lib/use-influencer-auth";
import { cn } from "@/lib/utils";

const GOOGLE_SVG = (
  <svg width="18" height="18" viewBox="0 0 18 18" className="shrink-0">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/>
  </svg>
);

const MONTHS = ["2026-06", "2026-05", "2026-04"];

type Settlement = typeof dummySettlements[0];

function getMonthLabel(month: string) {
  const [y, m] = month.split("-");
  return `${y}년 ${Number(m)}월`;
}

export default function SettlementPage() {
  const { isLoggedIn, login, mounted } = useInfluencerAuth();
  const [selectedMonth, setSelectedMonth] = useState("전체");
  const [withdrawRequested, setWithdrawRequested] = useState(false);

  if (mounted && !isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-7 h-7 text-purple-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">로그인이 필요합니다</h2>
          <p className="text-sm text-slate-500 mb-6">정산 내역을 확인하려면 로그인해주세요</p>
          <button
            onClick={() => login()}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700 transition-all shadow-sm"
          >
            {GOOGLE_SVG}
            Google로 로그인
          </button>
          <Link href="/influencer/campaigns" className="block mt-3 text-sm text-slate-400 hover:text-slate-600 transition-colors">
            오픈 캠페인 보러가기
          </Link>
        </div>
      </div>
    );
  }

  const filtered =
    selectedMonth === "전체"
      ? dummySettlements
      : dummySettlements.filter((s) => s.month === selectedMonth);

  // Totals for current selection
  const totalPayment = filtered.reduce((sum, s) => sum + s.payment, 0);
  const totalFee = filtered.reduce((sum, s) => sum + s.platformFee, 0);
  const totalNet = filtered.reduce((sum, s) => sum + s.netPayment, 0);
  const paidNet = filtered.filter((s) => s.status === "paid").reduce((sum, s) => sum + s.netPayment, 0);
  const pendingNet = filtered.filter((s) => s.status === "pending").reduce((sum, s) => sum + s.netPayment, 0);

  // Overall stats
  const allTotal = dummySettlements.reduce((sum, s) => sum + s.netPayment, 0);
  const allPending = dummySettlements.filter((s) => s.status === "pending").reduce((sum, s) => sum + s.netPayment, 0);

  return (
    <div className="min-h-screen">
      {/* Mobile header — desktop uses sidebar */}
      <header className="md:hidden bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-4 h-14 flex items-center justify-between">
          <Link href="/influencer/campaigns" className="text-base font-bold text-purple-600">SlamBeauty</Link>
          <nav className="flex items-center gap-1">
            <Link href="/influencer/campaigns" className="text-xs text-slate-500 px-2.5 py-1.5 rounded-lg hover:bg-slate-100">캠페인</Link>
            <Link href="/influencer/active" className="text-xs text-slate-500 px-2.5 py-1.5 rounded-lg hover:bg-slate-100">진행중</Link>
            <Link href="/influencer/settlement" className="text-xs font-semibold text-purple-600 px-2.5 py-1.5 rounded-lg bg-purple-50">정산</Link>
            <Link href="/influencer/profile" className="text-xs text-slate-500 px-2.5 py-1.5 rounded-lg hover:bg-slate-100">마이페이지</Link>
          </nav>
        </div>
      </header>

      <div className="p-4 sm:p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">정산 관리</h1>
        <p className="text-sm text-slate-500 mt-1">정산 내역과 출금 현황을 확인하세요</p>
      </div>

      {/* Top KPI cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 opacity-80" />
            <span className="text-xs font-medium opacity-80">누적 순수익</span>
          </div>
          <div className="text-2xl font-bold">{(allTotal / 10000).toFixed(0)}만원</div>
          <div className="text-xs opacity-70 mt-1">총 {dummySettlements.length}건</div>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-medium text-slate-500">정산 완료</span>
          </div>
          <div className="text-2xl font-bold text-emerald-700">
            {((allTotal - allPending) / 10000).toFixed(0)}만원
          </div>
          <div className="text-xs text-slate-400 mt-1">입금 완료</div>
        </div>

        <div className="bg-white rounded-2xl border border-amber-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-medium text-slate-500">정산 대기</span>
          </div>
          <div className="text-2xl font-bold text-amber-700">
            {(allPending / 10000).toFixed(0)}만원
          </div>
          <div className="text-xs text-slate-400 mt-1">지급 예정</div>
        </div>
      </div>

      {/* Pending settlement banner */}
      {allPending > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-amber-800">
                정산 대기 중인 금액이 있습니다
              </div>
              <div className="text-xs text-amber-600 mt-0.5">
                월말 정산 처리 후 3~5 영업일 내 입금됩니다
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-base font-bold text-amber-700">{allPending.toLocaleString()}원</div>
            <div className="text-xs text-amber-500">실수령액</div>
          </div>
        </div>
      )}

      {/* Month filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {["전체", ...MONTHS].map((m) => (
          <button
            key={m}
            onClick={() => setSelectedMonth(m)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all",
              selectedMonth === m
                ? "bg-purple-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            {m === "전체" ? "전체" : getMonthLabel(m)}
          </button>
        ))}
      </div>

      {/* Monthly summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800">
            {selectedMonth === "전체" ? "전체 내역 요약" : `${getMonthLabel(selectedMonth)} 요약`}
          </h3>
          <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-all">
            <Download className="w-3.5 h-3.5" />
            내역 다운로드
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 rounded-xl bg-slate-50">
            <div className="text-xs text-slate-400 mb-1">캠페인 지급액</div>
            <div className="text-base font-bold text-slate-800">{(totalPayment / 10000).toFixed(1)}만원</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-slate-50">
            <div className="text-xs text-slate-400 mb-1">플랫폼 수수료</div>
            <div className="text-base font-bold text-red-500">-{(totalFee / 10000).toFixed(1)}만원</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-purple-50 border border-purple-100">
            <div className="text-xs text-purple-500 mb-1">실수령액</div>
            <div className="text-base font-bold text-purple-700">{(totalNet / 10000).toFixed(1)}만원</div>
          </div>
        </div>

        {/* Breakdown bar */}
        <div className="space-y-2">
          {[
            { label: "입금 완료", amount: paidNet, color: "bg-emerald-400" },
            { label: "정산 대기", amount: pendingNet, color: "bg-amber-400" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-16 text-xs text-slate-500 shrink-0">{item.label}</div>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full", item.color)}
                  style={{ width: totalNet > 0 ? `${(item.amount / totalNet) * 100}%` : "0%" }}
                />
              </div>
              <div className="w-20 text-xs font-semibold text-slate-700 text-right shrink-0">
                {(item.amount / 10000).toFixed(1)}만원
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settlement list */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-5">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">정산 내역</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">해당 월에 정산 내역이 없습니다</div>
          ) : (
            filtered.map((s) => (
              <div key={s.id} className="p-4 hover:bg-slate-50 transition-all">
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: s.brandLogoColor }}
                  >
                    {s.brandLogo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{s.productName}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {s.brandName} · {s.category}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-slate-900">
                          {s.netPayment.toLocaleString()}원
                        </div>
                        <div className="text-[10px] text-slate-400">
                          -{s.platformFee.toLocaleString()}원 수수료
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold",
                            s.status === "paid"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-amber-50 text-amber-600"
                          )}
                        >
                          {s.status === "paid" ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              입금 완료
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              정산 대기
                            </>
                          )}
                        </span>
                        {s.paidAt && (
                          <span className="text-xs text-slate-400">
                            {s.paidAt} 입금
                          </span>
                        )}
                      </div>
                      <a
                        href={s.contentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.preventDefault()}
                        className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-600 transition-all"
                      >
                        콘텐츠 보기
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bank account + withdrawal */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-800">출금 계좌</h3>
          </div>
          <button className="text-xs text-purple-600 hover:underline font-medium">계좌 변경</button>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 mb-4">
          <div className="w-10 h-7 bg-slate-800 rounded-md flex items-center justify-center text-white text-[10px] font-bold shrink-0">
            은행
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-800">
              {myProfile.bankAccount.bank} {myProfile.bankAccount.number}
            </div>
            <div className="text-xs text-slate-400">예금주: {myProfile.bankAccount.holder}</div>
          </div>
        </div>

        {/* Withdrawal CTA */}
        {allPending > 0 ? (
          withdrawRequested ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <div className="text-sm font-semibold text-emerald-700">출금 신청 완료</div>
                <div className="text-xs text-emerald-500 mt-0.5">3~5 영업일 내 입금됩니다</div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setWithdrawRequested(true)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-200"
            >
              <Wallet className="w-4 h-4" />
              {(allPending / 10000).toFixed(1)}만원 출금 신청
            </button>
          )
        ) : (
          <div className="py-4 text-center text-sm text-slate-400">출금 가능한 금액이 없습니다</div>
        )}

        <p className="text-xs text-slate-400 text-center mt-3">
          최소 출금 금액: 5만원 · 수수료 10% 이미 공제됨
        </p>
      </div>
      </div>
    </div>
  );
}
