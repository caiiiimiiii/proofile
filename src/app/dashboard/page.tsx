"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RadarChart } from "@/components/RadarChart";
import { supabase } from "@/lib/supabase";
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
  | {
    type: "authed";
    email: string | null;
    projects: Project[];
    scores: RadarDimension[];
  }
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

      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("title,role,description,skills,result");

      if (cancelled) return;
      if (projectsError) {
        setState({ type: "error", message: projectsError.message });
        return;
      }

      const list = (projects ?? []) as Project[];
      setState({
        type: "authed",
        email: data.session.user.email ?? null,
        projects: list,
        scores: calcRadarScores(list),
      });
    }

    void load();

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

  const projectCount = state.type === "authed" ? state.projects.length : 0;
  const scoreAverage =
    state.type === "authed" && state.scores.length
      ? Math.round(
        state.scores.reduce((sum, item) => sum + item.value, 0) / state.scores.length,
      )
      : 0;

  return (
    <main className="editorial-shell">
      <section className="editorial-page space-y-6">
        <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <article className="editorial-card p-8 md:p-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="editorial-kicker">Ivory Editorial Dashboard</div>
              <button onClick={logout} className="editorial-button-secondary">
                退出登录
              </button>
            </div>

            <h1 className="editorial-title mt-6 text-5xl leading-none tracking-tight text-[var(--foreground)] md:text-7xl">
              Proofile
            </h1>
            <h2 className="editorial-title mt-2 text-2xl leading-none tracking-tight text-[var(--foreground)] md:text-3xl">
              你的能力凭证知识库
            </h2>



            <p className="editorial-lead mt-6 max-w-3xl text-base md:text-lg">
              {state.type === "authed"
                ? `当前登录邮箱：${state.email ?? "未知邮箱"}。你的项目资产、能力图谱和投递版简历已经可以被统一管理。`
                : state.type === "error"
                  ? "页面加载遇到问题，请先处理错误信息。"
                  : "正在校验登录状态并读取你的项目资产。"}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/projects" className="editorial-button">
                进入项目列表
              </Link>
              <Link href="/profile" className="editorial-button-secondary">
                编辑简历资料
              </Link>
              <Link href="/resume" className="editorial-button-secondary">
                打开 AI 简历
              </Link>
            </div>
          </article>

          <article className="editorial-card grid gap-4 p-8 md:p-10">
            <div>
              <div className="editorial-label">Editor&apos;s Note</div>
              <h2 className="editorial-title mt-3 text-4xl leading-snug text-[var(--foreground)] md:text-5xl">
                结构化记录
                <br />
                可验证展示
                <br />
                智能简历生成
              </h2>
            </div>

            <p className="editorial-lead text-base">
              让你的每一次成长，都变成一份可信、可查、可一键生成的数字凭证
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="editorial-stat">
                <span className="editorial-label">Project Count</span>
                <strong className="editorial-stat-value">{projectCount}</strong>
                <p className="editorial-lead mt-2 text-sm">已纳入项目库的条目数量。</p>
              </div>
              <div className="editorial-stat">
                <span className="editorial-label">Average Score</span>
                <strong className="editorial-stat-value">{scoreAverage}</strong>
                <p className="editorial-lead mt-2 text-sm">五维能力图谱的平均评分。</p>
              </div>
            </div>
          </article>
        </section>

        {state.type === "error" ? (
          <section className="rounded-[28px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-900">
            {state.message}
          </section>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
          <article className="editorial-card p-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="editorial-label">Capability Mapping</div>
                <h2 className="editorial-title mt-2 text-4xl leading-none text-[var(--foreground)]">
                  能力图谱
                </h2>
              </div>
              <span className="editorial-pill">Live View</span>
            </div>

            {state.type === "loading" ? (
              <div className="editorial-lead mt-10 text-sm">正在生成能力视图...</div>
            ) : state.type === "authed" && state.projects.length ? (
              <>
                <div className="mt-6">
                  <RadarChart dimensions={state.scores} />
                </div>
                <div className="mt-2 grid gap-3">
                  {state.scores.map((dimension) => (
                    <div key={dimension.name} className="paper-panel p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-[var(--foreground)]">{dimension.name}</span>
                        <span className="text-sm font-semibold text-[var(--terracotta)]">
                          {dimension.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : state.type === "authed" ? (
              <div className="editorial-lead mt-10 text-sm">
                还没有项目数据。先创建项目卡片后，这里会生成一张更有解释力的能力雷达图。
              </div>
            ) : null}
          </article>

          <article className="editorial-card p-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="editorial-label">Delivery Flow</div>
                <h2 className="editorial-title mt-2 text-4xl leading-none text-[var(--foreground)]">
                  投递工作台
                </h2>
              </div>
              <span className="editorial-pill">A4 Ready</span>
            </div>

            <div className="mt-6 grid gap-4">
              <article className="paper-panel p-5">
                <div className="editorial-label">Project Ledger</div>
                <h3 className="editorial-title mt-3 text-3xl leading-tight text-[var(--foreground)]">
                  项目记录表
                  <br />
                  <h4 className="editorial-title mt-3 text-xl leading-tight text-[var(--foreground)]">
                    记录你的成长足迹
                  </h4>
                </h3>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href="/projects" className="editorial-button-secondary">
                    查看项目条目
                  </Link>
                  <Link href="/projects/new" className="editorial-button">
                    新建项目
                  </Link>
                </div>
              </article>

              <article className="paper-panel p-5">
                <div className="editorial-label">Resume Profile</div>
                <h3 className="editorial-title mt-3 text-3xl leading-tight text-[var(--foreground)]">
                  个人信息填写
                  <br />
                  <h4 className="editorial-title mt-3 text-xl leading-tight text-[var(--foreground)]">
                  把姓名、教育和基础资料，补成可投递的完整信息
                  </h4>
                </h3>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href="/profile" className="editorial-button-secondary">
                    编辑简历资料
                  </Link>
                </div>
              </article>

              <article className="paper-panel p-5">
                <div className="editorial-label">Resume Studio</div>
                <h3 className="editorial-title mt-3 text-3xl leading-tight text-[var(--foreground)]">
                  生成投递版简历，直接打印导出 PDF
                </h3>
                <p className="editorial-title mt-3 text-xl leading-tight text-[var(--foreground)]">
                  模型会先生成结构化内容，再映射到投递版模板页面
                  <br/>
                  支持打印和 PDF 导出
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href="/resume" className="editorial-button">
                    生成简历
                  </Link>
                </div>
              </article>
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
