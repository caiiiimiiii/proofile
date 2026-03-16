"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

function getOrigin() {
  if (typeof window === "undefined") return "";
  return window.location.origin;
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    | { type: "idle" }
    | { type: "sending" }
    | { type: "sent" }
    | { type: "error"; message: string }
  >({ type: "idle" });

  const emailTrimmed = useMemo(() => email.trim(), [email]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (cancelled) return;
      if (error) return;
      if (data.session) router.replace("/dashboard");
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!emailTrimmed) {
      setStatus({ type: "error", message: "请输入邮箱。" });
      return;
    }

    setStatus({ type: "sending" });
    const origin = getOrigin();

    const { error } = await supabase.auth.signInWithOtp({
      email: emailTrimmed,
      options: origin
        ? {
            emailRedirectTo: `${origin}/dashboard`,
          }
        : undefined,
    });

    if (error) {
      setStatus({ type: "error", message: error.message });
      return;
    }

    setStatus({ type: "sent" });
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
              登录履迹
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              输入邮箱，我们会发送一封 magic link 给你。
            </p>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-zinc-800"
              >
                邮箱
              </label>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-zinc-100"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status.type === "sending"}
                required
              />
            </div>

            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={status.type === "sending"}
            >
              {status.type === "sending" ? "发送中..." : "发送登录链接"}
            </button>

            {status.type === "sent" ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                已发送，请去邮箱点击登录链接。
              </div>
            ) : null}

            {status.type === "error" ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
                {status.message}
              </div>
            ) : null}
          </form>

          <div className="mt-6 text-xs leading-5 text-zinc-500">
            点击邮件中的链接后会自动跳转到仪表盘。
          </div>
        </div>
      </div>
    </div>
  );
}

