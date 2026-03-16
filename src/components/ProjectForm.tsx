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
    .split(/[,\n，]/g)
    .map((s) => s.trim())
    .filter(Boolean);

  const unique: string[] = [];
  for (const s of items) {
    if (!unique.includes(s)) unique.push(s);
  }
  return unique;
}

export const ProjectForm = ({
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
}) => {
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
      className="space-y-5"
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium text-zinc-800">项目名称</label>
          <input
            value={values.title}
            onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
            placeholder="例如：校园二手交易小程序"
            className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-zinc-100"
            required
            disabled={busy}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-800">角色</label>
          <input
            value={values.role}
            onChange={(e) => setValues((v) => ({ ...v, role: e.target.value }))}
            placeholder="例如：前端开发 / 负责人"
            className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-zinc-100"
            disabled={busy}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-800">项目时间</label>
          <input
            value={values.date}
            onChange={(e) => setValues((v) => ({ ...v, date: e.target.value }))}
            placeholder='例如：2025.03-2025.06'
            className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-zinc-100"
            disabled={busy}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium text-zinc-800">项目描述</label>
          <textarea
            value={values.description}
            onChange={(e) =>
              setValues((v) => ({ ...v, description: e.target.value }))
            }
            placeholder="简要说明你做了什么、怎么做的。"
            className="min-h-28 w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-zinc-100"
            disabled={busy}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium text-zinc-800">技能标签</label>
          <textarea
            value={values.skillsText}
            onChange={(e) =>
              setValues((v) => ({ ...v, skillsText: e.target.value }))
            }
            placeholder="用逗号分隔，例如：React, Next.js, Supabase, Tailwind"
            className="min-h-20 w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-zinc-100"
            disabled={busy}
          />
          {skillsPreview.length ? (
            <div className="flex flex-wrap gap-2">
              {skillsPreview.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700"
                >
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-xs text-zinc-500">暂无技能标签预览</div>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium text-zinc-800">项目成果</label>
          <textarea
            value={values.result}
            onChange={(e) =>
              setValues((v) => ({ ...v, result: e.target.value }))
            }
            placeholder="量化成果/影响，例如：DAU 提升 20%，比赛获奖等。"
            className="min-h-24 w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-zinc-100"
            disabled={busy}
          />
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          {errorMessage}
        </div>
      ) : null}

      <button
        type="submit"
        className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!canSubmit}
      >
        {busy ? "提交中..." : submitLabel}
      </button>
    </form>
  );
};

