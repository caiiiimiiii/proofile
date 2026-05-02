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

function toFormValues(project: ProjectRow): ProjectFormValues {
  return {
    title: project.title ?? "",
    role: project.role ?? "",
    description: project.description ?? "",
    skillsText: (project.skills ?? []).join(", "),
    result: project.result ?? "",
    date: project.date ?? "",
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
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      if (cancelled) return;
      if (sessionError) {
        setView({ type: "error", message: sessionError.message });
        return;
      }
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

    void load();

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
    if (view.type !== "ready" || busy) return;

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
      const message = e instanceof Error ? e.message : "保存失败，请稍后重试。";
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
              <div className="editorial-kicker">Edit Entry</div>
              <h1 className="editorial-title mt-5 text-5xl leading-none tracking-tight text-[var(--foreground)] md:text-7xl">
                修改项目条目，
                <br />
                让叙事更完整也更干净。
              </h1>
              <p className="editorial-lead mt-5 max-w-3xl text-base md:text-lg">
                编辑后的内容会直接影响项目列表展示、能力图谱分析，以及 AI 简历的最终输出质量。
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
          {view.type === "loading" ? (
            <div className="editorial-lead text-sm">正在加载项目内容...</div>
          ) : null}

          {view.type === "notFound" ? (
            <div className="space-y-5">
              <div className="editorial-label">Not Found</div>
              <h2 className="editorial-title text-4xl leading-none text-[var(--foreground)]">
                项目不存在，或你没有编辑权限。
              </h2>
              <Link href="/projects" className="editorial-button w-fit">
                返回项目列表
              </Link>
            </div>
          ) : null}

          {view.type === "error" ? (
            <div className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
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
        </section>
      </section>
    </main>
  );
}
