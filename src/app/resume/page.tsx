"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type ResumeState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "ready"; text: string }
  | { type: "error"; message: string };

async function generateResume(accessToken: string): Promise<string> {
  const res = await fetch("/api/generate-resume", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = (await res.json().catch(() => null)) as
    | { resumeText: string }
    | { error: string }
    | null;

  if (!res.ok) {
    const msg = data && "error" in data ? data.error : `Request failed (${res.status})`;
    throw new Error(msg);
  }

  if (!data || !("resumeText" in data) || typeof data.resumeText !== "string") {
    throw new Error("Invalid response from /api/generate-resume.");
  }

  return data.resumeText;
}

export default function ResumePage() {
  const router = useRouter();

  const [email, setEmail] = useState<string | null>(null);
  const [state, setState] = useState<ResumeState>({ type: "idle" });

  const canPrint = useMemo(() => state.type === "ready" && !!state.text, [state]);
  const canGenerate = useMemo(() => state.type !== "loading", [state]);

  useEffect(() => {
    let cancelled = false;

    async function ensureAuthed() {
      const { data, error } = await supabase.auth.getSession();
      if (cancelled) return;
      if (error) {
        setState({ type: "error", message: error.message });
        return;
      }
      if (!data.session) {
        router.replace("/login");
        return;
      }

      setEmail(data.session.user.email ?? null);
    }

    ensureAuthed();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      if (!session) router.replace("/login");
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  async function onGenerate() {
    setState({ type: "loading" });
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!data.session?.access_token) {
        router.replace("/login");
        return;
      }

      const text = await generateResume(data.session.access_token);
      setState({ type: "ready", text });
    } catch (e) {
      const message = e instanceof Error ? e.message : "生成失败，请稍后重试。";
      setState({ type: "error", message });
    }
  }

  function onPrint() {
    if (!canPrint) return;
    window.print();
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto w-full max-w-4xl px-6 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between print:hidden">
          <div>
            <div className="text-sm text-zinc-500">AI 简历</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
              简历生成
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              {email ? `已登录：${email} · ` : ""}
              点击按钮生成简历文本，可通过打印保存为 PDF。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
            >
              返回仪表盘
            </Link>
            <button
              type="button"
              onClick={onGenerate}
              disabled={!canGenerate}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {state.type === "loading" ? "生成中..." : "生成简历"}
            </button>
            <button
              type="button"
              onClick={onPrint}
              disabled={!canPrint}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              下载为 PDF
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm print:mt-0 print:rounded-none print:border-0 print:p-0 print:shadow-none">
          {state.type === "idle" ? (
            <div className="text-sm text-zinc-600">
              点击上方“生成简历”按钮开始。
            </div>
          ) : null}

          {state.type === "error" ? (
            <div className="space-y-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900 print:border-0 print:bg-transparent print:px-0 print:py-0">
              <div className="font-medium">生成失败</div>
              <div className="break-words">{state.message}</div>
              <div className="text-xs text-red-900/80 print:hidden">
                如果提示没有项目，请先在 <span className="font-mono">/projects</span>{" "}
                创建至少 1 个项目卡片。
              </div>
            </div>
          ) : null}

          {state.type === "ready" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 print:hidden">
                <div className="text-sm font-medium text-zinc-900">
                  简历文本
                </div>
                <div className="text-xs text-zinc-500">
                  提示：打印时选择“另存为 PDF”
                </div>
              </div>

              <div className="max-h-[520px] overflow-auto rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-900 print:max-h-none print:overflow-visible print:rounded-none print:border-0 print:bg-transparent print:p-0">
                <pre className="whitespace-pre-wrap font-sans">
                  {state.text}
                </pre>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

