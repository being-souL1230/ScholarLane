"use client";

import { useEffect, useRef, useState } from "react";

const images = [
  { src: "/images/study.jpg", position: "42% 42%" },
  { src: "/images/notes.jpg", position: "center 42%" },
  { src: "/images/campus.jpg", position: "center 45%" },
  { src: "/images/library.jpg", position: "center 40%" },
  { src: "/images/graduation.jpg", position: "center 62%" },
  { src: "/images/writing.jpg", position: "center 45%" },
];

function useCycler(count: number, interval: number, start: number, running: boolean) {
  const [index, setIndex] = useState(start);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setIndex((current) => (current + 1) % count), interval);
    return () => clearInterval(id);
  }, [running, interval, count]);
  return index;
}

export function HeroImages() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const element = wrapRef.current;
    if (!element) return;
    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.2,
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const running = inView && !reducedMotion;
  const mainIndex = useCycler(images.length, 4200, 0, running);
  const subIndex = useCycler(images.length, 5400, 3, running);

  return (
    <div ref={wrapRef} className="orb-cluster" aria-hidden="true">
      <div className="hero-ring">
        <svg viewBox="0 0 100 100" focusable="false">
          <circle className="hero-ring-circle" cx="50" cy="50" r="49" />
        </svg>
        <span className="hero-ring-dot" />
      </div>
      <div className="hero-circle main">
        {images.map((image, index) => (
          <img
            key={image.src}
            src={image.src}
            alt=""
            decoding="async"
            style={{ objectPosition: image.position }}
            className={index === mainIndex ? "hero-img active" : "hero-img"}
          />
        ))}
      </div>
      <div className="hero-circle sub">
        {images.map((image, index) => (
          <img
            key={image.src}
            src={image.src}
            alt=""
            decoding="async"
            style={{ objectPosition: image.position }}
            className={index === subIndex ? "hero-img active" : "hero-img"}
          />
        ))}
      </div>
    </div>
  );
}
