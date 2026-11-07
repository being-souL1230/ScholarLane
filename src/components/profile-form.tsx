"use client";

import { useEffect, useState } from "react";
import { YEARS, initials } from "@/lib/format";
import { Kicker } from "@/components/ui";
import { useStore } from "@/lib/store";

export function ProfileForm() {
  const { user, updateProfile } = useStore();
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");
  const [gpa, setGpa] = useState("");
  const [location, setLocation] = useState("");
  const [interests, setInterests] = useState("");
  const [bio, setBio] = useState("");
  const [message, setMessage] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user || loaded) return;
    setName(user.name);
    setSchool(user.school);
    setMajor(user.major);
    setYear(user.year);
    setGpa(user.gpa);
    setLocation(user.location);
    setInterests(user.interests);
    setBio(user.bio);
    setLoaded(true);
  }, [user, loaded]);

  if (!user) return null;

  function save(event: React.FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2) {
      setMessage("Keep a name on the desk.");
      return;
    }
    updateProfile({
      name: name.trim(),
      school: school.trim(),
      major: major.trim(),
      year,
      gpa: gpa.trim(),
      location: location.trim(),
      interests: interests.trim(),
      bio: bio.trim(),
    });
    setMessage("Kept.");
  }

  return (
    <form onSubmit={save}>
      <div className="profile-head">
        <div className="initials-orb" aria-hidden>
          {initials(name || user.name)}
        </div>
        <div>
          <Kicker>Profile</Kicker>
          <h1>You, held lightly.</h1>
        </div>
      </div>
      <p className="lede">
        What you share here shapes Discover. It never leaves your desk, and a number will never hide an award from you.
      </p>
      <div className="block">
        <label className="field">
          <span>Name</span>
          <input className="line-input" value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <p className="help">Email stays with this desk: {user.email}</p>
        <div className="split">
          <label className="field">
            <span>School</span>
            <input className="line-input" value={school} onChange={(event) => setSchool(event.target.value)} />
          </label>
          <label className="field">
            <span>Field of study</span>
            <input className="line-input" value={major} onChange={(event) => setMajor(event.target.value)} />
          </label>
        </div>
        <p className="field-label">Year</p>
        <div className="choices">
          {YEARS.map((item) => (
            <button key={item.id} type="button" className={year === item.id ? "choice on" : "choice"} onClick={() => setYear(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
        <div className="split">
          <label className="field">
            <span>Place</span>
            <input className="line-input" value={location} onChange={(event) => setLocation(event.target.value)} />
          </label>
          <label className="field">
            <span>GPA, only if you want it remembered</span>
            <input className="line-input" value={gpa} onChange={(event) => setGpa(event.target.value)} />
          </label>
        </div>
        <label className="field">
          <span>What you care about</span>
          <input
            className="line-input"
            value={interests}
            onChange={(event) => setInterests(event.target.value)}
            placeholder="research, writing, community"
          />
          <p className="help">Separate with commas. These words help fit, quietly.</p>
        </label>
        <label className="field">
          <span>A line about you</span>
          <textarea className="line-area" value={bio} onChange={(event) => setBio(event.target.value)} />
        </label>
      </div>
      {message ? <p className={message === "Kept." ? "help" : "issue"}>{message}</p> : null}
      <div className="actions">
        <button className="pill" type="submit">
          Keep profile
        </button>
      </div>
    </form>
  );
}
