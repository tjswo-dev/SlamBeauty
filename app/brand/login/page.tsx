"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Zap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function BrandLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/brand/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          메인으로
        </Link>

        <div className="bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-indigo-100 p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs text-indigo-500 font-medium">For Brand</div>
              <h1 className="text-lg font-bold text-slate-900">브랜드사 로그인</h1>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">이메일</label>
              <Input
                type="email"
                placeholder="brand@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">비밀번호</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg mt-2">
              로그인
            </Button>
          </form>

          <div className="mt-4 text-center">
            <span className="text-sm text-slate-500">계정이 없으신가요? </span>
            <button
              onClick={() => router.push("/brand/dashboard")}
              className="text-sm text-indigo-600 font-semibold hover:underline"
            >
              회원가입
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center mb-4">빠른 체험을 원하신다면</p>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push("/brand/dashboard")}
            >
              <Zap className="w-4 h-4 text-indigo-500" />
              데모로 체험하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
