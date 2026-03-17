export type RadarDimension = {
  name: string;
  value: number; // 0-100
};

type Project = {
  title?: string | null;
  role?: string | null;
  description?: string | null;
  skills?: string[] | null;
  result?: string | null;
};

function contains(text: string, keywords: string[]): boolean {
  return keywords.some((k) => text.includes(k));
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

  const allSkills = new Set(projects.flatMap((p) => p.skills ?? []));
  const allText = projects
    .map((p) => [p.title, p.role, p.description, p.result].join(" "))
    .join(" ")
    .toLowerCase();

  // 技术能力：技能种类数 + 项目数，满分 100
  const techScore = Math.min(100, allSkills.size * 8 + projects.length * 5);

  // 团队协作：含协作关键词的项目比例
  const teamKeywords = ["团队", "协作", "合作", "leader", "负责人", "组长", "成员", "配合"];
  const teamProjects = projects.filter((p) =>
    contains([p.role, p.description, p.result].join(" ").toLowerCase(), teamKeywords)
  ).length;
  const teamScore = Math.min(100, 30 + Math.round((teamProjects / projects.length) * 70));

  // 创新能力：含创新关键词
  const innovKeywords = ["创新", "设计", "方案", "优化", "改进", "提出", "探索", "新型", "首次"];
  const innovProjects = projects.filter((p) =>
    contains([p.description, p.result].join(" ").toLowerCase(), innovKeywords)
  ).length;
  const innovScore = Math.min(100, 20 + Math.round((innovProjects / projects.length) * 80));

  // 科研能力：含科研关键词
  const researchKeywords = ["研究", "论文", "实验", "数据", "分析", "模型", "算法", "调研", "文献"];
  const researchProjects = projects.filter((p) =>
    contains(allText, researchKeywords) ||
    contains([p.title, p.role, p.description].join(" ").toLowerCase(), researchKeywords)
  ).length;
  const researchScore = Math.min(100, 15 + Math.round((researchProjects / projects.length) * 85));

  // 表达能力：description + result 平均字数
  const avgLen =
    projects.reduce((sum, p) => sum + (p.description?.length ?? 0) + (p.result?.length ?? 0), 0) /
    projects.length;
  const expressScore = Math.min(100, Math.round(avgLen / 3));

  return [
    { name: "技术能力", value: techScore },
    { name: "团队协作", value: teamScore },
    { name: "创新能力", value: innovScore },
    { name: "科研能力", value: researchScore },
    { name: "表达能力", value: expressScore },
  ];
}
