"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { EXTRA_STATUSES, PATH, formatDay, moneyLine, relativePhrase, statusLabel, todayKey } from "@/lib/format";
import { Kicker } from "@/components/ui";
import { useStore } from "@/lib/store";

export function ApplicationDetail() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.id ?? "");
  const { getApplication, updateApplication, deleteApplication } = useStore();
  const stored = getApplication(id);
  const today = todayKey();

  const [title, setTitle] = useState("");
  const [provider, setProvider] = useState("");
  const [amount, setAmount] = useState("");
  const [amountNote, setAmountNote] = useState("");
  const [deadline, setDeadline] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!stored || loaded) return;
    setTitle(stored.title);
    setProvider(stored.provider);
    setAmount(stored.amount ? String(stored.amount) : "");
    setAmountNote(stored.amountNote);
    setDeadline(stored.deadline ?? "");
    setNextStep(stored.nextStep);
    setNotes(stored.notes);
    setLoaded(true);
  }, [stored, loaded]);

  if (!stored) {
    return (
      <div className="empty">
        <div className="empty-orb" aria-hidden />
        <h2>This path is not here.</h2>
        <p className="lede">It may have been removed, or the link has wandered.</p>
        <div className="actions">
          <Link className="pill" href="/portal/applications">
            Back to your path
          </Link>
        </div>
      </div>
    );
  }

  const app = stored;

  function move(status: string) {
    updateApplication(app.id, { status });
    setMessage("");
  }

  function save(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setMessage("Give this application a name.");
      return;
    }
    updateApplication(app.id, {
      title: title.trim(),
      provider: provider.trim(),
      amount: Number(amount.replace(/[^\d]/g, "")) || 0,
      amountNote: amountNote.trim(),
      deadline: deadline || null,
      nextStep: nextStep.trim(),
      notes,
    });
    setMessage("Kept.");
  }

  function remove() {
    deleteApplication(app.id);
    router.push("/portal/applications");
  }

  const statusLine =
    app.status === "awarded"
      ? "This one came through."
      : app.status === "declined"
        ? "This one closed. Your path continues."
        : app.status === "withdrawn"
          ? "You set this one down. That counts as care, too."
          : "Choose the step that is true today. You can move it back.";

  return (
    <article>
      <Link className="back" href="/portal/applications">
        <span className="mini-orb" aria-hidden />
        Path
      </Link>
      <Kicker>{provider || "Independent"}</Kicker>
      <h1>{title || "Untitled"}</h1>
      <p className="lede">{statusLine}</p>
      <p className="meta">
        {statusLabel(app.status)} · {moneyLine(Number(amount) || 0, amountNote)} ·{" "}
        {deadline ? `${formatDay(deadline)} · ${relativePhrase(deadline, today)}` : "No deadline"}
        {app.submittedOn ? ` · Sent ${formatDay(app.submittedOn)}` : ""}
      </p>

      <div className="path-scroll">
        <ol className="path" aria-label="Application path">
          {PATH.map((step) => {
            const on = app.status === step.id;
            const passed = PATH.findIndex((item) => item.id === app.status) >= PATH.findIndex((item) => item.id === step.id);
            const gold = step.id === "awarded" && app.status === "awarded";
            return (
              <li key={step.id}>
                <button
                  type="button"
                  className={`node-btn${passed && app.status !== "declined" && app.status !== "withdrawn" ? " on" : ""}${gold ? " gold" : ""}${on ? " on" : ""}`}
                  aria-pressed={app.status === step.id}
                  aria-label={step.label}
                  onClick={() => move(step.id)}
                />
                <span className="node-label">{step.label}</span>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="choices">
        {EXTRA_STATUSES.map((step) => (
          <button key={step.id} type="button" className={app.status === step.id ? "choice on" : "choice"} onClick={() => move(step.id)}>
            {step.label}
          </button>
        ))}
      </div>

      <form onSubmit={save} className="block">
        <h2 className="section-title">Keep the details true</h2>
        <label className="field">
          <span>Name</span>
          <input className="line-input" value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label className="field">
          <span>Provider</span>
          <input className="line-input" value={provider} onChange={(event) => setProvider(event.target.value)} />
        </label>
        <div className="split">
          <label className="field">
            <span>Amount</span>
            <input className="line-input" inputMode="numeric" value={amount} onChange={(event) => setAmount(event.target.value)} />
          </label>
          <label className="field">
            <span>Deadline</span>
            <input className="line-input" type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} />
          </label>
        </div>
        <label className="field">
          <span>Amount note</span>
          <input className="line-input" value={amountNote} onChange={(event) => setAmountNote(event.target.value)} />
        </label>
        <label className="field">
          <span>Next small step</span>
          <input className="line-input" value={nextStep} onChange={(event) => setNextStep(event.target.value)} />
        </label>
        <label className="field">
          <span>Notes</span>
          <textarea className="line-area" value={notes} onChange={(event) => setNotes(event.target.value)} />
        </label>
        {message ? <p className={message === "Kept." ? "help" : "issue"}>{message}</p> : null}
        <div className="actions">
          <button className="pill" type="submit">
            Keep notes
          </button>
          {app.scholarshipId ? (
            <Link className="quiet-link" href={`/portal/discover/${app.scholarshipId}`}>
              View the award
            </Link>
          ) : null}
          {confirm ? (
            <span className="confirm-line">
              Remove this path?
              <button className="text-button clay" type="button" onClick={remove}>
                Yes
              </button>
              <button className="text-button" type="button" onClick={() => setConfirm(false)}>
                Stay
              </button>
            </span>
          ) : (
            <button className="text-button clay" type="button" onClick={() => setConfirm(true)}>
              Remove
            </button>
          )}
        </div>
      </form>
    </article>
  );
}
