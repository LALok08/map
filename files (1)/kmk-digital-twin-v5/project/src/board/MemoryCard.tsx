"use client";
import type { Memory } from "./boardStore";

const ROLE_STYLE: Record<string, string> = {
  student: "bg-sky-100 text-sky-700",
  alumni: "bg-amber-100 text-amber-700",
  staff: "bg-violet-100 text-violet-700",
  visitor: "bg-slate-100 text-slate-600",
};

export function MemoryCard({ m }: { m: Memory }) {
  const date =
    typeof m.createdAt === "string"
      ? new Date(m.createdAt).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : m.createdAt.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">
          {m.author.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-slate-800">
              {m.author}
            </span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize ${
                ROLE_STYLE[m.role] ?? ROLE_STYLE.visitor
              }`}
            >
              {m.role}
              {m.gradYear ? ` '${String(m.gradYear).slice(2)}` : ""}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            {m.faculty ? `${m.faculty} · ` : ""}
            {date}
          </div>
        </div>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
        {m.message}
      </p>
      {m.photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={m.photoUrl}
          alt="memory"
          className="mt-2 max-h-44 w-full rounded-lg object-cover"
          loading="lazy"
        />
      )}
    </div>
  );
}
