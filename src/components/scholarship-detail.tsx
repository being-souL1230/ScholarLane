"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { categoryLabel, formatDay, moneyLine, relativePhrase, safeUrl, todayKey } from "@/lib/format";
import { AmountOrb, degreeLine, Kicker, Points } from "@/components/ui";
import { SaveButton } from "@/components/interactive";
import { useStore } from "@/lib/store";

export function ScholarshipDetail() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.id ?? "");
  const { getScholarship, createApplication, deleteScholarship } = useStore();
  const item = getScholarship(id);
  const [confirm, setConfirm] = useState(false);
  const today = todayKey();

  if (!item) {
    return (
      <div className="empty">
        <div className="empty-orb" aria-hidden />
        <h2>This award is not here.</h2>
        <p className="lede">It may have been removed, or the link has wandered.</p>
        <div className="actions">
          <Link className="pill" href="/portal/discover">
            Back to Discover
          </Link>
        </div>
      </div>
    );
  }

  const site = safeUrl(item.website);

  const begin = () => {
    const result = createApplication({
      scholarshipId: item.id,
      title: item.title,
      provider: item.provider,
      amount: item.amount,
      amountNote: item.amountNote,
      deadline: item.deadline,
      status: "exploring",
      notes: "",
      nextStep: "",
    });
    if ("id" in result) router.push(`/portal/applications/${result.id}`);
  };

  const remove = () => {
    deleteScholarship(item.id);
    router.push("/portal/discover");
  };

  return (
    <article>
      <Link className="back" href="/portal/discover">
        <span className="mini-orb" aria-hidden />
        Discover
      </Link>
      <header className="detail-head">
        <div>
          <Kicker>{item.provider}</Kicker>
          <h1>{item.title}</h1>
          <p className="meta">
            {categoryLabel(item.category)} · {degreeLine(item)}
            {item.owned ? " · Added by you" : ""}
          </p>
        </div>
        <AmountOrb amount={item.amount} note={item.amountNote} large />
      </header>
      <p className="lede" style={{ marginTop: 18 }}>
        {moneyLine(item.amount, item.amountNote)} · {item.deadline ? `${formatDay(item.deadline)} · ${relativePhrase(item.deadline, today)}` : "No deadline posted"}
        {item.essayRequired ? " · Essay required" : " · No essay"}
        {item.renewable ? " · Renewable" : ""}
      </p>
      <p className="fitline">
        {item.fit.label}
        {item.fit.reasons.length ? ` · ${item.fit.reasons.join(" · ")}` : ""}
      </p>
      {item.summary ? <p className="prose">{item.summary}</p> : null}
      {item.description ? <p className="prose">{item.description}</p> : null}

      {item.eligibility ? (
        <section className="block">
          <h2 className="section-title">What they ask</h2>
          <Points text={item.eligibility} />
        </section>
      ) : null}

      <div className="actions">
        {item.applicationId ? (
          <Link className="pill" href={`/portal/applications/${item.applicationId}`}>
            Continue this path
          </Link>
        ) : (
          <button className="pill" type="button" onClick={begin}>
            Begin this path
          </button>
        )}
        <SaveButton id={item.id} saved={item.saved} />
        {site ? (
          <a className="quiet-link" href={site} target="_blank" rel="noreferrer">
            Visit the source
          </a>
        ) : null}
        {item.owned ? (
          <Link className="quiet-link" href={`/portal/discover/${item.id}/edit`}>
            Revise
          </Link>
        ) : null}
        {item.owned ? (
          confirm ? (
            <span className="confirm-line">
              Remove this award?
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
          )
        ) : null}
      </div>
      <p className="help">Fit is a quiet suggestion. It never hides an award, and it does not rank you by a number.</p>
    </article>
  );
}
