"use client";

import Link from "next/link";
import { JourneyPath } from "@/components/journey-path";
import { HeroImages } from "@/components/hero-images";
import { useStore } from "@/lib/store";

const principles = [
  {
    n: "1",
    title: "Less noise",
    body: "See awards that meet your year, field, and the things you care about. The rest can wait without disappearing.",
  },
  {
    n: "2",
    title: "A plain ask",
    body: "Amount, eligibility, essay, and deadline, in language you can read before you give a weekend to a form.",
  },
  {
    n: "3",
    title: "One path",
    body: "Applications, notes, and reminders stay together. Nothing important has to live in a forgotten tab.",
  },
];

export default function HomePage() {
  const { ready, user, catalogCount } = useStore();
  const count = ready ? catalogCount : "…";

  return (
    <main className="site">
      <header className="top">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden />
          ScholarLane
        </Link>
        <nav>
          {user ? (
            <Link className="pill" href="/portal">
              Continue
            </Link>
          ) : (
            <>
              <Link href="/login">Enter</Link>
              <Link className="pill" href="/signup">
                Begin
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy rise">
          <p className="kicker">
            <i aria-hidden="true" />
            Rethinking the scholarship experience
          </p>
          <h1>
            See what fits.
            <br />
            Leave the rest.
          </h1>
          <p className="lede">
            Finding help for school should not feel like a second job. ScholarLane gathers awards that belong near you, says what they actually ask, and keeps every date in one calm place.
          </p>
          <div className="stat-row" aria-label="What ScholarLane holds">
            <div className="stat-orb">
              <strong>{count}</strong>
              <span>awards ready</span>
            </div>
            <div className="stat-orb">
              <strong>1</strong>
              <span>quiet path</span>
            </div>
            <div className="stat-orb">
              <strong>0</strong>
              <span>GPA gates</span>
            </div>
          </div>
          <div className="hero-actions">
            <Link className="pill" href={user ? "/portal" : "/signup"}>
              {user ? "Open your desk" : "Begin"}
            </Link>
            {!user ? (
              <Link className="quiet-link" href="/login">
                I already have a desk
              </Link>
            ) : null}
          </div>
        </div>
        <HeroImages />
      </section>

      <hr className="sep" />

      <section>
        <p className="kicker">
          <i aria-hidden="true" />
          A quieter way
        </p>
        <ol className="principles">
          {principles.map((item) => (
            <li key={item.n}>
              <span className="num-orb">{item.n}</span>
              <h2>{item.title}</h2>
              <p>{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <hr className="sep" />

      <section>
        <p className="kicker">
          <i aria-hidden="true" />
          How a path feels
        </p>
        <h2 className="close-line">Notice. Understand. Prepare. Send. Arrive.</h2>
        <JourneyPath />
        <p className="lede">Five quiet steps. No portal maze, no wall of identical forms, no deadline hiding in a newsletter.</p>
      </section>

      <hr className="sep" />

      <section className="footer-row">
        <div>
          <p className="close-line">Spend the effort on the work, not the paperwork.</p>
          <Link className="pill" href={user ? "/portal" : "/signup"}>
            {user ? "Continue" : "Open a desk"}
          </Link>
          {!user ? <p className="help">A studio desk is ready: maya@scholarlane.studio, password demo1234.</p> : null}
        </div>
        <p className="credit">
          Photographs by{" "}
          <a href="https://www.pexels.com/photo/woman-in-white-t-shirt-sitting-on-chair-4769481/" target="_blank" rel="noreferrer">
            cottonbro studio
          </a>
          ,{" "}
          <a href="https://www.pexels.com/photo/note-taking-in-a-sunlit-classroom-setup-37778746/" target="_blank" rel="noreferrer">
            jessica olivella
          </a>
          ,{" "}
          <a href="https://www.pexels.com/photo/women-and-building-7972556/" target="_blank" rel="noreferrer">
            George Pak
          </a>
          ,{" "}
          <a href="https://www.pexels.com/photo/a-man-in-a-library-looking-at-his-laptop-6549588/" target="_blank" rel="noreferrer">
            Tima Miroshnichenko
          </a>
          ,{" "}
          <a href="https://www.pexels.com/photo/graduates-celebrating-with-caps-in-the-air-29229903/" target="_blank" rel="noreferrer">
            clmcdk fejcn
          </a>{" "}
          and{" "}
          <a href="https://www.pexels.com/photo/young-woman-writing-in-sunlit-room-30539356/" target="_blank" rel="noreferrer">
            Letícia Alvares
          </a>{" "}
          on Pexels.
        </p>
      </section>
    </main>
  );
}
