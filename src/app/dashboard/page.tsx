"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type ViewState =
  | { type: "loading" }
  | { type: "authed"; email: string | null }
  | { type: "unauthed" }
  | { type: "error"; message: string };

export default function DashboardPage() {
  const router = useRouter();
  const [state, setState] = useState<ViewState>({ type: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data, error } = await supabase.auth.getSession();
      if (cancelled) return;
      if (error) {
        setState({ type: "error", message: error.message });
        return;
      }
      if (!data.session) {
        setState({ type: "unauthed" });
        router.replace("/login");
        return;
      }

      setState({ type: "authed", email: data.session.user.email ?? null });
      if (typeof window !== "undefined" && window.location.hash) {
        router.replace("/dashboard");
      }
    }

    load();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      if (!session) {
        setState({ type: "unauthed" });
        router.replace("/login");
      } else {
        setState({ type: "authed", email: session.user.email ?? null });
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto w-full max-w-3xl px-6 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              仪表盘
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              {state.type === "authed"
                ? `已登录：${state.email ?? "（未知邮箱）"}`
                : "正在验证登录状态..."}
            </p>
          </div>
          <button
            onClick={logout}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
          >
            登出
          </button>
        </div>

        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6">
          {state.type === "loading" ? (
            <div className="text-sm text-zinc-600">加载中...</div>
          ) : null}

          {state.type === "error" ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
              {state.message}
            </div>
          ) : null}

          {state.type === "authed" ? (
            <div className="space-y-2">
              <div className="text-sm font-medium text-zinc-900">
                项目卡片与 AI 简历
              </div>
              <div className="text-sm text-zinc-600">
                先创建项目卡片，再用 AI 生成简历。能力雷达图即将上线。
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Link
                  href="/projects"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
                >
                  进入项目列表
                </Link>
                <Link
                  href="/resume"
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-800"
                >
                  生成简历
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

