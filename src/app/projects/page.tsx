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
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
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

    void load();

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
        projects: prev.projects.filter((project) => project.id !== id),
      };
    });
  }

  return (
    <main className="editorial-shell">
      <section className="editorial-page space-y-6">
        <article className="editorial-card p-8 md:p-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="editorial-kicker">Project Ledger</div>
              <h1 className="editorial-title mt-5 text-5xl leading-none tracking-tight text-[var(--foreground)] md:text-7xl">
                我的项目条目，
                <br />
                也是我的职业素材库。
              </h1>
              <p className="editorial-lead mt-5 max-w-3xl text-base md:text-lg">
                {state.type === "ready"
                  ? `${state.email ? `当前登录邮箱：${state.email}。` : ""} 这里展示全部项目卡片，你可以继续补全细节、编辑表述，或者删除无效条目。`
                  : "正在读取你的项目资产库。"}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard" className="editorial-button-secondary">
                返回仪表盘
              </Link>
              <Link href="/projects/new" className="editorial-button">
                新建项目
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="editorial-stat">
              <span className="editorial-label">Entries</span>
              <strong className="editorial-stat-value">{projectCount}</strong>
              <p className="editorial-lead mt-2 text-sm">当前项目总数。</p>
            </div>
            <div className="editorial-stat">
              <span className="editorial-label">Action</span>
              <strong className="editorial-stat-value">Edit</strong>
              <p className="editorial-lead mt-2 text-sm">对单个条目进行精修和补充。</p>
            </div>
            <div className="editorial-stat">
              <span className="editorial-label">Goal</span>
              <strong className="editorial-stat-value">Resume</strong>
              <p className="editorial-lead mt-2 text-sm">为后续 AI 简历提供高质量输入。</p>
            </div>
          </div>
        </article>

        {state.type === "loading" ? (
          <section className="editorial-card p-8">
            <div className="editorial-lead text-sm">正在加载项目列表...</div>
          </section>
        ) : null}

        {state.type === "error" ? (
          <section className="editorial-card p-8">
            <div className="rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-900">
              <div className="font-medium">加载项目失败</div>
              <div className="mt-2 break-words">{state.message}</div>
              {state.message.includes("Could not find the table") ||
              state.message.includes("schema cache") ? (
                <div className="mt-4 space-y-2 rounded-[22px] border border-red-200 bg-white/70 px-4 py-3 text-xs leading-5 text-red-900">
                  <div className="font-medium">大概率原因</div>
                  <div>
                    你还没有在 Supabase 数据库里创建 <span className="font-mono">public.projects</span>
                    表，或者创建后 API 的 schema cache 还没有刷新。
                  </div>
                  <div className="font-medium">修复方式</div>
                  <div>1) 在 Supabase Dashboard 的 SQL Editor 执行 `database/schema.sql`</div>
                  <div>2) 在 API 设置里点击 `Reload schema` 或重启 API</div>
                  <div>3) 回到当前页面重新加载</div>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {state.type === "ready" ? (
          state.projects.length ? (
            <section className="grid gap-5 lg:grid-cols-2">
              {state.projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDelete={deletingId ? undefined : deleteProject}
                />
              ))}
            </section>
          ) : (
            <section className="editorial-card p-10 text-center">
              <div className="editorial-label">Blank Portfolio</div>
              <h2 className="editorial-title mt-4 text-4xl leading-none text-[var(--foreground)]">
                还没有项目条目。
              </h2>
              <p className="editorial-lead mx-auto mt-4 max-w-xl text-base">
                从第一条项目卡片开始，把做过的事组织成可复用、可提炼、可投递的履历材料。
              </p>
              <div className="mt-8">
                <Link href="/projects/new" className="editorial-button">
                  新建项目
                </Link>
              </div>
            </section>
          )
        ) : null}

        {deletingId ? <div className="editorial-lead px-1 text-xs">正在删除项目...</div> : null}
      </section>
    </main>
  );
}
