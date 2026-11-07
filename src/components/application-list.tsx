"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { moneyLine, nextStatus, relativePhrase, statusLabel, statusProgress, todayKey } from "@/lib/format";
import { EmptyState, Kicker, Ring, toneFor } from "@/components/ui";
import { useStore } from "@/lib/store";

export function ApplicationList() {
  const { applications: initial, updateApplication, deleteApplication } = useStore();
  const today = todayKey();
  const [items, setItems] = useState(initial);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => setItems(initial), [initial]);

  function advance(app: (typeof items)[number]) {
    const status = nextStatus(app.status);
    if (!status) return;
    setItems((current) => current.map((item) => (item.id === app.id ? { ...item, status } : item)));
    updateApplication(app.id, { status });
  }

  function remove(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
    setConfirmId(null);
    deleteApplication(id);
  }

  return (
    <div>
      <header className="page-head">
        <div>
          <Kicker>Applications</Kicker>
          <h1>Your path</h1>
          <p className="lede">Move each award one step at a time. Notes stay with the work, not in a forgotten tab.</p>
        </div>
        <Link className="pill" href="/portal/applications/new">
          Track an award
        </Link>
      </header>
      {items.length === 0 ? (
        <EmptyState
          title="Your path is open."
          body="When you begin an award, it will settle here, with its status, notes, and the next small step."
          href="/portal/discover"
          action="Discover awards"
        />
      ) : (
        <div>
          {items.map((app) => {
            const upcoming = nextStatus(app.status);
            return (
              <article key={app.id} className="flow-row">
                <Link href={`/portal/applications/${app.id}`} className="flow-main">
                  <Ring value={statusProgress(app.status)} tone={toneFor(app.status)} />
                  <div>
                    <h3>{app.title}</h3>
                    <p className="meta">
                      {statusLabel(app.status)} · {app.provider || "Independent"} · {moneyLine(app.amount, app.amountNote)}
                    </p>
                    {app.nextStep ? <p className="fitline">Next · {app.nextStep}</p> : null}
                  </div>
                </Link>
                <div className="flow-side">
                  <span className="when">{relativePhrase(app.deadline, today)}</span>
                  {upcoming ? (
                    <button className="text-button" type="button" onClick={() => advance(app)}>
                      Advance
                    </button>
                  ) : null}
                  {confirmId === app.id ? (
                    <span className="confirm-line">
                      Remove?
                      <button className="text-button clay" type="button" onClick={() => remove(app.id)}>
                        Yes
                      </button>
                      <button className="text-button" type="button" onClick={() => setConfirmId(null)}>
                        Stay
                      </button>
                    </span>
                  ) : (
                    <button className="text-button clay" type="button" onClick={() => setConfirmId(app.id)}>
                      Remove
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
