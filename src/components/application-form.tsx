"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PATH } from "@/lib/format";
import { Kicker } from "@/components/ui";
import { useStore } from "@/lib/store";

type Draft = {
  scholarshipId: string | null;
  title: string;
  provider: string;
  amount: string;
  amountNote: string;
  deadline: string;
  status: string;
  nextStep: string;
  notes: string;
};

export function ApplicationForm({ initial }: { initial: Draft }) {
  const router = useRouter();
  const { createApplication } = useStore();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Give this application a name.");
      return;
    }
    const result = createApplication({
      scholarshipId: form.scholarshipId,
      title: form.title.trim(),
      provider: form.provider.trim(),
      amount: Number(form.amount.replace(/[^\d]/g, "")) || 0,
      amountNote: form.amountNote.trim(),
      deadline: form.deadline || null,
      status: form.status,
      notes: form.notes,
      nextStep: form.nextStep.trim(),
    });
    if ("error" in result) {
      setError(result.error);
      return;
    }
    router.push(`/portal/applications/${result.id}`);
  }

  return (
    <form onSubmit={onSubmit}>
      <Kicker>Applications</Kicker>
      <h1>Track an award</h1>
      <p className="lede">It can be one you found here, or one that lives only in an email. Either way, it gets a place on the path.</p>
      <div className="block">
        <label className="field">
          <span>Name</span>
          <input className="line-input" value={form.title} onChange={(event) => set("title", event.target.value)} />
        </label>
        <label className="field">
          <span>Provider</span>
          <input className="line-input" value={form.provider} onChange={(event) => set("provider", event.target.value)} />
        </label>
        <div className="split">
          <label className="field">
            <span>Amount</span>
            <input className="line-input" inputMode="numeric" value={form.amount} onChange={(event) => set("amount", event.target.value)} />
          </label>
          <label className="field">
            <span>Deadline</span>
            <input className="line-input" type="date" value={form.deadline} onChange={(event) => set("deadline", event.target.value)} />
          </label>
        </div>
        <label className="field">
          <span>Amount note</span>
          <input className="line-input" value={form.amountNote} onChange={(event) => set("amountNote", event.target.value)} />
        </label>
        <p className="field-label">Where it stands</p>
        <div className="choices">
          {PATH.map((item) => (
            <button key={item.id} type="button" className={form.status === item.id ? "choice on" : "choice"} onClick={() => set("status", item.id)}>
              {item.label}
            </button>
          ))}
        </div>
        <label className="field">
          <span>Next small step</span>
          <input className="line-input" value={form.nextStep} onChange={(event) => set("nextStep", event.target.value)} />
        </label>
        <label className="field">
          <span>Notes</span>
          <textarea className="line-area" value={form.notes} onChange={(event) => set("notes", event.target.value)} />
        </label>
      </div>
      {error ? <p className="issue">{error}</p> : null}
      <div className="actions">
        <button className="pill" type="submit">
          Place on the path
        </button>
        <Link className="quiet-link" href="/portal/applications">
          Leave unchanged
        </Link>
      </div>
    </form>
  );
}
