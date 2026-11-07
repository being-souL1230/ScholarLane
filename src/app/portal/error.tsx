"use client";

export default function PortalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="empty">
      <div className="empty-orb" aria-hidden />
      <h2>Something slipped.</h2>
      <p className="lede">This page did not load. What you have already kept is still safe.</p>
      <div className="actions">
        <button className="pill" type="button" onClick={reset}>
          Try again
        </button>
      </div>
    </div>
  );
}
