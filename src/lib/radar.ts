export type RadarDimension = {
  name: string;
  value: number;
};

type Project = {
  title?: string | null;
  role?: string | null;
  description?: string | null;
  skills?: string[] | null;
  result?: string | null;
};

function contains(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

export function calcRadarScores(projects: Project[]): RadarDimension[] {
  if (!projects.length) {
    return [
      { name: "技术能力", value: 0 },
      { name: "团队协作", value: 0 },
      { name: "创新能力", value: 0 },
      { name: "科研能力", value: 0 },
      { name: "表达能力", value: 0 },
    ];
  }

  const allSkills = new Set(projects.flatMap((project) => project.skills ?? []));
  const allText = projects
    .map((project) => [project.title, project.role, project.description, project.result].join(" "))
    .join(" ")
    .toLowerCase();

  const techScore = Math.min(100, allSkills.size * 8 + projects.length * 5);

  const teamKeywords = ["团队", "协作", "合作", "leader", "负责人", "组长", "成员", "配合"];
  const teamProjects = projects.filter((project) =>
    contains(
      [project.role, project.description, project.result].join(" ").toLowerCase(),
      teamKeywords,
    ),
  ).length;
  const teamScore = Math.min(100, 30 + Math.round((teamProjects / projects.length) * 70));

  const innovKeywords = ["创新", "设计", "方案", "优化", "改进", "提出", "探索", "新型", "首次"];
  const innovProjects = projects.filter((project) =>
    contains([project.description, project.result].join(" ").toLowerCase(), innovKeywords),
  ).length;
  const innovScore = Math.min(100, 20 + Math.round((innovProjects / projects.length) * 80));

  const researchKeywords = ["研究", "论文", "实验", "数据", "分析", "模型", "算法", "调研", "文献"];
  const researchProjects = projects.filter(
    (project) =>
      contains(allText, researchKeywords) ||
      contains([project.title, project.role, project.description].join(" ").toLowerCase(), researchKeywords),
  ).length;
  const researchScore = Math.min(100, 15 + Math.round((researchProjects / projects.length) * 85));

  const avgLen =
    projects.reduce(
      (sum, project) => sum + (project.description?.length ?? 0) + (project.result?.length ?? 0),
      0,
    ) / projects.length;
  const expressScore = Math.min(100, Math.round(avgLen / 3));

  return [
    { name: "技术能力", value: techScore },
    { name: "团队协作", value: teamScore },
    { name: "创新能力", value: innovScore },
    { name: "科研能力", value: researchScore },
    { name: "表达能力", value: expressScore },
  ];
}
