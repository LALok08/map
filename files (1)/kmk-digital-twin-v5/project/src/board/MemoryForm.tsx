"use client";
import { useState } from "react";
import { useBoardStore } from "./boardStore";
import { useLocale } from "@/i18n/LocaleContext";

const ROLES = ["student", "alumni", "staff", "visitor"] as const;

export function MemoryForm({
  buildingId,
  buildingName,
}: {
  buildingId: string;
  buildingName: string;
}) {
  const { tr } = useLocale();
  const add = useBoardStore((s) => s.add);
  const [open, setOpen] = useState(false);
  const [author, setAuthor] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number]>("alumni");
  const [gradYear, setGradYear] = useState("");
  const [faculty, setFaculty] = useState("");
  const [message, setMessage] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    if (!author.trim() || !message.trim()) {
      setErr(tr("nameRequired"));
      return;
    }
    setBusy(true);
    const ok = await add({
      buildingId,
      buildingName,
      author: author.trim(),
      role,
      gradYear: gradYear ? Number(gradYear) : null,
      faculty: faculty.trim() || null,
      message: message.trim(),
      photoUrl: photoUrl.trim() || null,
    });
    setBusy(false);
    if (ok) {
      setAuthor("");
      setMessage("");
      setGradYear("");
      setFaculty("");
      setPhotoUrl("");
      setOpen(false);
    } else {
      setErr(tr("postError"));
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        ✍️ {tr("leaveMemory")}
      </button>
    );
  }

  const field =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-400";

  return (
    <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex gap-2">
        <input
          className={field}
          placeholder={tr("yourName")}
          value={author}
          maxLength={80}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <select
          className={`${field} w-28`}
          value={role}
          onChange={(e) => setRole(e.target.value as (typeof ROLES)[number])}
        >
          {ROLES.map((r) => (
            <option key={r} value={r} className="capitalize">
              {r}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <input
          className={field}
          placeholder={tr("faculty")}
          value={faculty}
          maxLength={80}
          onChange={(e) => setFaculty(e.target.value)}
        />
        <input
          className={`${field} w-28`}
          placeholder={tr("year")}
          inputMode="numeric"
          value={gradYear}
          onChange={(e) => setGradYear(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
        />
      </div>
      <textarea
        className={`${field} min-h-[80px] resize-y`}
        placeholder={tr("shareMemory", { building: buildingName })}
        value={message}
        maxLength={2000}
        onChange={(e) => setMessage(e.target.value)}
      />
      <input
        className={field}
        placeholder={tr("photoUrl")}
        value={photoUrl}
        onChange={(e) => setPhotoUrl(e.target.value)}
      />
      {err && <p className="text-xs text-red-500">{err}</p>}
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={busy}
          className="flex-1 rounded-lg bg-slate-900 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {busy ? tr("posting") : tr("postMemory")}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white"
        >
          {tr("cancel")}
        </button>
      </div>
    </div>
  );
}
