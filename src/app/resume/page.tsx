"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { GeneratedResume } from "@/lib/resume";

type ResumeState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "ready"; resume: GeneratedResume }
  | { type: "error"; message: string };

async function generateResume(accessToken: string): Promise<GeneratedResume> {
  const res = await fetch("/api/generate-resume", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = (await res.json().catch(() => null)) as
    | { resume: GeneratedResume }
    | { error: string }
    | null;

  if (!res.ok) {
    const message = data && "error" in data ? data.error : `Request failed (${res.status})`;
    throw new Error(message);
  }

  if (!data || !("resume" in data) || typeof data.resume !== "object" || !data.resume) {
    throw new Error("Invalid response from /api/generate-resume.");
  }

  return data.resume;
}

function ContactIcon({ type }: { type: "age" | "location" | "phone" | "email" }) {
  const paths = {
    age: "M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V10h14v10z",
    location:
      "M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z",
    phone:
      "M6.62 10.79a15.46 15.46 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.24.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2z",
    email:
      "M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z",
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[type]} />
    </svg>
  );
}

export default function ResumePage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [state, setState] = useState<ResumeState>({ type: "idle" });

  const canPrint = useMemo(() => state.type === "ready", [state]);
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

    void ensureAuthed();

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

      const resume = await generateResume(data.session.access_token);
      setState({ type: "ready", resume });
    } catch (e) {
      const message = e instanceof Error ? e.message : "生成失败，请稍后重试。";
      setState({ type: "error", message });
    }
  }

  function onPrint() {
    if (!canPrint) return;
    window.print();
  }

  const resume = state.type === "ready" ? state.resume : null;
  const projectEntries = resume?.projects.filter((item) => item.category === "project") ?? [];
  const internshipEntries = resume?.projects.filter((item) => item.category === "internship") ?? [];
  const mergedAwards = Array.from(new Set([...(resume?.awards ?? []), ...(resume?.manualAwards ?? [])]));

  return (
    <main className="editorial-shell print:w-full print:max-w-none">
      <section className="editorial-page space-y-6 print:border-0 print:bg-transparent print:p-0 print:shadow-none">
        <article className="editorial-card p-8 md:p-10 print:hidden">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="editorial-kicker">Delivery Resume</div>
              <h1 className="editorial-title mt-5 text-5xl leading-none tracking-tight text-[var(--foreground)] md:text-7xl">
                用项目卡片驱动简历，
                <br />
                再输出 A4 投递版成品。
              </h1>
              <p className="editorial-lead mt-5 max-w-3xl text-base md:text-lg">
                {email ? `当前登录邮箱：${email}。` : ""}
                项目经历、实习经历和自我评价都会从项目卡片自动提炼，资料页只负责基础信息和手动奖项补充。
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/profile" className="editorial-button-secondary">
                编辑资料
              </Link>
              <button type="button" onClick={onGenerate} disabled={!canGenerate} className="editorial-button">
                {state.type === "loading" ? "生成中..." : "生成简历"}
              </button>
              <button type="button" onClick={onPrint} disabled={!canPrint} className="editorial-button-secondary">
                导出 PDF
              </button>
            </div>
          </div>
        </article>

        {state.type === "idle" ? (
          <section className="editorial-card p-8 md:p-10 print:hidden">
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <article>
                <div className="editorial-label">Generation Logic</div>
                <h2 className="editorial-title mt-3 text-4xl leading-none text-[var(--foreground)]">
                  用户不再手填项目和实习，
                  <br />
                  统一从项目卡片自动生成。
                </h2>
                <p className="editorial-lead mt-5 text-base">
                  这版简历会自动提炼项目 bullet、实习内容、自我评价和奖项亮点，手动资料只保留基础信息、教育和补充奖项。
                </p>
              </article>
              <article className="paper-panel p-6">
                <div className="editorial-label">Generation Sources</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="editorial-chip">项目卡片 → 项目经历</span>
                  <span className="editorial-chip">项目卡片 → 实习经历</span>
                  <span className="editorial-chip">项目卡片 → 自我评价</span>
                  <span className="editorial-chip">项目卡片 + 手动输入 → 奖项荣誉</span>
                </div>
              </article>
            </div>
          </section>
        ) : null}

        {state.type === "error" ? (
          <section className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 print:border-0 print:bg-transparent print:px-0 print:py-0">
            <div className="font-medium">生成失败</div>
            <div className="mt-2 break-words">{state.message}</div>
          </section>
        ) : null}

        {resume ? (
          <section className="resume-paper">
            <aside className="resume-sidebar">
              <img
                className="resume-photo"
                src={resume.profile.photoUrl || "https://via.placeholder.com/140x180?text=Photo"}
                alt={resume.profile.name || "个人照片"}
              />
              <div className="resume-watermark">Personal resume</div>
            </aside>

            <section className="resume-main">
              <header>
                <h1 className="resume-name">{resume.profile.name || "姓名待补充"}</h1>
                <div className="resume-intent">求职意向：{resume.profile.targetRole}</div>
                <div className="resume-header-line"></div>
                <div className="resume-contact">
                  {resume.profile.age ? (
                    <div className="resume-contact-item">
                      <ContactIcon type="age" />
                      {resume.profile.age}
                    </div>
                  ) : null}
                  {resume.profile.location ? (
                    <div className="resume-contact-item">
                      <ContactIcon type="location" />
                      {resume.profile.location}
                    </div>
                  ) : null}
                  {resume.profile.phone ? (
                    <div className="resume-contact-item">
                      <ContactIcon type="phone" />
                      {resume.profile.phone}
                    </div>
                  ) : null}
                  {resume.profile.email ? (
                    <div className="resume-contact-item">
                      <ContactIcon type="email" />
                      {resume.profile.email}
                    </div>
                  ) : null}
                </div>
              </header>

              {resume.education.length ? (
                <section className="resume-section">
                  <div className="resume-section-title">教育背景</div>
                  {resume.education.map((item) => (
                    <article key={`${item.school}-${item.date}`} className="resume-entry">
                      <div className="resume-entry-head">
                        <span>{item.date}</span>
                        <span>{item.school}</span>
                        <span>{[item.major, item.degree].filter(Boolean).join(" ")}</span>
                      </div>
                      {item.coursework.length ? (
                        <>
                          <div className="resume-entry-subtitle">主修课程</div>
                          <div className="resume-entry-body">{item.coursework.join("、")}</div>
                        </>
                      ) : null}
                    </article>
                  ))}
                </section>
              ) : null}

              {projectEntries.length ? (
                <section className="resume-section">
                  <div className="resume-section-title">项目经历</div>
                  {projectEntries.map((project) => (
                    <article key={`${project.title}-${project.date}`} className="resume-entry">
                      <div className="resume-entry-head">
                        <span>{project.date}</span>
                        <span>{project.title}</span>
                        <span>{project.role}</span>
                      </div>
                      <div className="resume-entry-body">
                        <ul>
                          {project.bullets.map((bullet) => (
                            <li key={bullet}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    </article>
                  ))}
                </section>
              ) : null}

              {internshipEntries.length ? (
                <section className="resume-section">
                  <div className="resume-section-title">实习经历</div>
                  {internshipEntries.map((internship) => (
                    <article key={`${internship.title}-${internship.date}`} className="resume-entry">
                      <div className="resume-entry-head">
                        <span>{internship.date}</span>
                        <span>{internship.title}</span>
                        <span>{internship.role}</span>
                      </div>
                      <div className="resume-entry-body">
                        <ul>
                          {internship.bullets.map((bullet) => (
                            <li key={bullet}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    </article>
                  ))}
                </section>
              ) : null}

              {resume.skills.length ? (
                <section className="resume-section">
                  <div className="resume-section-title">技能证书</div>
                  <div className="resume-entry-body resume-inline-list">
                    {resume.skills.map((skill) => (
                      <p key={skill}>{skill}</p>
                    ))}
                  </div>
                </section>
              ) : null}

              {mergedAwards.length ? (
                <section className="resume-section">
                  <div className="resume-section-title">奖项荣誉</div>
                  <div className="resume-entry-body resume-inline-list">
                    {mergedAwards.map((award) => (
                      <p key={award}>{award}</p>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="resume-section">
                <div className="resume-section-title">自我评价</div>
                <div className="resume-summary">{resume.summary}</div>
              </section>
            </section>
          </section>
        ) : null}
      </section>
    </main>
  );
}
