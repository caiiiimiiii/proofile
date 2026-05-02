"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Status =
  | { type: "idle" }
  | { type: "sending" }
  | { type: "error"; message: string };

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("00000000");
  const [status, setStatus] = useState<Status>({ type: "idle" });

  const emailTrimmed = useMemo(() => email.trim(), [email]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (cancelled || error) return;
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

    if (!password.trim()) {
      setStatus({ type: "error", message: "请输入密码。" });
      return;
    }

    setStatus({ type: "sending" });

    const { error } = await supabase.auth.signInWithPassword({
      email: emailTrimmed,
      password,
    });

    if (error) {
      setStatus({ type: "error", message: error.message });
      return;
    }

    router.replace("/dashboard");
  }

  return (
    <main className="editorial-shell">
      <section className="editorial-page">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="editorial-card p-8 md:p-10">
            <div className="editorial-kicker">Ivory Editorial Login</div>
            <h1 className="editorial-title mt-6 text-5xl leading-none tracking-tight text-[var(--foreground)] md:text-7xl">
              把项目经历，
              <br />
              整理成一份真正有分量的职业档案。
            </h1>
            <p className="editorial-lead mt-6 max-w-2xl text-base md:text-lg">
              Proofile 用项目卡片、能力图谱和 AI 简历生成，把零散经历重写成更适合投递、展示和表达的个人材料。
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="editorial-stat">
                <span className="editorial-label">Project Ledger</span>
                <strong className="editorial-stat-value">12</strong>
                <p className="editorial-lead mt-2 text-sm">项目沉淀为结构化卡片，方便后续提炼。</p>
              </div>
              <div className="editorial-stat">
                <span className="editorial-label">Resume Studio</span>
                <strong className="editorial-stat-value">06</strong>
                <p className="editorial-lead mt-2 text-sm">简历版本可迭代、可打印、可持续优化。</p>
              </div>
              <div className="editorial-stat">
                <span className="editorial-label">Capability Map</span>
                <strong className="editorial-stat-value">05</strong>
                <p className="editorial-lead mt-2 text-sm">五维能力画像帮助你理解当前优势分布。</p>
              </div>
            </div>
          </article>

          <article className="editorial-card p-8 md:p-10">
            <div className="editorial-label">Sign In</div>
            <h2 className="editorial-title mt-3 text-4xl leading-none text-[var(--foreground)] md:text-5xl">
              账号密码登录
            </h2>
            <p className="editorial-lead mt-4 text-base">
              账号为邮箱。当前阶段不开放注册和修改密码，初始密码固定为
              <span className="font-mono"> 00000000 </span>。
            </p>

            <form className="mt-8 space-y-5" onSubmit={onSubmit}>
              <div className="space-y-2">
                <label htmlFor="email" className="editorial-label block">
                  邮箱地址
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="editorial-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status.type === "sending"}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="editorial-label block">
                  密码
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className="editorial-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={status.type === "sending"}
                  required
                />
              </div>

              <button
                type="submit"
                className="editorial-button w-full"
                disabled={status.type === "sending"}
              >
                {status.type === "sending" ? "登录中..." : "进入 Proofile"}
              </button>

              {status.type === "error" ? (
                <div className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
                  {status.message}
                </div>
              ) : null}
            </form>

            <div className="editorial-divider my-8"></div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="paper-panel p-4">
                <div className="editorial-label">Current Mode</div>
                <p className="editorial-lead mt-2 text-sm">
                  现在只保留账号密码登录，去掉邮箱 magic link 登录流程，登录动作更直接。
                </p>
              </div>
              <div className="paper-panel p-4">
                <div className="editorial-label">Initial Password</div>
                <p className="editorial-lead mt-2 text-sm">
                  你已在 Supabase 中手动设置目标账号初始密码为 <span className="font-mono">00000000</span>。
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
