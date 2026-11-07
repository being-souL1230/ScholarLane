import type { ReactNode } from "react";
import Link from "next/link";
import {
  categoryLabel,
  degreeLabel,
  moneyShort,
  relativePhrase,
  statusLabel,
  statusProgress,
} from "@/lib/format";
import type { ApplicationView, ScholarshipView } from "@/lib/types";

export function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="kicker">
      <i aria-hidden="true" />
      {children}
    </p>
  );
}

export function Ring({
  value,
  size = 64,
  tone = "sage",
}: {
  value: number;
  size?: number;
  tone?: "sage" | "gold" | "clay";
}) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={`ring tone-${tone}`} aria-hidden>
      <circle className="ring-track" cx="32" cy="32" r={radius} />
      <circle
        className="ring-value"
        cx="32"
        cy="32"
        r={radius}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

export function AmountOrb({
  amount,
  note,
  large = false,
}: {
  amount: number;
  note?: string;
  large?: boolean;
}) {
  return (
    <div className={large ? "amount-orb lg" : "amount-orb"} title={note || undefined}>
      <span>{moneyShort(amount)}</span>
    </div>
  );
}

export function Points({ text }: { text: string }) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length <= 1) return <p className="prose">{text}</p>;
  return (
    <ul className="points">
      {lines.map((line) => (
        <li key={line}>
          <i aria-hidden="true" />
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}

export function EmptyState({
  title,
  body,
  href,
  action,
}: {
  title: string;
  body: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="empty">
      <div className="empty-orb" aria-hidden />
      <h2>{title}</h2>
      <p className="lede">{body}</p>
      {href && action ? (
        <div className="actions">
          <Link className="pill" href={href}>
            {action}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export function AwardRow({
  item,
  todayISO,
  side,
}: {
  item: ScholarshipView;
  todayISO: string;
  side?: ReactNode;
}) {
  const reasons = item.fit.reasons.slice(0, 2).join(" · ");
  return (
    <article className="flow-row">
      <Link href={`/portal/discover/${item.id}`} className="flow-main">
        <AmountOrb amount={item.amount} note={item.amountNote} />
        <div>
          <h3>{item.title}</h3>
          <p className="meta">
            {item.provider} · {categoryLabel(item.category)} · {item.location}
            {item.owned ? " · Added by you" : ""}
          </p>
          <p className="fitline">
            {item.fit.label}
            {reasons ? ` · ${reasons}` : ""}
          </p>
        </div>
      </Link>
      <div className="flow-side">
        <span className="when">{relativePhrase(item.deadline, new Date(todayISO))}</span>
        {side}
      </div>
    </article>
  );
}

export function PathPreview({ app, todayISO }: { app: ApplicationView; todayISO: string }) {
  const tone = app.status === "awarded" ? "gold" : app.status === "declined" ? "clay" : "sage";
  return (
    <Link href={`/portal/applications/${app.id}`} className="flow-row path-preview">
      <span className="flow-main">
        <Ring value={statusProgress(app.status)} tone={tone} />
        <span>
          <h3>{app.title}</h3>
          <p className="meta">
            {statusLabel(app.status)} · {app.provider || "Independent"}
          </p>
          {app.nextStep ? <p className="fitline">Next · {app.nextStep}</p> : null}
        </span>
      </span>
      <span className="when">{relativePhrase(app.deadline, todayISO)}</span>
    </Link>
  );
}

export function toneFor(status: string): "sage" | "gold" | "clay" {
  if (status === "awarded") return "gold";
  if (status === "declined" || status === "withdrawn") return "clay";
  return "sage";
}

export function degreeLine(item: Pick<ScholarshipView, "degreeLevel" | "field" | "location">) {
  return `${degreeLabel(item.degreeLevel)} · ${item.field} · ${item.location}`;
}
