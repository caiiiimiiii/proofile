"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  parseSkills,
  ProjectForm,
  type ProjectFormValues,
} from "@/components/ProjectForm";

type ViewState =
  | { type: "loading" }
  | { type: "ready"; userId: string; email: string | null }
  | { type: "error"; message: string };

export default function NewProjectPage() {
  const router = useRouter();
  const [view, setView] = useState<ViewState>({ type: "loading" });
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data, error } = await supabase.auth.getSession();
      if (cancelled) return;
      if (error) {
        setView({ type: "error", message: error.message });
        return;
      }
      if (!data.session) {
        router.replace("/login");
        return;
      }

      setView({
        type: "ready",
        userId: data.session.user.id,
        email: data.session.user.email ?? null,
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

  async function ensureProfile(userId: string, email: string | null) {
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: userId, email: email ?? undefined }, { onConflict: "id" });
    if (error) throw error;
  }

  async function onSubmit(values: ProjectFormValues) {
    if (view.type !== "ready" || busy) return;

    setSubmitError(null);
    setBusy(true);

    try {
      await ensureProfile(view.userId, view.email);

      const skills = parseSkills(values.skillsText);
      const { error } = await supabase.from("projects").insert({
        user_id: view.userId,
        title: values.title,
        role: values.role || null,
        description: values.description || null,
        skills: skills.length ? skills : null,
        result: values.result || null,
        date: values.date || null,
      });

      if (error) throw error;

      router.replace("/projects");
    } catch (e) {
      const message = e instanceof Error ? e.message : "提交失败，请稍后重试。";
      setSubmitError(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="editorial-shell">
      <section className="editorial-page space-y-6">
        <article className="editorial-card p-8 md:p-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="editorial-kicker">New Entry</div>
              <h1 className="editorial-title mt-5 text-5xl leading-none tracking-tight text-[var(--foreground)] md:text-7xl">
                先把事实写清楚，
                <br />
                再让表达变得更高级。
              </h1>
              <p className="editorial-lead mt-5 max-w-3xl text-base md:text-lg">
                项目名称、角色、过程、技能和成果越清楚，后续 AI 简历输出就越接近真实可投递材料。
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/projects" className="editorial-button-secondary">
                返回列表
              </Link>
            </div>
          </div>
        </article>

        <section className="editorial-card p-8 md:p-10">
          <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
            <article>
              <div className="editorial-label">Writing Notes</div>
              <h2 className="editorial-title mt-3 text-4xl leading-none text-[var(--foreground)]">
                一条好的项目卡片，
                <br />
                要同时回答三个问题。
              </h2>
              <div className="mt-6 space-y-4">
                <div className="paper-panel p-4">
                  <div className="editorial-label">What</div>
                  <p className="editorial-lead mt-2 text-sm">这个项目是什么，你的角色是什么。</p>
                </div>
                <div className="paper-panel p-4">
                  <div className="editorial-label">How</div>
                  <p className="editorial-lead mt-2 text-sm">你具体做了哪些设计、开发或协作工作。</p>
                </div>
                <div className="paper-panel p-4">
                  <div className="editorial-label">Result</div>
                  <p className="editorial-lead mt-2 text-sm">这件事最终带来了什么结果、影响或指标变化。</p>
                </div>
              </div>
            </article>

            <article>
              {view.type === "loading" ? (
                <div className="editorial-lead text-sm">正在加载表单...</div>
              ) : null}

              {view.type === "error" ? (
                <div className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
                  {view.message}
                </div>
              ) : null}

              {view.type === "ready" ? (
                <ProjectForm
                  submitLabel="创建项目"
                  onSubmit={onSubmit}
                  busy={busy}
                  errorMessage={submitError}
                />
              ) : null}
            </article>
          </div>
        </section>

        <section className="px-1 text-xs leading-6 text-[var(--muted)]">
          如果创建时提示 <span className="font-mono">profiles</span> 表或权限有问题，请先在 Supabase 执行
          <span className="font-mono"> database/schema.sql </span>
          并确认最新策略已经生效。
        </section>
      </section>
    </main>
  );
}
