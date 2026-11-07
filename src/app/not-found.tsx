import Link from "next/link";

export default function NotFound() {
  return (
    <main className="gate">
      <Link href="/" className="brand">
        <span className="brand-mark" aria-hidden />
        ScholarLane
      </Link>
      <div className="empty">
        <div className="empty-orb" aria-hidden />
        <h1>This page has wandered off.</h1>
        <p className="lede">The path you wanted is not here.</p>
        <div className="actions">
          <Link className="pill" href="/">
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}
