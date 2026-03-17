import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

type ProjectRow = {
  title: string;
  role: string | null;
  description: string | null;
  skills: string[] | null;
  result: string | null;
  date: string | null;
};

function getBearerToken(req: Request): string | null {
  const auth = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!auth) return null;
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m?.[1]?.trim() ?? null;
}

function buildProjectsText(projects: ProjectRow[]): string {
  return projects
    .map((p, idx) => {
      const parts: string[] = [];
      parts.push(`项目${idx + 1}：${p.title}`);
      if (p.role) parts.push(`角色：${p.role}`);
      if (p.date) parts.push(`时间：${p.date}`);
      if (p.skills?.length) parts.push(`技能：${p.skills.join(", ")}`);
      if (p.description) parts.push(`描述：${p.description}`);
      if (p.result) parts.push(`成果：${p.result}`);
      return parts.join("\n");
    })
    .join("\n\n---\n\n");
}

function buildPrompt(projects: ProjectRow[]): string {
  const template =
    "你是一个简历优化专家。根据以下项目经历生成一份适合大学生求职的简历。每个项目用 3-4 条成果描述，以动词开头，语言简洁专业。\n\n" +
    "项目数据：\n{projects}\n\n" +
    "输出格式：\n" +
    "# 个人简介\n...\n" +
    "# 项目经历\n" +
    "## 项目1\n" +
    "- 成果1\n" +
    "- 成果2\n" +
    "...\n";

  return template.replace("{projects}", buildProjectsText(projects));
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

    // 用 Authorization 头让 PostgREST 走 RLS（只返回当前用户数据）
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Invalid user token." }, { status: 401 });
    }

    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("title,role,description,skills,result,date")
      .order("created_at", { ascending: false });

    if (projectsError) {
      return NextResponse.json({ error: projectsError.message }, { status: 500 });
    }

    const rows = (projects ?? []) as ProjectRow[];
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

    const prompt = buildPrompt(rows);
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: "你是一个严谨的中文简历写作助手。" },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
    });

    const resumeText = completion.choices?.[0]?.message?.content?.trim() ?? "";
    if (!resumeText) {
      return NextResponse.json(
        { error: "Empty response from AI model." },
        { status: 502 },
      );
    }

    return NextResponse.json({ resumeText });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

