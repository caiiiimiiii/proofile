export type ResumeProfile = {
  name: string;
  targetRole: string;
  age: string;
  location: string;
  phone: string;
  email: string;
  photoUrl: string;
};

export type ResumeEducation = {
  date: string;
  school: string;
  major: string;
  degree: string;
  coursework: string[];
};

export type ResumeProject = {
  title: string;
  role: string;
  date: string;
  bullets: string[];
  skills: string[];
  category: "project" | "internship";
};

export type GeneratedResume = {
  profile: ResumeProfile;
  summary: string;
  education: ResumeEducation[];
  projects: ResumeProject[];
  skills: string[];
  awards: string[];
  manualAwards: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStringArray(value: unknown): string[] {
  if (!isStringArray(value)) return [];
  return value.map((item) => item.trim()).filter(Boolean);
}

export function parseGeneratedResume(input: unknown): GeneratedResume | null {
  if (!isRecord(input)) return null;

  const profileRaw = input.profile;
  if (!isRecord(profileRaw)) return null;
  if (!Array.isArray(input.education)) return null;
  if (!Array.isArray(input.projects)) return null;
  if (!isStringArray(input.skills)) return null;
  if (!isStringArray(input.awards)) return null;

  const profile: ResumeProfile = {
    name: normalizeString(profileRaw.name),
    targetRole: normalizeString(profileRaw.targetRole),
    age: normalizeString(profileRaw.age),
    location: normalizeString(profileRaw.location),
    phone: normalizeString(profileRaw.phone),
    email: normalizeString(profileRaw.email),
    photoUrl: normalizeString(profileRaw.photoUrl),
  };

  if (!profile.targetRole || !profile.email) return null;

  const education: ResumeEducation[] = [];
  for (const item of input.education) {
    if (!isRecord(item)) return null;
    education.push({
      date: normalizeString(item.date),
      school: normalizeString(item.school),
      major: normalizeString(item.major),
      degree: normalizeString(item.degree),
      coursework: normalizeStringArray(item.coursework),
    });
  }

  const projects: ResumeProject[] = [];
  for (const item of input.projects) {
    if (!isRecord(item)) return null;

    const title = normalizeString(item.title);
    const role = normalizeString(item.role);
    const date = normalizeString(item.date);
    const bullets = normalizeStringArray(item.bullets);
    const skills = normalizeStringArray(item.skills);
    const category = item.category === "internship" ? "internship" : "project";

    if (!title || !role || !date || !bullets.length) return null;

    projects.push({
      title,
      role,
      date,
      bullets,
      skills,
      category,
    });
  }

  const summary = normalizeString(input.summary);
  const skills = normalizeStringArray(input.skills);
  const awards = normalizeStringArray(input.awards);
  const manualAwards = normalizeStringArray(input.manualAwards);

  if (!summary || !projects.length) return null;

  return {
    profile,
    summary,
    education,
    projects,
    skills,
    awards,
    manualAwards,
  };
}

export function fallbackResumeFromProjects(args: {
  email: string;
  name?: string;
  photoUrl?: string;
  targetRole?: string;
  education?: ResumeEducation[];
  manualAwards?: string[];
  projects: Array<{
    title: string;
    role: string | null;
    description: string | null;
    skills: string[] | null;
    result: string | null;
    date: string | null;
  }>;
}): GeneratedResume {
  const allSkills = Array.from(
    new Set(args.projects.flatMap((project) => project.skills ?? []).filter(Boolean)),
  );

  return {
    profile: {
      name: args.name?.trim() ?? "",
      targetRole: args.targetRole?.trim() || "前端开发 / AI 应用产品相关岗位",
      age: "",
      location: "",
      phone: "",
      email: args.email,
      photoUrl: args.photoUrl?.trim() ?? "",
    },
    summary:
      "具备项目梳理、前端实现与 AI 内容生成能力，能够将复杂经历整理为适合投递和展示的职业材料。",
    education: args.education ?? [],
    projects: args.projects.slice(0, 6).map((project) => ({
      title: project.title,
      role: project.role ?? "项目核心成员",
      date: project.date ?? "时间待补充",
      bullets: [
        project.description?.trim() || "负责项目核心模块的设计与实现，推进功能按计划落地。",
        project.result?.trim() || "梳理项目过程与成果表达，为后续简历生成和投递展示提供稳定素材。",
      ],
      skills: (project.skills ?? []).slice(0, 6),
      category: "project",
    })),
    skills: allSkills.slice(0, 12),
    awards: [],
    manualAwards: args.manualAwards ?? [],
  };
}
