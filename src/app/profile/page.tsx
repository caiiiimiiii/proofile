"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  parseCoursework,
  parseLines,
  ProfileForm,
  type ProfileFormValues,
} from "@/components/ProfileForm";
import { supabase } from "@/lib/supabase";

type ViewState =
  | { type: "loading" }
  | { type: "ready"; userId: string; values: Partial<ProfileFormValues> }
  | { type: "error"; message: string };

export default function ProfilePage() {
  const router = useRouter();
  const [state, setState] = useState<ViewState>({ type: "loading" });
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
        router.replace("/login");
        return;
      }

      const userId = data.session.user.id;

      const [profileRes, educationRes, awardsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name,phone,location,age,target_role,photo_url")
          .eq("id", userId)
          .single(),
        supabase
          .from("education_entries")
          .select("date,school,major,degree,coursework")
          .eq("user_id", userId)
          .order("sort_order", { ascending: true })
          .limit(1),
        supabase
          .from("award_entries")
          .select("content")
          .eq("user_id", userId)
          .order("sort_order", { ascending: true }),
      ]);

      if (cancelled) return;

      const education = educationRes.data?.[0];
      const awards = awardsRes.data ?? [];

      setState({
        type: "ready",
        userId,
        values: {
          fullName: profileRes.data?.full_name ?? "",
          phone: profileRes.data?.phone ?? "",
          location: profileRes.data?.location ?? "",
          age: profileRes.data?.age ?? "",
          targetRole: profileRes.data?.target_role ?? "",
          photoUrl: profileRes.data?.photo_url ?? "",
          educationDate: education?.date ?? "",
          school: education?.school ?? "",
          major: education?.major ?? "",
          degree: education?.degree ?? "",
          coursework: (education?.coursework ?? []).join("，"),
          awards: awards.map((item) => item.content).join("\n"),
        },
      });
    }

    void load();
  }, [router]);

  async function onSubmit(values: ProfileFormValues) {
    if (state.type !== "ready" || busy) return;

    setBusy(true);
    setSubmitError(null);

    try {
      const userId = state.userId;

      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: userId,
          full_name: values.fullName || null,
          phone: values.phone || null,
          location: values.location || null,
          age: values.age || null,
          target_role: values.targetRole || null,
          photo_url: values.photoUrl || null,
        },
        { onConflict: "id" },
      );
      if (profileError) throw profileError;

      await supabase.from("education_entries").delete().eq("user_id", userId);
      if (values.school || values.major || values.degree || values.educationDate) {
        const { error } = await supabase.from("education_entries").insert({
          user_id: userId,
          school: values.school || "教育信息待补充",
          major: values.major || null,
          degree: values.degree || null,
          date: values.educationDate || null,
          coursework: parseCoursework(values.coursework),
          sort_order: 0,
        });
        if (error) throw error;
      }

      await supabase.from("award_entries").delete().eq("user_id", userId);
      const awardLines = parseLines(values.awards);
      if (awardLines.length) {
        const { error } = await supabase.from("award_entries").insert(
          awardLines.map((content, index) => ({
            user_id: userId,
            content,
            sort_order: index,
          })),
        );
        if (error) throw error;
      }

      router.replace("/resume");
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
              <div className="editorial-kicker">Resume Profile</div>
              <h1 className="editorial-title mt-5 text-5xl leading-none tracking-tight text-[var(--foreground)] md:text-7xl">
                完善你的基础资料！
              </h1>
              <p className="editorial-lead mt-5 max-w-3xl text-base md:text-lg">
                你只需要补齐姓名、联系方式、教育背景和手动奖项。项目经历、实习经历、自我评价都会由已有项目卡片自动提炼生成。
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard" className="editorial-button-secondary">
                返回仪表盘
              </Link>
            </div>
          </div>
        </article>

        <section className="editorial-card p-8 md:p-10">
          {state.type === "loading" ? (
            <div className="editorial-lead text-sm">正在加载个人资料...</div>
          ) : null}

          {state.type === "error" ? (
            <div className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
              {state.message}
            </div>
          ) : null}

          {state.type === "ready" ? (
            <ProfileForm
              initialValues={state.values}
              busy={busy}
              errorMessage={submitError}
              onSubmit={onSubmit}
            />
          ) : null}
        </section>
      </section>
    </main>
  );
}
