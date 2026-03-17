"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { RadarChart } from "@/components/RadarChart";
import { calcRadarScores, type RadarDimension } from "@/lib/radar";

type Project = {
  title?: string | null;
  role?: string | null;
  description?: string | null;
  skills?: string[] | null;
  result?: string | null;
};

type ViewState =
  | { type: "loading" }
  | { type: "authed"; email: string | null; projects: Project[]; scores: RadarDimension[] }
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

      if (typeof window !== "undefined" && window.location.hash) {
        router.replace("/dashboard");
      }

      const { data: projects } = await supabase
        .from("projects")
        .select("title,role,description,skills,result");

      if (cancelled) return;

      const list = (projects ?? []) as Project[];
      setState({
        type: "authed",
        email: data.session.user.email ?? null,
        projects: list,
        scores: calcRadarScores(list),
      });
    }

    load();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      if (!session) {
        setState({ type: "unauthed" });
        router.replace("/login");
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

        <div className="mt-8 space-y-4">
          {/* 能力雷达图 */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-sm font-medium text-zinc-900">能力雷达图</div>
            {state.type === "loading" ? (
              <div className="mt-4 text-sm text-zinc-500">加载中...</div>
            ) : state.type === "authed" ? (
              state.projects.length ? (
                <>
                  <RadarChart dimensions={state.scores} />
                  <div className="mt-2 flex flex-wrap gap-3">
                    {state.scores.map((d) => (
                      <div key={d.name} className="text-xs text-zinc-500">
                        {d.name}
                        <span className="ml-1 font-medium text-zinc-900">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="mt-4 text-sm text-zinc-500">
                  暂无项目数据，先创建项目卡片以生成能力画像。
                </div>
              )
            ) : null}
          </div>

          {/* 快捷入口 */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-sm font-medium text-zinc-900">项目卡片与 AI 简历</div>
            <div className="mt-1 text-sm text-zinc-600">
              先创建项目卡片，再用 AI 生成简历。
              {state.type === "authed" && state.projects.length > 0
                ? ` 当前共 ${state.projects.length} 个项目。`
                : ""}
            </div>
            <div className="flex flex-wrap gap-2 pt-4">
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
        </div>
      </div>
    </div>
  );
}
