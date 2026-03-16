"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { parseSkills, ProjectForm, type ProjectFormValues } from "@/components/ProjectForm";

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

  async function ensureProfile(userId: string, email: string | null) {
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: userId, email: email ?? undefined }, { onConflict: "id" });
    if (error) throw error;
  }

  async function onSubmit(values: ProjectFormValues) {
    if (view.type !== "ready") return;
    if (busy) return;

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
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto w-full max-w-3xl px-6 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-sm text-zinc-500">项目卡片</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
              新建项目
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              填写关键信息，后续可用于生成简历与能力画像。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/projects"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
            >
              返回列表
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          {view.type === "loading" ? (
            <div className="text-sm text-zinc-600">加载中...</div>
          ) : null}

          {view.type === "error" ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
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
        </div>

        <div className="mt-6 text-xs leading-5 text-zinc-500">
          若创建时报错提示 <span className="font-mono">profiles</span>{" "}
          或权限问题，请确认已在 Supabase 执行{" "}
          <span className="font-mono">database/schema.sql</span>，并应用了最新的
          profiles 策略。
        </div>
      </div>
    </div>
  );
}

