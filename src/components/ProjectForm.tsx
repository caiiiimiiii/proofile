"use client";

import { useMemo, useState } from "react";

export type ProjectFormValues = {
  title: string;
  role: string;
  description: string;
  skillsText: string;
  result: string;
  date: string;
};

export function parseSkills(skillsText: string): string[] {
  const items = skillsText
    .split(/[，,\n]/g)
    .map((skill) => skill.trim())
    .filter(Boolean);

  const unique: string[] = [];
  for (const skill of items) {
    if (!unique.includes(skill)) unique.push(skill);
  }

  return unique;
}

export function ProjectForm({
  initialValues,
  submitLabel,
  onSubmit,
  busy,
  errorMessage,
}: {
  initialValues?: Partial<ProjectFormValues>;
  submitLabel: string;
  onSubmit: (values: ProjectFormValues) => Promise<void> | void;
  busy?: boolean;
  errorMessage?: string | null;
}) {
  const [values, setValues] = useState<ProjectFormValues>({
    title: initialValues?.title ?? "",
    role: initialValues?.role ?? "",
    description: initialValues?.description ?? "",
    skillsText: initialValues?.skillsText ?? "",
    result: initialValues?.result ?? "",
    date: initialValues?.date ?? "",
  });

  const skillsPreview = useMemo(
    () => parseSkills(values.skillsText).slice(0, 12),
    [values.skillsText],
  );

  const canSubmit = values.title.trim().length > 0 && !busy;

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        void onSubmit({
          ...values,
          title: values.title.trim(),
          role: values.role.trim(),
          description: values.description.trim(),
          skillsText: values.skillsText.trim(),
          result: values.result.trim(),
          date: values.date.trim(),
        });
      }}
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label className="editorial-label block">项目名称</label>
          <input
            value={values.title}
            onChange={(e) => setValues((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="例如：高校科研协作档案系统"
            className="editorial-input"
            required
            disabled={busy}
          />
        </div>

        <div className="space-y-2">
          <label className="editorial-label block">角色</label>
          <input
            value={values.role}
            onChange={(e) => setValues((prev) => ({ ...prev, role: e.target.value }))}
            placeholder="例如：前端开发 / 项目负责人"
            className="editorial-input"
            disabled={busy}
          />
        </div>

        <div className="space-y-2">
          <label className="editorial-label block">项目时间</label>
          <input
            value={values.date}
            onChange={(e) => setValues((prev) => ({ ...prev, date: e.target.value }))}
            placeholder="例如：2025.03 - 2025.06"
            className="editorial-input"
            disabled={busy}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="editorial-label block">项目描述</label>
          <textarea
            value={values.description}
            onChange={(e) => setValues((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="写清背景、你负责的部分、关键设计和解决路径。"
            className="editorial-textarea"
            disabled={busy}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="editorial-label block">技能标签</label>
          <textarea
            value={values.skillsText}
            onChange={(e) => setValues((prev) => ({ ...prev, skillsText: e.target.value }))}
            placeholder="例如：React, Next.js, Supabase, TailwindCSS, ECharts"
            className="editorial-textarea min-h-[120px]"
            disabled={busy}
          />

          {skillsPreview.length ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {skillsPreview.map((skill) => (
                <span key={skill} className="editorial-chip">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <div className="editorial-lead text-sm">输入后这里会显示技能标签预览。</div>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="editorial-label block">项目成果</label>
          <textarea
            value={values.result}
            onChange={(e) => setValues((prev) => ({ ...prev, result: e.target.value }))}
            placeholder="尽量写成结果导向表达，例如效率提升、覆盖人数、性能改善或获奖情况。"
            className="editorial-textarea min-h-[120px]"
            disabled={busy}
          />
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {errorMessage}
        </div>
      ) : null}

      <button type="submit" className="editorial-button w-full" disabled={!canSubmit}>
        {busy ? "提交中..." : submitLabel}
      </button>
    </form>
  );
}
