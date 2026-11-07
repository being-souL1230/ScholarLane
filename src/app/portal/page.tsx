"use client";

import Link from "next/link";
import { Greeting, SaveButton } from "@/components/interactive";
import { AwardRow, EmptyState, Kicker, PathPreview } from "@/components/ui";
import { useStore } from "@/lib/store";
import { daysUntil, longDate, relativePhrase, spell, todayKey } from "@/lib/format";

function sentence(moving: number, soon: number, overdue: number, awarded: number) {
  const bits: string[] = [];
  if (overdue === 1) bits.push("One date has slipped");
  else if (overdue > 1) bits.push(`${spell(overdue)} dates have slipped`);
  else if (soon === 0) bits.push("Nothing is pressing this week");
  else if (soon === 1) bits.push("One date is close");
  else bits.push(`${spell(soon)} dates are close`);

  if (awarded === 1) bits.push("One award is already yours");
  else if (awarded > 1) bits.push(`${spell(awarded)} awards are already yours`);
  else if (moving === 1) bits.push("One application is in motion");
  else if (moving > 1) bits.push(`${spell(moving)} applications are in motion`);

  return `${bits.join(". ")}.`;
}

export default function TodayPage() {
  const { user, scholarships, applications, reminders } = useStore();
  if (!user) return null;

  const today = new Date();
  const key = todayKey(today);
  const openReminders = reminders.filter((item) => !item.done);
  const soon = openReminders.filter((item) => {
    const days = daysUntil(item.dueOn, key);
    return days !== null && days >= 0 && days <= 7;
  });
  const overdue = openReminders.filter((item) => (daysUntil(item.dueOn, key) ?? 0) < 0);
  const moving = applications.filter((item) => !["awarded", "declined", "withdrawn"].includes(item.status));
  const awarded = applications.filter((item) => item.status === "awarded");
  const applied = new Set(applications.map((item) => item.scholarshipId).filter(Boolean));
  const suggestions = scholarships.filter((item) => !applied.has(item.id)).slice(0, 3);
  const closeDates = [...overdue, ...soon].slice(0, 4);
  const incomplete = !user.year || !user.major || !user.interests;

  return (
    <div>
      <p className="kicker">
        <i aria-hidden="true" />
        {longDate(today)}
      </p>
      <Greeting name={user.name} />
      <p className="lede">{sentence(moving.length, soon.length, overdue.length, awarded.length)}</p>

      <div className="stat-row" aria-label="Today at a glance">
        <div className="stat-orb">
          <strong>{moving.length}</strong>
          <span>in motion</span>
        </div>
        <div className="stat-orb">
          <strong>{soon.length + overdue.length}</strong>
          <span>dates asking</span>
        </div>
        <div className="stat-orb">
          <strong>{awarded.length}</strong>
          <span>awarded</span>
        </div>
      </div>

      {incomplete ? (
        <p className="help">
          Tell ScholarLane your year and field, and Discover will quiet down.{" "}
          <Link className="quiet-link" href="/portal/profile">
            Shape your fit
          </Link>
        </p>
      ) : null}

      <section className="block">
        <div className="page-head">
          <h2 className="section-title">Close dates</h2>
          <Link className="quiet-link" href="/portal/reminders">
            All reminders
          </Link>
        </div>
        {closeDates.length === 0 ? (
          <p className="lede">Nothing needs you this week. That is allowed.</p>
        ) : (
          <ul className="timeline">
            {closeDates.map((item) => {
              const days = daysUntil(item.dueOn, key);
              return (
                <li key={item.id}>
                  <span className={days !== null && days <= 2 ? "tick soon" : "tick"} />
                  <div>
                    <h3>{item.title}</h3>
                    {item.applicationTitle ? <p className="meta">{item.applicationTitle}</p> : null}
                  </div>
                  <span className="when">{relativePhrase(item.dueOn, key)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="block">
        <div className="page-head">
          <h2 className="section-title">In motion</h2>
          <Link className="quiet-link" href="/portal/applications">
            The whole path
          </Link>
        </div>
        {applications.length === 0 ? (
          <EmptyState
            title="Your path is open."
            body="Begin with one award. The rest of the desk can stay quiet."
            href="/portal/discover"
            action="Discover awards"
          />
        ) : (
          applications.slice(0, 4).map((app) => <PathPreview key={app.id} app={app} todayISO={key} />)
        )}
      </section>

      <section className="block">
        <div className="page-head">
          <div>
            <Kicker>Discover</Kicker>
            <h2 className="section-title">A few that fit</h2>
          </div>
          <Link className="quiet-link" href="/portal/discover">
            See all
          </Link>
        </div>
        {suggestions.map((item) => (
          <AwardRow
            key={item.id}
            item={item}
            todayISO={key}
            side={<SaveButton id={item.id} saved={item.saved} />}
          />
        ))}
      </section>
    </div>
  );
}
