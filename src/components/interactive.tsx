"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";

export function Greeting({ name }: { name: string }) {
  const first = name.trim().split(/\s+/)[0] || "there";
  const hour = new Date().getHours();
  const hello = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return (
    <h1 suppressHydrationWarning>
      {hello}, {first}.
    </h1>
  );
}

export function SaveButton({
  id,
  saved,
  onChange,
}: {
  id: string;
  saved: boolean;
  onChange?: (saved: boolean) => void;
}) {
  const { toggleSave } = useStore();
  const [on, setOn] = useState(saved);

  useEffect(() => setOn(saved), [saved]);

  function toggle() {
    const next = toggleSave(id);
    setOn(next);
    onChange?.(next);
  }

  return (
    <button className={on ? "text-button on" : "text-button"} type="button" onClick={toggle} aria-pressed={on}>
      <span className="mini-orb" aria-hidden />
      {on ? "Kept" : "Keep"}
    </button>
  );
}
