"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ProjectCard, type Project } from "@/components/ProjectCard";

type ViewState =
  | { type: "loading" }
  | { type: "ready"; email: string | null; projects: Project[] }
  | { type: "error"; message: string };

export default function ProjectsPage() {
  const router = useRouter();
  const [state, setState] = useState<ViewState>({ type: "loading" });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const projectCount = useMemo(() => {
    if (state.type !== "ready") return 0;
    return state.projects.length;
  }, [state]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (cancelled) return;
      if (sessionError) {
        setState({ type: "error", message: sessionError.message });
        return;
      }
      if (!sessionData.session) {
        router.replace("/login");
        return;
      }

      const user = sessionData.session.user;

      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("id,title,role,skills,date")
        .order("created_at", { ascending: false });

      if (cancelled) return;
      if (projectsError) {
        setState({ type: "error", message: projectsError.message });
        return;
      }

      setState({
        type: "ready",
        email: user.email ?? null,
        projects: (projects ?? []) as Project[],
      });
    }

    load();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      if (!session) router.replace("/login");
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  async function deleteProject(id: string) {
    if (deletingId) return;
    const ok = window.confirm("确定要删除这个项目吗？此操作不可撤销。");
    if (!ok) return;

    setDeletingId(id);
    const { error } = await supabase.from("projects").delete().eq("id", id);
    setDeletingId(null);

    if (error) {
      setState({ type: "error", message: error.message });
      return;
    }

    setState((prev) => {
      if (prev.type !== "ready") return prev;
      return {
        ...prev,
        projects: prev.projects.filter((p) => p.id !== id),
      };
    });
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-sm text-zinc-500">项目卡片</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
              我的项目
            </h1>
            {state.type === "ready" ? (
              <p className="mt-1 text-sm text-zinc-600">
                {state.email ? `已登录：${state.email} · ` : ""}
                共 {projectCount} 个项目
              </p>
            ) : (
              <p className="mt-1 text-sm text-zinc-600">正在加载...</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
            >
              返回仪表盘
            </Link>
            <Link
              href="/projects/new"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              新建项目
            </Link>
          </div>
        </div>

        <div className="mt-8">
          {state.type === "loading" ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
              加载中...
            </div>
          ) : null}

          {state.type === "error" ? (
            <div className="space-y-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-900">
              <div className="font-medium">加载项目失败</div>
              <div className="break-words">{state.message}</div>
              {state.message.includes("Could not find the table") ||
              state.message.includes("schema cache") ? (
                <div className="rounded-xl border border-red-200 bg-white/70 px-3 py-2 text-xs leading-5 text-red-900">
                  <div className="font-medium">大概率原因</div>
                  <div>
                    你还没有在 Supabase 数据库里创建{" "}
                    <span className="font-mono">public.projects</span>{" "}
                    表，或创建后 API 的 schema cache 还没刷新。
                  </div>
                  <div className="mt-2 font-medium">修复方式</div>
                  <div>
                    1) 打开 Supabase Dashboard → SQL Editor，执行仓库里的{" "}
                    <span className="font-mono">database/schema.sql</span>
                  </div>
                  <div>
                    2) 然后在 Supabase Dashboard 的 API 设置里点击{" "}
                    <span className="font-medium">Reload schema</span>{" "}
                    （或重启 API）
                  </div>
                  <div>3) 刷新本页面重试</div>
                </div>
              ) : null}
            </div>
          ) : null}

          {state.type === "ready" ? (
            state.projects.length ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {state.projects.map((p) => (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    onDelete={deletingId ? undefined : deleteProject}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center">
                <div className="text-base font-semibold text-zinc-900">
                  还没有项目
                </div>
                <div className="mt-1 text-sm text-zinc-600">
                  先创建第一个项目卡片，用来生成简历与能力画像。
                </div>
                <div className="mt-6">
                  <Link
                    href="/projects/new"
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-800"
                  >
                    新建项目
                  </Link>
                </div>
              </div>
            )
          ) : null}
        </div>

        {deletingId ? (
          <div className="mt-4 text-xs text-zinc-500">正在删除...</div>
        ) : null}
      </div>
    </div>
  );
}

