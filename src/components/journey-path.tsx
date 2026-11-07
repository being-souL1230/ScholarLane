"use client";

import { useEffect, useRef, useState } from "react";

const steps = ["Notice", "Understand", "Prepare", "Send", "Arrive"];

export function JourneyPath() {
  const pathRef = useRef<HTMLOListElement>(null);
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.25 },
    );
    observer.observe(path);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="journey-scroll">
      <ol
        ref={pathRef}
        className="path journey-path"
        data-running={inView && !paused ? "true" : "false"}
        aria-label="A scholarship path"
      >
        {steps.map((label) => (
          <li key={label}>
            <span className="node" aria-hidden="true" />
            <span className="node-label">{label}</span>
          </li>
        ))}
      </ol>
      <div className="journey-controls">
        <button
          className="journey-control"
          type="button"
          onClick={() => setPaused((current) => !current)}
          aria-label={paused ? "Resume journey animation" : "Pause journey animation"}
        >
          <span className="journey-control-icon" aria-hidden="true">
            {paused ? (
              <svg width="9" height="10" viewBox="0 0 9 10" fill="none">
                <path d="M2.5 1.5 7 5l-4.5 3.5V1.5Z" fill="currentColor" />
              </svg>
            ) : (
              <svg width="9" height="10" viewBox="0 0 9 10" fill="none">
                <path d="M3 2v6M6 2v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            )}
          </span>
          {paused ? "Resume" : "Pause"}
        </button>
      </div>
    </div>
  );
}
