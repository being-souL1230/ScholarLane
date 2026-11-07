"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CATEGORIES, DEGREES } from "@/lib/format";
import type { ScholarshipInput } from "@/lib/types";
import { Kicker } from "@/components/ui";
import { useStore } from "@/lib/store";

const empty: ScholarshipInput = {
  title: "",
  provider: "",
  summary: "",
  description: "",
  amount: 0,
  amountNote: "",
  deadline: null,
  category: "merit",
  degreeLevel: "undergraduate",
  field: "",
  location: "",
  eligibility: "",
  essayRequired: false,
  renewable: false,
  website: "",
  yearHint: "",
  tags: "",
};

export function ScholarshipForm({
  mode,
  id,
  initial,
}: {
  mode: "create" | "edit";
  id?: string;
  initial?: ScholarshipInput;
}) {
  const router = useRouter();
  const { createScholarship, updateScholarship } = useStore();
  const [form, setForm] = useState<ScholarshipInput>(initial ?? empty);
  const [error, setError] = useState("");

  function set<K extends keyof ScholarshipInput>(key: K, value: ScholarshipInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!form.title.trim() || !form.provider.trim()) {
      setError("A title and a provider are needed.");
      return;
    }
    if (mode === "edit" && id) {
      updateScholarship(id, form);
      router.push(`/portal/discover/${id}`);
    } else {
      const newId = createScholarship(form);
      router.push(`/portal/discover/${newId}`);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <Kicker>{mode === "edit" ? "Revise" : "Add"}</Kicker>
      <h1>{mode === "edit" ? "Revise this award" : "Add an award you found"}</h1>
      <p className="lede">Write it the way a student would search for it. Shared catalog awards stay as reference; this one stays with you.</p>

      <div className="block">
        <h2 className="section-title">The award</h2>
        <label className="field">
          <span>Title</span>
          <input className="line-input" value={form.title} onChange={(event) => set("title", event.target.value)} />
        </label>
        <label className="field">
          <span>Provider</span>
          <input className="line-input" value={form.provider} onChange={(event) => set("provider", event.target.value)} />
        </label>
        <label className="field">
          <span>One sentence</span>
          <input className="line-input" value={form.summary} onChange={(event) => set("summary", event.target.value)} />
        </label>
        <label className="field">
          <span>What it is</span>
          <textarea className="line-area" value={form.description} onChange={(event) => set("description", event.target.value)} />
        </label>
        <div className="split">
          <label className="field">
            <span>Amount in dollars</span>
            <input
              className="line-input"
              inputMode="numeric"
              value={form.amount ? String(form.amount) : ""}
              onChange={(event) => set("amount", Number(event.target.value.replace(/[^\d]/g, "")) || 0)}
            />
            <p className="help">Use 0 if it varies, and explain below.</p>
          </label>
          <label className="field">
            <span>Amount note</span>
            <input className="line-input" value={form.amountNote} onChange={(event) => set("amountNote", event.target.value)} />
          </label>
        </div>
        <label className="field">
          <span>Deadline</span>
          <input
            className="line-input"
            type="date"
            value={form.deadline ?? ""}
            onChange={(event) => set("deadline", event.target.value || null)}
          />
          <p className="help">Leave open if the cycle has not posted a date.</p>
        </label>
      </div>

      <div className="block">
        <h2 className="section-title">Who it is for</h2>
        <p className="field-label">Category</p>
        <div className="choices">
          {CATEGORIES.filter((item) => item.id !== "all").map((item) => (
            <button key={item.id} type="button" className={form.category === item.id ? "choice on" : "choice"} onClick={() => set("category", item.id)}>
              {item.label}
            </button>
          ))}
        </div>
        <p className="field-label">Level</p>
        <div className="choices">
          {DEGREES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={form.degreeLevel === item.id ? "choice on" : "choice"}
              onClick={() => set("degreeLevel", item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="split">
          <label className="field">
            <span>Field</span>
            <input className="line-input" value={form.field} onChange={(event) => set("field", event.target.value)} />
          </label>
          <label className="field">
            <span>Place</span>
            <input className="line-input" value={form.location} onChange={(event) => set("location", event.target.value)} />
          </label>
        </div>
        <label className="field">
          <span>Years, if it is specific</span>
          <input
            className="line-input"
            value={form.yearHint}
            onChange={(event) => set("yearHint", event.target.value)}
            placeholder="junior, senior"
          />
        </label>
        <label className="field">
          <span>Eligibility, one point per line</span>
          <textarea className="line-area" value={form.eligibility} onChange={(event) => set("eligibility", event.target.value)} />
        </label>
        <label className="field">
          <span>Words that help fit</span>
          <input className="line-input" value={form.tags} onChange={(event) => set("tags", event.target.value)} placeholder="research, writing, seattle" />
        </label>
      </div>

      <div className="block">
        <h2 className="section-title">The ask</h2>
        <div className="toggle-row">
          <button type="button" className={form.essayRequired ? "toggle on" : "toggle"} onClick={() => set("essayRequired", !form.essayRequired)} aria-pressed={form.essayRequired}>
            <i aria-hidden />
            Essay required
          </button>
          <button type="button" className={form.renewable ? "toggle on" : "toggle"} onClick={() => set("renewable", !form.renewable)} aria-pressed={form.renewable}>
            <i aria-hidden />
            Renewable
          </button>
        </div>
        <label className="field">
          <span>Public page</span>
          <input className="line-input" value={form.website} onChange={(event) => set("website", event.target.value)} placeholder="https://" />
        </label>
      </div>

      {error ? <p className="issue">{error}</p> : null}
      <div className="actions">
        <button className="pill" type="submit">
          {mode === "edit" ? "Keep changes" : "Add to my desk"}
        </button>
        <Link className="quiet-link" href={id ? `/portal/discover/${id}` : "/portal/discover"}>
          Leave unchanged
        </Link>
      </div>
    </form>
  );
}
