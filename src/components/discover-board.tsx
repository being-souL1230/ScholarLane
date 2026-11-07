"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIES, categoryLabel, todayKey } from "@/lib/format";
import { AwardRow, EmptyState, Kicker } from "@/components/ui";
import { SaveButton } from "@/components/interactive";
import { useStore } from "@/lib/store";

export function DiscoverBoard({ mode = "discover" }: { mode?: "discover" | "saved" }) {
  const { scholarships } = useStore();
  const todayISO = todayKey();
  const [items, setItems] = useState(scholarships);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<"fit" | "soon" | "amount">("fit");

  const source = useMemo(
    () => (mode === "saved" ? scholarships.filter((item) => item.saved) : scholarships),
    [scholarships, mode],
  );

  useEffect(() => setItems(source), [source]);

  function onSaved(id: string, saved: boolean) {
    setItems((current) =>
      mode === "saved" && !saved
        ? current.filter((item) => item.id !== id)
        : current.map((item) => (item.id === id ? { ...item, saved } : item)),
    );
  }

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = items.filter((item) => {
      const blob = `${item.title} ${item.provider} ${item.field} ${item.location} ${item.tags} ${item.summary}`.toLowerCase();
      const matchesQuery = !needle || blob.includes(needle);
      const matchesCategory = category === "all" || item.category === category;
      return matchesQuery && matchesCategory;
    });
    return filtered.sort((a, b) => {
      if (sort === "amount") return b.amount - a.amount;
      if (sort === "soon") return (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999");
      return b.fit.score - a.fit.score;
    });
  }, [items, query, category, sort]);

  return (
    <div>
      <header className="page-head">
        <div>
          <Kicker>{mode === "saved" ? "Saved" : "Discover"}</Kicker>
          <h1>{mode === "saved" ? "Kept for later" : "What might fit"}</h1>
          <p className="lede">
            {mode === "saved"
              ? "Awards you wanted to return to. Release one whenever it no longer belongs."
              : "Fit follows your year, field, place, and interests. It is a suggestion, not a gate."}
          </p>
        </div>
        {mode === "discover" ? (
          <Link className="pill" href="/portal/discover/new">
            Add an award
          </Link>
        ) : null}
      </header>

      <label className="search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <circle cx="11" cy="11" r="6.5" />
          <path d="M16 16.5 20 20.5" strokeLinecap="round" />
        </svg>
        <input
          className="line-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search awards, schools, fields"
          aria-label="Search awards"
        />
      </label>

      <div className="choices" role="group" aria-label="Category">
        {CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={category === item.id ? "choice on" : "choice"}
            onClick={() => setCategory(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="choices" role="group" aria-label="Sort">
        {(
          [
            ["fit", "Best fit"],
            ["soon", "Soonest"],
            ["amount", "Largest"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" className={sort === id ? "choice on" : "choice"} onClick={() => setSort(id)}>
            {label}
          </button>
        ))}
      </div>
      <p className="help">
        {visible.length} {visible.length === 1 ? "award" : "awards"}
        {category !== "all" ? ` in ${categoryLabel(category)}` : ""}
      </p>

      {visible.length === 0 ? (
        <EmptyState
          title={mode === "saved" ? "Nothing kept yet." : "Nothing matches."}
          body={
            mode === "saved"
              ? "When an award is worth returning to, keep it. It will wait here."
              : "Try a softer word, or clear the filter. The right award may simply be quieter."
          }
          href={mode === "saved" ? "/portal/discover" : undefined}
          action={mode === "saved" ? "Discover awards" : undefined}
        />
      ) : (
        <div>
          {visible.map((item) => (
            <AwardRow
              key={item.id}
              item={item}
              todayISO={todayISO}
              side={<SaveButton id={item.id} saved={item.saved} onChange={(saved) => onSaved(item.id, saved)} />}
            />
          ))}
        </div>
      )}
    </div>
  );
}
