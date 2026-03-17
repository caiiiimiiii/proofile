"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  parseSkills,
  ProjectForm,
  type ProjectFormValues,
} from "@/components/ProjectForm";

type ProjectRow = {
  id: string;
  title: string;
  role: string | null;
  description: string | null;
  skills: string[] | null;
  result: string | null;
  date: string | null;
};

type ViewState =
  | { type: "loading" }
  | { type: "ready"; project: ProjectRow }
  | { type: "notFound" }
  | { type: "error"; message: string };

function toFormValues(p: ProjectRow): ProjectFormValues {
  return {
    title: p.title ?? "",
    role: p.role ?? "",
    description: p.description ?? "",
    skillsText: (p.skills ?? []).join(", "),
    result: p.result ?? "",
    date: p.date ?? "",
  };
}

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const [view, setView] = useState<ViewState>({ type: "loading" });
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setView({ type: "notFound" });
      return;
    }

    let cancelled = false;

    async function load() {
      const { data: session } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!session.session) {
        router.replace("/login");
        return;
      }

      const { data: project, error } = await supabase
        .from("projects")
        .select("id,title,role,description,skills,result,date")
        .eq("id", id)
        .single();

      if (cancelled) return;
      if (error || !project) {
        setView({ type: "notFound" });
        return;
      }

      setView({ type: "ready", project: project as ProjectRow });
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
  }, [id, router]);

  async function onSubmit(values: ProjectFormValues) {
    if (view.type !== "ready") return;
    if (busy) return;

    setSubmitError(null);
    setBusy(true);

    try {
      const skills = parseSkills(values.skillsText);
      const { error } = await supabase
        .from("projects")
        .update({
          title: values.title,
          role: values.role || null,
          description: values.description || null,
          skills: skills.length ? skills : null,
          result: values.result || null,
          date: values.date || null,
        })
        .eq("id", view.project.id);

      if (error) throw error;

      router.replace("/projects");
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "保存失败，请稍后重试。";
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
              编辑项目
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              修改项目信息，保存后将同步到简历与能力画像。
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

          {view.type === "notFound" ? (
            <div className="space-y-4">
              <div className="text-sm font-medium text-zinc-900">
                项目不存在或无权编辑
              </div>
              <Link
                href="/projects"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                返回项目列表
              </Link>
            </div>
          ) : null}

          {view.type === "error" ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
              {view.message}
            </div>
          ) : null}

          {view.type === "ready" ? (
            <ProjectForm
              key={view.project.id}
              initialValues={toFormValues(view.project)}
              submitLabel="保存修改"
              onSubmit={onSubmit}
              busy={busy}
              errorMessage={submitError}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
