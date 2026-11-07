"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { daysUntil, relativePhrase, todayKey } from "@/lib/format";
import type { ReminderView } from "@/lib/types";
import { EmptyState, Kicker } from "@/components/ui";
import { useStore } from "@/lib/store";

export function ReminderBoard() {
  const { reminders: initial, applications, addReminder, updateReminder, deleteReminder } = useStore();
  const today = todayKey();
  const [items, setItems] = useState(initial);
  const [title, setTitle] = useState("");
  const [dueOn, setDueOn] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => setItems(initial), [initial]);

  const groups = useMemo(() => {
    const open = items.filter((item) => !item.done);
    const done = items.filter((item) => item.done);
    const close = open.filter((item) => {
      const days = daysUntil(item.dueOn, today);
      return days !== null && days <= 7;
    });
    const later = open.filter((item) => !close.includes(item));
    return { close, later, done };
  }, [items, today]);

  function add(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setMessage("Name the thing you want remembered.");
      return;
    }
    const result = addReminder({
      title: title.trim(),
      note: note.trim(),
      dueOn: dueOn || null,
      applicationId: applicationId || null,
    });
    if ("error" in result) {
      setMessage(result.error);
      return;
    }
    setTitle("");
    setDueOn("");
    setNote("");
    setApplicationId("");
    setMessage("");
  }

  function toggle(item: ReminderView) {
    setItems((current) => current.map((row) => (row.id === item.id ? { ...row, done: !row.done } : row)));
    updateReminder(item.id, { done: !item.done });
  }

  function remove(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
    setConfirmId(null);
    deleteReminder(id);
  }

  function renderItem(item: ReminderView) {
    const days = daysUntil(item.dueOn, today);
    const soon = !item.done && days !== null && days <= 3;
    return (
      <li key={item.id}>
        <button
          type="button"
          className={`tick${item.done ? " done" : ""}${soon ? " soon" : ""}`}
          aria-label={item.done ? "Mark as open" : "Mark as done"}
          aria-pressed={item.done}
          onClick={() => toggle(item)}
        />
        <div>
          <h3 className={item.done ? "done-title" : undefined}>{item.title}</h3>
          {item.note ? <p className="meta">{item.note}</p> : null}
          {item.applicationTitle ? (
            <p className="fitline">
              <Link href={item.applicationId ? `/portal/applications/${item.applicationId}` : "/portal/applications"}>
                {item.applicationTitle}
              </Link>
            </p>
          ) : null}
        </div>
        <div className="flow-side">
          <span className="when">{relativePhrase(item.dueOn, today)}</span>
          {confirmId === item.id ? (
            <span className="confirm-line">
              Remove?
              <button className="text-button clay" type="button" onClick={() => remove(item.id)}>
                Yes
              </button>
              <button className="text-button" type="button" onClick={() => setConfirmId(null)}>
                Stay
              </button>
            </span>
          ) : (
            <button className="text-button clay" type="button" onClick={() => setConfirmId(item.id)}>
              Remove
            </button>
          )}
        </div>
      </li>
    );
  }

  return (
    <div>
      <header className="page-head">
        <div>
          <Kicker>Reminders</Kicker>
          <h1>Dates worth keeping</h1>
          <p className="lede">Only the things that need a person. Mark one done when it is, and it will step back.</p>
        </div>
      </header>
      <form className="compose" onSubmit={add}>
        <label className="field">
          <span>Remember</span>
          <input className="line-input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ask for the transcript" />
        </label>
        <label className="field">
          <span>Date</span>
          <input className="line-input" type="date" value={dueOn} onChange={(event) => setDueOn(event.target.value)} />
        </label>
        <button className="pill" type="submit">
          Add
        </button>
      </form>
      <label className="field">
        <span>A note, if it helps</span>
        <input className="line-input" value={note} onChange={(event) => setNote(event.target.value)} />
      </label>
      {applications.length ? (
        <>
          <p className="field-label">Tied to an application</p>
          <div className="choices">
            <button type="button" className={applicationId ? "choice" : "choice on"} onClick={() => setApplicationId("")}>
              None
            </button>
            {applications.map((app) => (
              <button
                key={app.id}
                type="button"
                className={applicationId === app.id ? "choice on" : "choice"}
                onClick={() => setApplicationId(app.id)}
              >
                {app.title}
              </button>
            ))}
          </div>
        </>
      ) : null}
      {message ? (
        <p className="issue" aria-live="polite">
          {message}
        </p>
      ) : null}

      {items.length === 0 ? (
        <EmptyState title="Nothing is pressing." body="Add a date when you want ScholarLane to remember it for you." />
      ) : (
        <>
          {groups.close.length ? (
            <>
              <p className="group-label">Close</p>
              <ul className="timeline">{groups.close.map(renderItem)}</ul>
            </>
          ) : null}
          {groups.later.length ? (
            <>
              <p className="group-label">Later</p>
              <ul className="timeline">{groups.later.map(renderItem)}</ul>
            </>
          ) : null}
          {groups.done.length ? (
            <>
              <p className="group-label">Done</p>
              <ul className="timeline">{groups.done.map(renderItem)}</ul>
            </>
          ) : null}
        </>
      )}
    </div>
  );
}
