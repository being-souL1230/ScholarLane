export const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "merit", label: "Merit" },
  { id: "need", label: "Need" },
  { id: "stem", label: "STEM" },
  { id: "research", label: "Research" },
  { id: "arts", label: "Arts" },
  { id: "community", label: "Community" },
  { id: "leadership", label: "Leadership" },
  { id: "global", label: "Global" },
  { id: "writing", label: "Writing" },
  { id: "first-gen", label: "First-gen" },
] as const;

export const YEARS = [
  { id: "freshman", label: "First year" },
  { id: "sophomore", label: "Second year" },
  { id: "junior", label: "Third year" },
  { id: "senior", label: "Fourth year" },
  { id: "graduate", label: "Graduate" },
] as const;

export const DEGREES = [
  { id: "any", label: "Any level" },
  { id: "high-school", label: "High school" },
  { id: "undergraduate", label: "Undergraduate" },
  { id: "graduate", label: "Graduate" },
] as const;

export const PATH = [
  { id: "exploring", label: "Exploring" },
  { id: "preparing", label: "Preparing" },
  { id: "submitted", label: "Submitted" },
  { id: "interview", label: "Interview" },
  { id: "awarded", label: "Awarded" },
] as const;

export const EXTRA_STATUSES = [
  { id: "declined", label: "Declined" },
  { id: "withdrawn", label: "Withdrawn" },
] as const;

const STATUS_SET = new Set<string>([...PATH.map((item) => item.id), ...EXTRA_STATUSES.map((item) => item.id)]);

export function isStatus(value: string) {
  return STATUS_SET.has(value);
}

export function categoryLabel(id: string) {
  return CATEGORIES.find((item) => item.id === id)?.label ?? id;
}

export function yearLabel(id: string) {
  return YEARS.find((item) => item.id === id)?.label ?? (id || "Not set");
}

export function degreeLabel(id: string) {
  return DEGREES.find((item) => item.id === id)?.label ?? id;
}

export function statusLabel(id: string) {
  return [...PATH, ...EXTRA_STATUSES].find((item) => item.id === id)?.label ?? id;
}

export function statusProgress(status: string) {
  switch (status) {
    case "exploring":
      return 14;
    case "preparing":
      return 38;
    case "submitted":
      return 64;
    case "interview":
      return 82;
    case "awarded":
      return 100;
    case "declined":
      return 100;
    case "withdrawn":
      return 8;
    default:
      return 10;
  }
}

export function nextStatus(status: string) {
  const order = PATH.map((item) => item.id);
  const index = order.indexOf(status as (typeof order)[number]);
  if (index < 0 || index === order.length - 1) return null;
  return order[index + 1];
}

export function moneyLine(amount: number, note: string) {
  if (!amount && note) return note;
  if (!amount) return "Amount varies";
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
  return note ? `${formatted} · ${note}` : formatted;
}

export function moneyShort(amount: number) {
  if (!amount) return "Varies";
  if (amount >= 1000) {
    const value = amount / 1000;
    const text = Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, "");
    return `$${text}k`;
  }
  return `$${amount}`;
}

export function formatDay(dateStr: string | null) {
  if (!dateStr) return "Open";
  const [year, month, day] = dateStr.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  if (!year || !month || !day) return "Open";
  return `${day} ${months[month - 1]} ${year}`;
}

export function todayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function calendarKey(today: Date | string) {
  if (typeof today === "string") return today.slice(0, 10);
  return todayKey(today);
}

export function daysUntil(dateStr: string | null, today: Date | string = new Date()) {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  const [todayYear, todayMonth, todayDay] = calendarKey(today).split("-").map(Number);
  if (!year || !month || !day || !todayYear || !todayMonth || !todayDay) return null;
  const target = Date.UTC(year, month - 1, day);
  const start = Date.UTC(todayYear, todayMonth - 1, todayDay);
  return Math.round((target - start) / 86400000);
}

export function relativePhrase(dateStr: string | null, today: Date | string = new Date()) {
  const days = daysUntil(dateStr, today);
  if (days === null) return "No deadline";
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days > 1 && days < 21) return `${days} days of room`;
  if (days >= 21) return `Closes ${formatDay(dateStr)}`;
  if (days === -1) return "Slipped by a day";
  return `Slipped by ${Math.abs(days)} days`;
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const letters = parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
  return letters || "G";
}

export function spell(count: number) {
  const words = ["None", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
  if (count >= 0 && count < words.length) return words[count];
  return String(count);
}

export function fitFor(
  user: { major: string; year: string; location: string; interests: string },
  scholarship: {
    category: string;
    field: string;
    title: string;
    eligibility: string;
    tags: string;
    summary: string;
    degreeLevel: string;
    location: string;
    yearHint: string;
    essayRequired: boolean;
  },
) {
  let score = 38;
  const reasons: string[] = [];
  const interests = user.interests
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const blob = `${scholarship.category} ${scholarship.field} ${scholarship.title} ${scholarship.summary} ${scholarship.eligibility} ${scholarship.tags}`.toLowerCase();
  const major = user.major.trim().toLowerCase();

  if (major) {
    const words = major.split(/\s+/).filter((word) => word.length > 4);
    if (blob.includes(major) || scholarship.field.toLowerCase().includes(major) || words.some((word) => blob.includes(word))) {
      score += 22;
      reasons.push("close to your field");
    }
  }

  const hints = scholarship.yearHint
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (user.year && hints.includes(user.year)) {
    score += 18;
    reasons.push("meant for your year");
  } else if (
    scholarship.degreeLevel === "any" ||
    (scholarship.degreeLevel === "undergraduate" && ["freshman", "sophomore", "junior", "senior"].includes(user.year)) ||
    (scholarship.degreeLevel === "graduate" && user.year === "graduate")
  ) {
    score += 10;
    reasons.push("open to your level");
  } else if (scholarship.degreeLevel === "high-school" && user.year && user.year !== "high-school") {
    score -= 20;
  }

  const hits = interests.filter((interest) => blob.includes(interest) || scholarship.category === interest);
  if (hits.length) {
    score += Math.min(16, hits.length * 8);
    reasons.push("matches what you care about");
  }

  const city = user.location.split(",")[0]?.trim().toLowerCase() ?? "";
  const place = scholarship.location.toLowerCase();
  if (city && place.includes(city)) {
    score += 12;
    reasons.push("close to home");
  } else if (place === "national" || place.includes("united states")) {
    score += 4;
  }

  if (!scholarship.essayRequired) {
    score += 4;
    reasons.push("no essay required");
  }

  score = Math.max(6, Math.min(97, score));
  const label = score >= 78 ? "Strong fit" : score >= 62 ? "Good fit" : score >= 48 ? "Worth a look" : "A stretch";
  return { score, label, reasons };
}

export function safeUrl(url: string) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "";
    return parsed.toString();
  } catch {
    return "";
  }
}

export function longDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}
