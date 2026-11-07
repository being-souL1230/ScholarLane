"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  buildInitialState,
  checkPassword,
  makePasswordHash,
  uid,
  type ApplicationRecord,
  type LocalState,
  type PublicUser,
  type ReminderRecord,
  type ScholarshipRecord,
  type UserRecord,
} from "@/lib/local-data";
import { fitFor, todayKey } from "@/lib/format";
import type {
  ApplicationView,
  ReminderView,
  ScholarshipInput,
  ScholarshipView,
} from "@/lib/types";

const STORAGE_KEY = "scholarlane_state_v1";
const VERSION = 1;

function toPublic(user: UserRecord): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    school: user.school,
    major: user.major,
    year: user.year,
    gpa: user.gpa,
    location: user.location,
    bio: user.bio,
    interests: user.interests,
  };
}

function loadState(): LocalState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildInitialState();
    const parsed = JSON.parse(raw) as { v?: number; state?: LocalState };
    if (!parsed || parsed.v !== VERSION || !parsed.state || !Array.isArray(parsed.state.users)) {
      return buildInitialState();
    }
    return parsed.state;
  } catch {
    return buildInitialState();
  }
}

function toScholarshipView(
  row: ScholarshipRecord,
  user: PublicUser,
  saved: boolean,
  applicationId: string | null,
): ScholarshipView {
  return {
    id: row.id,
    ownerId: row.ownerId,
    title: row.title,
    provider: row.provider,
    summary: row.summary,
    description: row.description,
    amount: row.amount,
    amountNote: row.amountNote,
    deadline: row.deadline,
    category: row.category,
    degreeLevel: row.degreeLevel,
    field: row.field,
    location: row.location,
    eligibility: row.eligibility,
    essayRequired: row.essayRequired,
    renewable: row.renewable,
    website: row.website,
    yearHint: row.yearHint,
    tags: row.tags,
    saved,
    owned: row.ownerId === user.id,
    applicationId,
    fit: fitFor(user, row),
  };
}

function toApplicationView(row: ApplicationRecord): ApplicationView {
  return {
    id: row.id,
    scholarshipId: row.scholarshipId,
    title: row.title,
    provider: row.provider,
    amount: row.amount,
    amountNote: row.amountNote,
    status: row.status,
    deadline: row.deadline,
    submittedOn: row.submittedOn,
    notes: row.notes,
    nextStep: row.nextStep,
    updatedAt: row.updatedAt,
  };
}

export type ApplicationPatch = Partial<{
  title: string;
  provider: string;
  amount: number;
  amountNote: string;
  deadline: string | null;
  submittedOn: string | null;
  status: string;
  notes: string;
  nextStep: string;
}>;

export type ReminderPatch = Partial<{
  title: string;
  note: string;
  dueOn: string | null;
  done: boolean;
  applicationId: string | null;
}>;

export type ProfilePatch = Partial<
  Pick<PublicUser, "name" | "school" | "major" | "year" | "gpa" | "location" | "bio" | "interests">
>;

type StoreValue = {
  ready: boolean;
  user: PublicUser | null;
  catalogCount: number;
  login: (email: string, password: string) => { ok: true } | { error: string };
  signup: (name: string, email: string, password: string) => { ok: true } | { error: string };
  logout: () => void;
  scholarships: ScholarshipView[];
  getScholarship: (id: string) => ScholarshipView | undefined;
  createScholarship: (input: ScholarshipInput) => string;
  updateScholarship: (id: string, input: ScholarshipInput) => void;
  deleteScholarship: (id: string) => void;
  toggleSave: (scholarshipId: string) => boolean;
  applications: ApplicationView[];
  getApplication: (id: string) => ApplicationView | undefined;
  createApplication: (input: {
    title: string;
    provider: string;
    amount: number;
    amountNote: string;
    deadline: string | null;
    status: string;
    notes: string;
    nextStep: string;
    scholarshipId: string | null;
  }) => { id: string; existing: boolean } | { error: string };
  updateApplication: (id: string, patch: ApplicationPatch) => void;
  deleteApplication: (id: string) => void;
  reminders: ReminderView[];
  addReminder: (input: {
    title: string;
    note: string;
    dueOn: string | null;
    applicationId: string | null;
  }) => { id: string } | { error: string };
  updateReminder: (id: string, patch: ReminderPatch) => void;
  deleteReminder: (id: string) => void;
  updateProfile: (patch: ProfilePatch) => void;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<LocalState | null>(null);

  useEffect(() => {
    setState(loadState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !state) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: VERSION, state }));
    } catch {
      // Storage full or unavailable; the app still works in memory.
    }
  }, [state, ready]);

  const userRecord = useMemo(() => {
    if (!state?.sessionUserId) return null;
    return state.users.find((item) => item.id === state.sessionUserId) ?? null;
  }, [state]);

  const user = useMemo(() => (userRecord ? toPublic(userRecord) : null), [userRecord]);

  const login = useCallback(
    (email: string, password: string) => {
      if (!state) return { error: "Still loading. Try again." } as const;
      const found = state.users.find((item) => item.email === email.trim().toLowerCase());
      if (!found || !checkPassword(password, found.passwordHash)) {
        return { error: "Those details don't match." } as const;
      }
      setState((current) => (current ? { ...current, sessionUserId: found.id } : current));
      return { ok: true } as const;
    },
    [state],
  );

  const signup = useCallback(
    (name: string, email: string, password: string) => {
      if (!state) return { error: "Still loading. Try again." } as const;
      const cleanEmail = email.trim().toLowerCase();
      if (state.users.some((item) => item.email === cleanEmail)) {
        return { error: "An account already uses that email." } as const;
      }
      const record: UserRecord = {
        id: uid(),
        email: cleanEmail,
        name: name.trim(),
        passwordHash: makePasswordHash(password),
        school: "",
        major: "",
        year: "",
        gpa: "",
        location: "",
        bio: "",
        interests: "",
      };
      setState((current) =>
        current ? { ...current, users: [...current.users, record], sessionUserId: record.id } : current,
      );
      return { ok: true } as const;
    },
    [state],
  );

  const logout = useCallback(() => {
    setState((current) => (current ? { ...current, sessionUserId: null } : current));
  }, []);

  const scholarships = useMemo<ScholarshipView[]>(() => {
    if (!state || !user) return [];
    const savedIds = new Set(
      state.saves.filter((item) => item.userId === user.id).map((item) => item.scholarshipId),
    );
    const appByScholarship = new Map(
      state.applications
        .filter((item) => item.userId === user.id && item.scholarshipId)
        .map((item) => [item.scholarshipId as string, item.id]),
    );
    return state.scholarships
      .filter((row) => !row.ownerId || row.ownerId === user.id)
      .map((row) => toScholarshipView(row, user, savedIds.has(row.id), appByScholarship.get(row.id) ?? null))
      .sort(
        (a, b) =>
          b.fit.score - a.fit.score ||
          (a.deadline ?? "9999-99-99").localeCompare(b.deadline ?? "9999-99-99"),
      );
  }, [state, user]);

  const getScholarship = useCallback(
    (id: string) => scholarships.find((item) => item.id === id),
    [scholarships],
  );

  const createScholarship = useCallback(
    (input: ScholarshipInput) => {
      if (!state || !user) return "";
      const id = uid();
      const slug = `${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 48) || "award"}-${id.slice(0, 6)}`;
      const record: ScholarshipRecord = { ...input, id, ownerId: user.id, slug };
      setState((current) =>
        current ? { ...current, scholarships: [...current.scholarships, record] } : current,
      );
      return id;
    },
    [state, user],
  );

  const updateScholarship = useCallback(
    (id: string, input: ScholarshipInput) => {
      if (!user) return;
      setState((current) =>
        current
          ? {
              ...current,
              scholarships: current.scholarships.map((row) =>
                row.id === id && row.ownerId === user.id ? { ...row, ...input } : row,
              ),
            }
          : current,
      );
    },
    [user],
  );

  const deleteScholarship = useCallback(
    (id: string) => {
      if (!user) return;
      setState((current) =>
        current
          ? {
              ...current,
              scholarships: current.scholarships.filter((row) => row.id !== id),
              saves: current.saves.filter((item) => item.scholarshipId !== id),
              applications: current.applications.map((row) =>
                row.scholarshipId === id ? { ...row, scholarshipId: null } : row,
              ),
            }
          : current,
      );
    },
    [user],
  );

  const toggleSave = useCallback(
    (scholarshipId: string) => {
      if (!state || !user) return false;
      const exists = state.saves.some(
        (item) => item.userId === user.id && item.scholarshipId === scholarshipId,
      );
      setState((current) => {
        if (!current) return current;
        const has = current.saves.some(
          (item) => item.userId === user.id && item.scholarshipId === scholarshipId,
        );
        return {
          ...current,
          saves: has
            ? current.saves.filter(
                (item) => !(item.userId === user.id && item.scholarshipId === scholarshipId),
              )
            : [...current.saves, { userId: user.id, scholarshipId }],
        };
      });
      return !exists;
    },
    [state, user],
  );

  const applications = useMemo<ApplicationView[]>(() => {
    if (!state || !user) return [];
    const rank: Record<string, number> = {
      preparing: 0,
      interview: 1,
      exploring: 2,
      submitted: 3,
      awarded: 4,
      declined: 5,
      withdrawn: 6,
    };
    return state.applications
      .filter((row) => row.userId === user.id)
      .map(toApplicationView)
      .sort(
        (a, b) =>
          (rank[a.status] ?? 9) - (rank[b.status] ?? 9) ||
          (a.deadline ?? "9999-99-99").localeCompare(b.deadline ?? "9999-99-99"),
      );
  }, [state, user]);

  const getApplication = useCallback(
    (id: string) => applications.find((item) => item.id === id),
    [applications],
  );

  const createApplication = useCallback(
    (input: {
      title: string;
      provider: string;
      amount: number;
      amountNote: string;
      deadline: string | null;
      status: string;
      notes: string;
      nextStep: string;
      scholarshipId: string | null;
    }) => {
      if (!state || !user) return { error: "Please sign in again." } as const;
      let { title, provider, amount, amountNote, deadline } = input;
      const scholarshipId = input.scholarshipId;

      if (scholarshipId) {
        const scholarship = state.scholarships.find(
          (row) => row.id === scholarshipId && (!row.ownerId || row.ownerId === user.id),
        );
        if (!scholarship) return { error: "That award is not on your desk." } as const;
        const existing = state.applications.find(
          (row) => row.userId === user.id && row.scholarshipId === scholarshipId,
        );
        if (existing) return { id: existing.id, existing: true } as const;
        title = title || scholarship.title;
        provider = provider || scholarship.provider;
        if (!input.amount) amount = scholarship.amount;
        amountNote = amountNote || scholarship.amountNote;
        if (!input.deadline) deadline = scholarship.deadline;
      }

      if (!title) return { error: "Give this application a name." } as const;

      const record: ApplicationRecord = {
        id: uid(),
        userId: user.id,
        scholarshipId,
        title,
        provider,
        amount,
        amountNote,
        status: input.status || "exploring",
        deadline,
        submittedOn: null,
        notes: input.notes,
        nextStep: input.nextStep,
        updatedAt: new Date().toISOString(),
      };
      setState((current) =>
        current ? { ...current, applications: [...current.applications, record] } : current,
      );
      return { id: record.id, existing: false } as const;
    },
    [state, user],
  );

  const updateApplication = useCallback(
    (id: string, patch: ApplicationPatch) => {
      if (!user) return;
      setState((current) => {
        if (!current) return current;
        const existing = current.applications.find((row) => row.id === id && row.userId === user.id);
        if (!existing) return current;
        const next: ApplicationRecord = { ...existing, ...patch, updatedAt: new Date().toISOString() };
        if (patch.status === "submitted" && !existing.submittedOn && patch.submittedOn === undefined) {
          next.submittedOn = todayKey();
        }
        return {
          ...current,
          applications: current.applications.map((row) => (row.id === id ? next : row)),
        };
      });
    },
    [user],
  );

  const deleteApplication = useCallback(
    (id: string) => {
      if (!user) return;
      setState((current) =>
        current
          ? {
              ...current,
              applications: current.applications.filter((row) => row.id !== id),
              reminders: current.reminders.map((row) =>
                row.applicationId === id ? { ...row, applicationId: null } : row,
              ),
            }
          : current,
      );
    },
    [user],
  );

  const reminders = useMemo<ReminderView[]>(() => {
    if (!state || !user) return [];
    const titleById = new Map(
      state.applications.filter((row) => row.userId === user.id).map((row) => [row.id, row.title]),
    );
    return state.reminders
      .filter((row) => row.userId === user.id)
      .map((row) => ({
        id: row.id,
        applicationId: row.applicationId,
        title: row.title,
        note: row.note,
        dueOn: row.dueOn,
        done: row.done,
        applicationTitle: row.applicationId ? titleById.get(row.applicationId) ?? null : null,
      }))
      .sort(
        (a, b) =>
          Number(a.done) - Number(b.done) ||
          (a.dueOn ?? "9999-99-99").localeCompare(b.dueOn ?? "9999-99-99"),
      );
  }, [state, user]);

  const addReminder = useCallback(
    (input: { title: string; note: string; dueOn: string | null; applicationId: string | null }) => {
      if (!state || !user) return { error: "Please sign in again." } as const;
      if (!input.title.trim()) return { error: "Name the thing you want remembered." } as const;
      if (input.applicationId) {
        const app = state.applications.find(
          (row) => row.id === input.applicationId && row.userId === user.id,
        );
        if (!app) return { error: "That application is not on your path." } as const;
      }
      const record: ReminderRecord = {
        id: uid(),
        userId: user.id,
        applicationId: input.applicationId,
        title: input.title.trim(),
        note: input.note,
        dueOn: input.dueOn,
        done: false,
      };
      setState((current) =>
        current ? { ...current, reminders: [...current.reminders, record] } : current,
      );
      return { id: record.id } as const;
    },
    [state, user],
  );

  const updateReminder = useCallback(
    (id: string, patch: ReminderPatch) => {
      if (!user) return;
      setState((current) =>
        current
          ? {
              ...current,
              reminders: current.reminders.map((row) =>
                row.id === id && row.userId === user.id ? { ...row, ...patch } : row,
              ),
            }
          : current,
      );
    },
    [user],
  );

  const deleteReminder = useCallback(
    (id: string) => {
      if (!user) return;
      setState((current) =>
        current
          ? { ...current, reminders: current.reminders.filter((row) => row.id !== id) }
          : current,
      );
    },
    [user],
  );

  const updateProfile = useCallback(
    (patch: ProfilePatch) => {
      if (!user) return;
      setState((current) =>
        current
          ? {
              ...current,
              users: current.users.map((row) =>
                row.id === user.id ? { ...row, ...patch } : row,
              ),
            }
          : current,
      );
    },
    [user],
  );

  const value: StoreValue = {
    ready,
    user,
    catalogCount: state?.scholarships.length ?? 0,
    login,
    signup,
    logout,
    scholarships,
    getScholarship,
    createScholarship,
    updateScholarship,
    deleteScholarship,
    toggleSave,
    applications,
    getApplication,
    createApplication,
    updateApplication,
    deleteApplication,
    reminders,
    addReminder,
    updateReminder,
    deleteReminder,
    updateProfile,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used inside StoreProvider");
  return store;
}
