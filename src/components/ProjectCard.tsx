import Link from "next/link";

export type Project = {
  id: string;
  title: string;
  role: string | null;
  skills: string[] | null;
  date: string | null;
};

export function ProjectCard({
  project,
  onDelete,
}: {
  project: Project;
  onDelete?: (id: string) => void;
}) {
  return (
    <article className="editorial-card p-6 md:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="editorial-pill">Project Entry</span>
            {project.date ? <span className="editorial-label">{project.date}</span> : null}
          </div>

          <h3 className="editorial-title mt-4 text-2xl leading-none text-[var(--foreground)] md:text-3xl">
            {project.title}
          </h3>

          {project.role ? (
            <p className="mt-3 text-sm uppercase tracking-[0.18em] text-[var(--terracotta)]">
              {project.role}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Link href={`/projects/${project.id}/edit`} className="editorial-button-secondary">
            编辑
          </Link>
          <button
            type="button"
            onClick={() => onDelete?.(project.id)}
            className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-red-200 bg-red-50 px-5 text-[13px] font-semibold uppercase tracking-[0.08em] text-red-700 transition hover:bg-red-100"
          >
            删除
          </button>
        </div>
      </div>

      <div className="editorial-divider my-6"></div>

      {project.skills?.length ? (
        <div className="flex flex-wrap gap-2">
          {project.skills.slice(0, 8).map((skill) => (
            <span key={skill} className="editorial-chip">
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <div className="editorial-lead text-sm">暂无技能标签。</div>
      )}
    </article>
  );
}
