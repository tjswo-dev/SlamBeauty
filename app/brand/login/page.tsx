"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function BrandLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      else router.push("/brand/dashboard");
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { role: "brand" } },
      });
      if (error) setError(error.message);
      else router.push("/brand/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />메인으로
        </Link>
        <div className="bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-indigo-100 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs text-indigo-500 font-medium">For Brand</div>
              <h1 className="text-lg font-bold text-slate-900">브랜드사 {mode === "login" ? "로그인" : "회원가입"}</h1>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">이메일</label>
              <Input type="email" placeholder="brand@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">비밀번호</label>
              <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg mt-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === "login" ? "로그인" : "회원가입"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            {mode === "login" ? (
              <>
                <span className="text-sm text-slate-500">계정이 없으신가요? </span>
                <button onClick={() => { setMode("signup"); setError(""); }} className="text-sm text-indigo-600 font-semibold hover:underline">회원가입</button>
              </>
            ) : (
              <>
                <span className="text-sm text-slate-500">이미 계정이 있으신가요? </span>
                <button onClick={() => { setMode("login"); setError(""); }} className="text-sm text-indigo-600 font-semibold hover:underline">로그인</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
