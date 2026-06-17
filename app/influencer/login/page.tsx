"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useInfluencerAuth } from "@/lib/use-influencer-auth";

export default function InfluencerLoginPage() {
  const router = useRouter();
  const { login } = useInfluencerAuth();

  const handleGoogleLogin = () => {
    login();
    router.push("/influencer/campaigns");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link
          href="/influencer/campaigns"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-8 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          캠페인 목록으로
        </Link>

        <div className="bg-white rounded-2xl shadow-xl shadow-purple-100/50 border border-purple-100 p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 mb-4 shadow-lg shadow-purple-200">
              <span className="text-white text-xl font-black">M</span>
            </div>
            <div className="text-xs font-semibold text-purple-500 tracking-wider uppercase mb-1">
              For Influencer
            </div>
            <h1 className="text-2xl font-bold text-slate-900">K-뷰티 브랜드와 함께하세요</h1>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              캠페인을 탐색하고 나에게 맞는 브랜드와 협업하세요
            </p>
          </div>

          {/* Google login button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700 transition-all shadow-sm hover:shadow-md"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/>
            </svg>
            Google로 계속하기
          </button>

          {/* Footer note */}
          <p className="text-xs text-slate-400 text-center mt-6 leading-relaxed">
            로그인하면{" "}
            <span className="underline cursor-pointer">이용약관</span> 및{" "}
            <span className="underline cursor-pointer">개인정보처리방침</span>에 동의합니다
          </p>
        </div>
      </div>
    </div>
  );
}
