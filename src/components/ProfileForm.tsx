"use client";

import { useState } from "react";

export type ProfileFormValues = {
  fullName: string;
  phone: string;
  location: string;
  age: string;
  targetRole: string;
  photoUrl: string;
  educationDate: string;
  school: string;
  major: string;
  degree: string;
  coursework: string;
  awards: string;
};

export function parseLines(value: string): string[] {
  return value
    .split(/[\n；;]+/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseCoursework(value: string): string[] {
  return value
    .split(/[，,\n]+/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ProfileForm({
  initialValues,
  busy,
  errorMessage,
  onSubmit,
}: {
  initialValues?: Partial<ProfileFormValues>;
  busy?: boolean;
  errorMessage?: string | null;
  onSubmit: (values: ProfileFormValues) => Promise<void> | void;
}) {
  const [values, setValues] = useState<ProfileFormValues>({
    fullName: initialValues?.fullName ?? "",
    phone: initialValues?.phone ?? "",
    location: initialValues?.location ?? "",
    age: initialValues?.age ?? "",
    targetRole: initialValues?.targetRole ?? "",
    photoUrl: initialValues?.photoUrl ?? "",
    educationDate: initialValues?.educationDate ?? "",
    school: initialValues?.school ?? "",
    major: initialValues?.major ?? "",
    degree: initialValues?.degree ?? "",
    coursework: initialValues?.coursework ?? "",
    awards: initialValues?.awards ?? "",
  });

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        void onSubmit({
          ...values,
          fullName: values.fullName.trim(),
          phone: values.phone.trim(),
          location: values.location.trim(),
          age: values.age.trim(),
          targetRole: values.targetRole.trim(),
          photoUrl: values.photoUrl.trim(),
          educationDate: values.educationDate.trim(),
          school: values.school.trim(),
          major: values.major.trim(),
          degree: values.degree.trim(),
          coursework: values.coursework.trim(),
          awards: values.awards.trim(),
        });
      }}
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="editorial-label block">姓名</label>
          <input
            className="editorial-input"
            value={values.fullName}
            onChange={(e) => setValues((prev) => ({ ...prev, fullName: e.target.value }))}
            placeholder="例如：张三"
            disabled={busy}
          />
        </div>

        <div className="space-y-2">
          <label className="editorial-label block">求职意向</label>
          <input
            className="editorial-input"
            value={values.targetRole}
            onChange={(e) => setValues((prev) => ({ ...prev, targetRole: e.target.value }))}
            placeholder="例如：前端开发工程师"
            disabled={busy}
          />
        </div>

        <div className="space-y-2">
          <label className="editorial-label block">电话</label>
          <input
            className="editorial-input"
            value={values.phone}
            onChange={(e) => setValues((prev) => ({ ...prev, phone: e.target.value }))}
            placeholder="例如：13800000000"
            disabled={busy}
          />
        </div>

        <div className="space-y-2">
          <label className="editorial-label block">所在地</label>
          <input
            className="editorial-input"
            value={values.location}
            onChange={(e) => setValues((prev) => ({ ...prev, location: e.target.value }))}
            placeholder="例如：浙江杭州"
            disabled={busy}
          />
        </div>

        <div className="space-y-2">
          <label className="editorial-label block">年龄</label>
          <input
            className="editorial-input"
            value={values.age}
            onChange={(e) => setValues((prev) => ({ ...prev, age: e.target.value }))}
            placeholder="例如：24岁"
            disabled={busy}
          />
        </div>

        <div className="space-y-2">
          <label className="editorial-label block">照片 URL</label>
          <input
            className="editorial-input"
            value={values.photoUrl}
            onChange={(e) => setValues((prev) => ({ ...prev, photoUrl: e.target.value }))}
            placeholder="可选，填写公开图片地址"
            disabled={busy}
          />
        </div>

        <div className="space-y-2">
          <label className="editorial-label block">教育时间</label>
          <input
            className="editorial-input"
            value={values.educationDate}
            onChange={(e) => setValues((prev) => ({ ...prev, educationDate: e.target.value }))}
            placeholder="例如：2021.09-2025.06"
            disabled={busy}
          />
        </div>

        <div className="space-y-2">
          <label className="editorial-label block">学校</label>
          <input
            className="editorial-input"
            value={values.school}
            onChange={(e) => setValues((prev) => ({ ...prev, school: e.target.value }))}
            placeholder="例如：某某大学"
            disabled={busy}
          />
        </div>

        <div className="space-y-2">
          <label className="editorial-label block">专业</label>
          <input
            className="editorial-input"
            value={values.major}
            onChange={(e) => setValues((prev) => ({ ...prev, major: e.target.value }))}
            placeholder="例如：计算机科学与技术"
            disabled={busy}
          />
        </div>

        <div className="space-y-2">
          <label className="editorial-label block">学历</label>
          <input
            className="editorial-input"
            value={values.degree}
            onChange={(e) => setValues((prev) => ({ ...prev, degree: e.target.value }))}
            placeholder="例如：本科"
            disabled={busy}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="editorial-label block">主修课程</label>
          <textarea
            className="editorial-textarea min-h-[120px]"
            value={values.coursework}
            onChange={(e) => setValues((prev) => ({ ...prev, coursework: e.target.value }))}
            placeholder="用逗号分隔，例如：数据结构，操作系统，计算机网络"
            disabled={busy}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="editorial-label block">手动补充奖项 / 证书</label>
          <textarea
            className="editorial-textarea min-h-[120px]"
            value={values.awards}
            onChange={(e) => setValues((prev) => ({ ...prev, awards: e.target.value }))}
            placeholder="每行一条，例如：CET-6；蓝桥杯省赛二等奖"
            disabled={busy}
          />
        </div>
      </div>

      <div className="paper-panel p-5 text-sm leading-7 text-[var(--muted)]">
        项目经历、实习经历和自我评价不再手动填写。系统会基于你已有的项目卡片自动提炼这些内容，奖项荣誉则由项目提炼结果与这里的手动补充一起合并生成。
      </div>

      {errorMessage ? (
        <div className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {errorMessage}
        </div>
      ) : null}

      <button type="submit" className="editorial-button w-full" disabled={busy}>
        {busy ? "保存中..." : "保存资料"}
      </button>
    </form>
  );
}
