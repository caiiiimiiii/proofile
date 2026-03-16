import Link from "next/link";

export type Project = {
  id: string;
  title: string;
  role: string | null;
  skills: string[] | null;
  date: string | null;
};

export const ProjectCard = ({
  project,
  onDelete,
}: {
  project: Project;
  onDelete?: (id: string) => void;
}) => {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3 className="truncate text-base font-semibold text-zinc-900">
              {project.title}
            </h3>
            {project.date ? (
              <span className="text-xs font-medium text-zinc-500">
                {project.date}
              </span>
            ) : null}
          </div>
          {project.role ? (
            <div className="mt-1 text-sm text-zinc-600">{project.role}</div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/projects/${project.id}/edit`}
            className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
          >
            编辑
          </Link>
          <button
            type="button"
            onClick={() => onDelete?.(project.id)}
            className="inline-flex h-9 items-center justify-center rounded-xl border border-red-200 bg-white px-3 text-sm font-medium text-red-700 transition hover:bg-red-50"
          >
            删除
          </button>
        </div>
      </div>

      {project.skills?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {project.skills.slice(0, 8).map((s) => (
            <span
              key={s}
              className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700"
            >
              {s}
            </span>
          ))}
        </div>
      ) : (
        <div className="mt-4 text-xs text-zinc-500">暂无技能标签</div>
      )}
    </div>
  );
};

