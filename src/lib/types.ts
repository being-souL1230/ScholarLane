export type Fit = {
  score: number;
  label: string;
  reasons: string[];
};

export type ScholarshipView = {
  id: string;
  ownerId: string | null;
  title: string;
  provider: string;
  summary: string;
  description: string;
  amount: number;
  amountNote: string;
  deadline: string | null;
  category: string;
  degreeLevel: string;
  field: string;
  location: string;
  eligibility: string;
  essayRequired: boolean;
  renewable: boolean;
  website: string;
  yearHint: string;
  tags: string;
  saved: boolean;
  owned: boolean;
  applicationId: string | null;
  fit: Fit;
};

export type ApplicationView = {
  id: string;
  scholarshipId: string | null;
  title: string;
  provider: string;
  amount: number;
  amountNote: string;
  status: string;
  deadline: string | null;
  submittedOn: string | null;
  notes: string;
  nextStep: string;
  updatedAt: string;
};

export type ReminderView = {
  id: string;
  applicationId: string | null;
  title: string;
  note: string;
  dueOn: string | null;
  done: boolean;
  applicationTitle: string | null;
};

export type ScholarshipInput = {
  title: string;
  provider: string;
  summary: string;
  description: string;
  amount: number;
  amountNote: string;
  deadline: string | null;
  category: string;
  degreeLevel: string;
  field: string;
  location: string;
  eligibility: string;
  essayRequired: boolean;
  renewable: boolean;
  website: string;
  yearHint: string;
  tags: string;
};
