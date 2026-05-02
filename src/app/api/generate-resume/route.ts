import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import {
  fallbackResumeFromProjects,
  parseGeneratedResume,
  type GeneratedResume,
} from "@/lib/resume";

type ProjectRow = {
  title: string;
  role: string | null;
  description: string | null;
  skills: string[] | null;
  result: string | null;
  date: string | null;
};

type ProfileRow = {
  full_name: string | null;
  phone: string | null;
  location: string | null;
  age: string | null;
  target_role: string | null;
  photo_url: string | null;
  email: string | null;
};

type EducationRow = {
  date: string | null;
  school: string | null;
  major: string | null;
  degree: string | null;
  coursework: string[] | null;
};

type AwardRow = {
  content: string | null;
};

function getBearerToken(req: Request): string | null {
  const auth = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!auth) return null;

  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? null;
}

function buildProjectsText(projects: ProjectRow[]): string {
  return projects
    .map((project, index) => {
      const parts: string[] = [];
      parts.push(`项目 ${index + 1}：${project.title}`);
      if (project.role) parts.push(`角色：${project.role}`);
      if (project.date) parts.push(`时间：${project.date}`);
      if (project.skills?.length) parts.push(`技能：${project.skills.join(", ")}`);
      if (project.description) parts.push(`描述：${project.description}`);
      if (project.result) parts.push(`成果：${project.result}`);
      return parts.join("\n");
    })
    .join("\n\n---\n\n");
}

function buildPrompt(args: {
  email: string;
  profile: ProfileRow | null;
  education: EducationRow[];
  manualAwards: string[];
  projects: ProjectRow[];
}): string {
  const profileText = [
    `邮箱：${args.email}`,
    `姓名：${args.profile?.full_name ?? ""}`,
    `电话：${args.profile?.phone ?? ""}`,
    `所在地：${args.profile?.location ?? ""}`,
    `年龄：${args.profile?.age ?? ""}`,
    `求职意向：${args.profile?.target_role ?? ""}`,
    `照片链接：${args.profile?.photo_url ?? ""}`,
  ].join("\n");

  const educationText = args.education.length
    ? args.education
        .map((item, index) => {
          return [
            `教育 ${index + 1}`,
            `时间：${item.date ?? ""}`,
            `学校：${item.school ?? ""}`,
            `专业：${item.major ?? ""}`,
            `学历：${item.degree ?? ""}`,
            `主修课程：${(item.coursework ?? []).join("，")}`,
          ].join("\n");
        })
        .join("\n\n")
    : "无";

  const manualAwardsText = args.manualAwards.length ? args.manualAwards.join("；") : "无";

  return [
    "你是一名严谨的中文简历写作助手。",
    "请根据下面的资料，输出适合投递版中文简历的 JSON 数据。",
    "项目经历和实习经历都必须从项目卡片中提炼，不要依赖用户手填实习字段。",
    "奖项荣誉分两部分：一部分从项目经历中提炼，一部分保留用户手动补充。",
    "自我评价必须由模型生成，不要直接复述用户原话。",
    "只输出 JSON，不要输出 markdown，不要解释。",
    "如果某项资料为空，可以返回空字符串或空数组，但 JSON 结构必须完整。",
    "JSON 结构必须严格如下：",
    '{',
    '  "profile": {',
    '    "name": "姓名",',
    '    "targetRole": "求职意向",',
    '    "age": "年龄",',
    '    "location": "所在地",',
    '    "phone": "电话",',
    '    "email": "邮箱",',
    '    "photoUrl": "照片链接或空字符串"',
    '  },',
    '  "summary": "模型生成的自我评价",',
    '  "education": [',
    '    { "date": "时间", "school": "学校", "major": "专业", "degree": "学历", "coursework": ["课程1", "课程2"] }',
    '  ],',
    '  "projects": [',
    '    { "title": "项目名称", "role": "角色", "date": "时间", "bullets": ["简历 bullet 1", "简历 bullet 2"], "skills": ["技能1"], "category": "project" }',
    '  ],',
    '  "skills": ["技能1", "技能2"],',
    '  "awards": ["从项目提炼出的奖项或亮点"],',
    '  "manualAwards": ["用户手动补充奖项"]',
    '}',
    "要求：",
    "1. projects 可以同时包含项目经历和实习经历，用 category 区分 project / internship。",
    "2. 每项返回 2 到 4 条 bullet，适合直接写进简历。",
    "3. 语言简洁、专业、偏投递版，不要写成大段散文。",
    "4. 如果内容过长，请主动精简到简历可用长度。",
    "5. skills 返回适合放在技能证书区域的精炼列表。",
    "基础信息：",
    profileText,
    "教育经历：",
    educationText,
    "用户手动补充奖项：",
    manualAwardsText,
    "项目卡片：",
    buildProjectsText(args.projects),
  ].join("\n");
}

function extractJsonText(content: string): string {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  if (start >= 0 && end > start) return content.slice(start, end + 1);

  return content.trim();
}

async function generateStructuredResume(
  client: OpenAI,
  model: string,
  prompt: string,
): Promise<GeneratedResume> {
  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: "你是一名严谨的中文简历写作助手。" },
      { role: "user", content: prompt },
    ],
    temperature: 0.4,
  });

  const content = completion.choices?.[0]?.message?.content?.trim() ?? "";
  if (!content) {
    throw new Error("Empty response from AI model.");
  }

  const jsonText = extractJsonText(content);
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error("AI response is not valid JSON.");
  }

  const resume = parseGeneratedResume(parsed);
  if (!resume) {
    throw new Error("AI response does not match resume schema.");
  }

  return resume;
}

export async function POST(req: Request) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return NextResponse.json(
        { error: "Missing Authorization bearer token." },
        { status: 401 },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Supabase env vars are not configured." },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Invalid user token." }, { status: 401 });
    }

    const userId = userData.user.id;
    const userEmail = userData.user.email ?? "";

    const [profileRes, educationRes, awardsRes, projectsRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name,phone,location,age,target_role,photo_url,email")
        .eq("id", userId)
        .single(),
      supabase
        .from("education_entries")
        .select("date,school,major,degree,coursework")
        .eq("user_id", userId)
        .order("sort_order", { ascending: true }),
      supabase
        .from("award_entries")
        .select("content")
        .eq("user_id", userId)
        .order("sort_order", { ascending: true }),
      supabase
        .from("projects")
        .select("title,role,description,skills,result,date")
        .order("created_at", { ascending: false }),
    ]);

    if (projectsRes.error) {
      return NextResponse.json({ error: projectsRes.error.message }, { status: 500 });
    }

    const rows = (projectsRes.data ?? []) as ProjectRow[];
    if (!rows.length) {
      return NextResponse.json(
        { error: "No projects found for current user." },
        { status: 400 },
      );
    }

    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    const deepseekBaseURL = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";
    const model = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";

    if (!deepseekApiKey) {
      return NextResponse.json(
        { error: "Missing DEEPSEEK_API_KEY." },
        { status: 500 },
      );
    }

    const client = new OpenAI({
      apiKey: deepseekApiKey,
      baseURL: deepseekBaseURL,
    });

    const manualAwards = ((awardsRes.data ?? []) as AwardRow[])
      .map((item) => item.content?.trim())
      .filter((item): item is string => !!item);

    const prompt = buildPrompt({
      email: userEmail,
      profile: (profileRes.data ?? null) as ProfileRow | null,
      education: (educationRes.data ?? []) as EducationRow[],
      manualAwards,
      projects: rows,
    });

    let resume: GeneratedResume;
    try {
      resume = await generateStructuredResume(client, model, prompt);
    } catch {
      resume = fallbackResumeFromProjects({
        email: userEmail,
        name: profileRes.data?.full_name ?? undefined,
        photoUrl: profileRes.data?.photo_url ?? undefined,
        targetRole: profileRes.data?.target_role ?? undefined,
        education: ((educationRes.data ?? []) as EducationRow[]).map((item) => ({
          date: item.date ?? "",
          school: item.school ?? "",
          major: item.major ?? "",
          degree: item.degree ?? "",
          coursework: item.coursework ?? [],
        })),
        manualAwards,
        projects: rows,
      });
    }

    return NextResponse.json({ resume });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
