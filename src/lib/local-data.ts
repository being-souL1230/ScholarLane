// Frontend-only data layer. Everything lives in the browser (localStorage).
// No database, no API routes, no server files.

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  school: string;
  major: string;
  year: string;
  gpa: string;
  location: string;
  bio: string;
  interests: string;
};

export type UserRecord = PublicUser & { passwordHash: string };

export type ScholarshipRecord = {
  id: string;
  ownerId: string | null;
  slug: string;
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

export type ApplicationRecord = {
  id: string;
  userId: string;
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

export type ReminderRecord = {
  id: string;
  userId: string;
  applicationId: string | null;
  title: string;
  note: string;
  dueOn: string | null;
  done: boolean;
};

export type SaveRecord = { userId: string; scholarshipId: string };

export type LocalState = {
  users: UserRecord[];
  sessionUserId: string | null;
  scholarships: ScholarshipRecord[];
  applications: ApplicationRecord[];
  reminders: ReminderRecord[];
  saves: SaveRecord[];
};

export function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

// Demo-grade password hashing (salted). Not for real security, just avoids
// storing plain passwords in localStorage.
export function hashPassword(password: string, salt: string) {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  const str = `${salt}:${password}`;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0");
}

export function makePasswordHash(password: string) {
  const salt = uid();
  return `${salt}:${hashPassword(password, salt)}`;
}

export function checkPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  return hashPassword(password, salt) === hash;
}

function isoDays(offset: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

type AwardSeed = {
  slug: string;
  title: string;
  provider: string;
  summary: string;
  description: string;
  amount: number;
  amountNote: string;
  deadlineOffset: number | null;
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
  owner?: "maya";
};

const awards: AwardSeed[] = [
  {
    slug: "mary-gates",
    title: "Mary Gates Research Scholarship",
    provider: "University of Washington",
    summary: "Two quarters of support for undergraduates already doing research.",
    description:
      "The Mary Gates Research Scholarship helps UW undergraduates stay with a project long enough for it to become real work. It is meant for students who already have a faculty mentor and a question they can pursue over two quarters. The application is a research proposal, not a generic personal essay.",
    amount: 5000,
    amountNote: "for two quarters of research",
    deadlineOffset: 16,
    category: "research",
    degreeLevel: "undergraduate",
    field: "Research",
    location: "Seattle",
    eligibility:
      "Currently enrolled UW undergraduate\nA faculty mentor who will supervise the project\nA proposal for two quarters of research\nAny major, if the question is serious",
    essayRequired: true,
    renewable: false,
    website: "https://expd.uw.edu/mge/",
    yearHint: "sophomore,junior,senior",
    tags: "research,seattle,cognitive science,science",
  },
  {
    slug: "gilman",
    title: "Gilman International Scholarship",
    provider: "U.S. Department of State",
    summary: "Funding for Pell-eligible undergraduates who study or intern abroad.",
    description:
      "Gilman exists so study abroad is not reserved for students who can already afford the flight. Awards support credit-bearing study or internships outside the United States. A campus advisor usually has to touch the application before it leaves, so start with the study-abroad office, not the form.",
    amount: 5000,
    amountNote: "up to, with more for some languages",
    deadlineOffset: 34,
    category: "global",
    degreeLevel: "undergraduate",
    field: "Study abroad",
    location: "National",
    eligibility:
      "U.S. citizen or national receiving a Federal Pell Grant\nUndergraduate in good standing\nApplying to a credit-bearing program abroad\nWorking with a campus Gilman advisor",
    essayRequired: true,
    renewable: false,
    website: "https://www.gilmanscholarship.org/",
    yearHint: "freshman,sophomore,junior,senior",
    tags: "global,study abroad,travel",
  },
  {
    slug: "truman",
    title: "Harry S. Truman Scholarship",
    provider: "Harry S. Truman Scholarship Foundation",
    summary: "A junior-year award for students heading toward public service.",
    description:
      "Truman is for college juniors who can point to a public-service path, not just a résumé of clubs. The money supports graduate study, and the campus must nominate you. If public service is a costume rather than a direction, this one will feel false, and that is useful to know early.",
    amount: 30000,
    amountNote: "toward graduate study in public service",
    deadlineOffset: 27,
    category: "leadership",
    degreeLevel: "undergraduate",
    field: "Public service",
    location: "National",
    eligibility:
      "U.S. citizen or national\nCollege junior during the application year\nNominated by your institution\nA record of public-service commitment, not only leadership titles",
    essayRequired: true,
    renewable: false,
    website: "https://www.truman.gov/",
    yearHint: "junior",
    tags: "leadership,community,public service",
  },
  {
    slug: "goldwater",
    title: "Barry Goldwater Scholarship",
    provider: "Barry Goldwater Scholarship and Excellence in Education Foundation",
    summary: "For sophomores and juniors aiming at a research career in science.",
    description:
      "Goldwater supports students who intend to become research scientists, mathematicians, or engineers. It is a campus-nominated award, and the heart of the file is the research essay. Coursework alone is not the point. They want to see how you think in a lab or field project.",
    amount: 7500,
    amountNote: "up to, per remaining undergraduate year",
    deadlineOffset: 48,
    category: "stem",
    degreeLevel: "undergraduate",
    field: "Natural sciences",
    location: "National",
    eligibility:
      "U.S. citizen, national, or permanent resident\nSophomore or junior intending a research career\nNominated by your institution\nStrong preparation in science, math, or engineering",
    essayRequired: true,
    renewable: true,
    website: "https://goldwater.scholarsapply.org/",
    yearHint: "sophomore,junior",
    tags: "stem,research,science",
  },
  {
    slug: "udall",
    title: "Udall Undergraduate Scholarship",
    provider: "Udall Foundation",
    summary: "For sophomores and juniors committed to the environment or tribal policy.",
    description:
      "Udall looks for students whose public commitment is already visible: environmental work, or Native American and Alaska Native policy and health. It is nominated by the college. The essay should sound like a person with a direction, not a person collecting awards.",
    amount: 7000,
    amountNote: "for the upcoming academic year",
    deadlineOffset: 41,
    category: "community",
    degreeLevel: "undergraduate",
    field: "Environment",
    location: "National",
    eligibility:
      "U.S. citizen, national, or permanent resident\nSophomore or junior\nNominated by your institution\nA demonstrated commitment to the environment or to tribal public policy",
    essayRequired: true,
    renewable: false,
    website: "https://www.udall.gov/",
    yearHint: "sophomore,junior",
    tags: "community,environment,leadership",
  },
  {
    slug: "nsf-grfp",
    title: "NSF Graduate Research Fellowship",
    provider: "National Science Foundation",
    summary: "Three years of support for early graduate research in STEM.",
    description:
      "The GRFP is one of the few awards that can change the shape of a graduate degree: stipend, tuition support, and the freedom to choose a research direction. It is for early-stage graduate students and graduating seniors in STEM and STEM education. The research statement matters more than a polished biography.",
    amount: 37000,
    amountNote: "annual stipend, plus tuition support",
    deadlineOffset: 62,
    category: "research",
    degreeLevel: "graduate",
    field: "STEM research",
    location: "National",
    eligibility:
      "U.S. citizen, national, or permanent resident\nEarly in a research-based graduate program, or a graduating senior\nPursuing science, technology, engineering, mathematics, or STEM education\nNot already past the eligibility window of graduate study",
    essayRequired: true,
    renewable: true,
    website: "https://www.nsfgrfp.org/",
    yearHint: "senior,graduate",
    tags: "research,stem,science,graduate",
  },
  {
    slug: "fulbright",
    title: "Fulbright U.S. Student Program",
    provider: "Fulbright Program",
    summary: "A year abroad for study, research, or teaching after the bachelor’s.",
    description:
      "Fulbright sends graduating seniors, recent graduates, and graduate students abroad for a year of study, research, or English teaching. The award is not a single dollar figure. It covers travel, living, and project costs in a specific country. The proposal has to belong to that place, not just to your ambition.",
    amount: 0,
    amountNote: "covers travel, living, and project costs",
    deadlineOffset: 78,
    category: "global",
    degreeLevel: "graduate",
    field: "International study",
    location: "National",
    eligibility:
      "U.S. citizen\nBachelor’s degree by the start of the grant\nA country-specific project or teaching assignment\nCampus evaluation if you are still enrolled",
    essayRequired: true,
    renewable: false,
    website: "https://us.fulbrightonline.org/",
    yearHint: "senior,graduate",
    tags: "global,writing,research",
  },
  {
    slug: "hsf",
    title: "Hispanic Scholarship Fund Award",
    provider: "Hispanic Scholarship Fund",
    summary: "Broad support for students of Hispanic heritage, from a few hundred dollars upward.",
    description:
      "HSF is a wide door, not a single prize. Awards vary by program and year, and many students receive a few thousand dollars rather than a headline amount. Eligibility centers on Hispanic heritage, enrollment, and academic progress. Read the current cycle closely, because the details move.",
    amount: 5000,
    amountNote: "typically $500–$5,000",
    deadlineOffset: 22,
    category: "community",
    degreeLevel: "undergraduate",
    field: "Any",
    location: "National",
    eligibility:
      "Hispanic or Latino heritage\nU.S. citizen, permanent resident, or DACA\nEnrolled in an accredited program\nMinimum GPA set by the current cycle, often around 3.0",
    essayRequired: true,
    renewable: false,
    website: "https://www.hsf.net/",
    yearHint: "",
    tags: "community",
  },
  {
    slug: "point",
    title: "Point Foundation Scholarship",
    provider: "Point Foundation",
    summary: "Financial support and mentorship for LGBTQ+ students.",
    description:
      "Point is more than a check. Scholars receive funding and a community of mentors. The application asks you to speak plainly about identity, leadership, and the future you are building. Award sizes vary and often continue beyond a single year.",
    amount: 10000,
    amountNote: "varies; often paired with mentorship",
    deadlineOffset: 55,
    category: "community",
    degreeLevel: "any",
    field: "Any",
    location: "National",
    eligibility:
      "Identifies as a member of the LGBTQ+ community\nEnrolled or enrolling in an undergraduate or graduate program in the U.S.\nA record of leadership or community care\nU.S. citizen or eligible non-citizen, depending on the cycle",
    essayRequired: true,
    renewable: true,
    website: "https://pointfoundation.org/",
    yearHint: "",
    tags: "community,leadership",
  },
  {
    slug: "apia",
    title: "APIA Scholars Award",
    provider: "APIA Scholars",
    summary: "Scholarships for Asian & Pacific Islander American students across many programs.",
    description:
      "APIA Scholars runs a family of awards rather than one fixed prize. Amounts differ by program, and some are tied to a particular field, state, or sponsor. The shared thread is support for Asian and Pacific Islander American students who might otherwise be told they do not need help.",
    amount: 5000,
    amountNote: "varies by program",
    deadlineOffset: 19,
    category: "community",
    degreeLevel: "undergraduate",
    field: "Any",
    location: "National",
    eligibility:
      "Asian or Pacific Islander American heritage\nU.S. citizen, national, or permanent resident, depending on the program\nEnrolled in a U.S. institution\nProgram-specific GPA and field rules",
    essayRequired: true,
    renewable: false,
    website: "https://apiascholars.org/",
    yearHint: "",
    tags: "community",
  },
  {
    slug: "soros",
    title: "Paul & Daisy Soros Fellowship for New Americans",
    provider: "Paul & Daisy Soros Fellowships",
    summary: "Up to $90,000 for immigrants and children of immigrants in graduate school.",
    description:
      "The Soros Fellowship supports New Americans, meaning immigrants and children of immigrants, who are pursuing graduate study in the United States. It is unusually generous, and the selection looks for creativity and a sustained commitment, not a single kind of résumé. If graduate school is still a rumor, wait for a later cycle.",
    amount: 90000,
    amountNote: "up to, across two years of graduate study",
    deadlineOffset: 70,
    category: "merit",
    degreeLevel: "graduate",
    field: "Any graduate field",
    location: "National",
    eligibility:
      "New American: an immigrant or the child of immigrants\nNot yet finished with the second year of the graduate program you would use the fellowship for\nA record of creativity, persistence, or original work",
    essayRequired: true,
    renewable: true,
    website: "https://www.pdsoros.org/",
    yearHint: "senior,graduate",
    tags: "graduate,writing",
  },
  {
    slug: "coca-cola",
    title: "Coca-Cola Scholars Program",
    provider: "The Coca-Cola Scholars Foundation",
    summary: "A well-known leadership award for high-school seniors.",
    description:
      "Coca-Cola Scholars is a national award for high-school seniors who have already shaped something: a team, a town project, a classroom. It is not a college-student award. If you are already enrolled, leave it in the catalog as a reference, not a task.",
    amount: 20000,
    amountNote: "over the college years",
    deadlineOffset: 12,
    category: "leadership",
    degreeLevel: "high-school",
    field: "Any",
    location: "National",
    eligibility:
      "High-school senior in the United States\nU.S. citizen, national, permanent resident, or refugee\nPlanning to enroll in college\nA visible record of leadership and service",
    essayRequired: true,
    renewable: false,
    website: "https://www.coca-colascholarsfoundation.org/",
    yearHint: "",
    tags: "leadership,high school",
  },
  {
    slug: "elks",
    title: "Elks Most Valuable Student",
    provider: "Elks National Foundation",
    summary: "A national contest for high-school seniors, with a wide range of awards.",
    description:
      "The Elks Most Valuable Student contest considers scholarship, leadership, and financial need. Awards vary widely. It is aimed at high-school seniors, and a local lodge is part of the path. College students should not spend a weekend here.",
    amount: 4000,
    amountNote: "many awards begin near this; top prize is $50,000",
    deadlineOffset: 8,
    category: "leadership",
    degreeLevel: "high-school",
    field: "Any",
    location: "National",
    eligibility:
      "High-school senior who is a U.S. citizen\nPlanning to pursue a four-year degree\nApplication moves through a local Elks lodge",
    essayRequired: true,
    renewable: false,
    website: "https://www.elks.org/scholars/",
    yearHint: "",
    tags: "leadership,need,high school",
  },
  {
    slug: "dell",
    title: "Dell Scholars Program",
    provider: "Michael & Susan Dell Foundation",
    summary: "Long support for students who have already had to be resourceful.",
    description:
      "Dell Scholars is built for students with financial need who have participated in an approved college-readiness program and who are often the first to navigate college in their family. The award includes money and a support network. It is primarily for graduating high-school seniors.",
    amount: 20000,
    amountNote: "plus a laptop, textbook support, and counseling",
    deadlineOffset: 15,
    category: "need",
    degreeLevel: "high-school",
    field: "Any",
    location: "National",
    eligibility:
      "Participating in an approved college-readiness program\nPell-eligible, with demonstrated need\nPlanning to enter a bachelor’s program\nA GPA near 2.4 or higher, because grit is part of the story",
    essayRequired: true,
    renewable: true,
    website: "https://www.dellscholars.org/",
    yearHint: "",
    tags: "need,first-gen,high school",
  },
  {
    slug: "regeneron",
    title: "Regeneron Science Talent Search",
    provider: "Society for Science",
    summary: "The country’s best-known research competition for high-school seniors.",
    description:
      "Regeneron STS is a research competition, not a general scholarship. High-school seniors submit original science or math research. The top award is very large; most entrants are competing for recognition and smaller prizes. College students are outside the window.",
    amount: 250000,
    amountNote: "top award; many smaller prizes",
    deadlineOffset: 5,
    category: "stem",
    degreeLevel: "high-school",
    field: "Science research",
    location: "National",
    eligibility:
      "High-school senior in the United States or territories\nAn original research project\nNot already enrolled full-time in college",
    essayRequired: true,
    renewable: false,
    website: "https://www.societyforscience.org/regeneron-sts/",
    yearHint: "",
    tags: "stem,research,science,high school",
  },
  {
    slug: "gates",
    title: "The Gates Scholarship",
    provider: "The Gates Scholarship",
    summary: "A full cost-of-attendance award for exceptional Pell-eligible seniors.",
    description:
      "The Gates Scholarship covers the full cost of attendance that other aid does not, for high-school seniors who are Pell-eligible and from ethnic minority backgrounds. It is among the most selective awards in the country. It is not a college-student application.",
    amount: 0,
    amountNote: "full cost of attendance",
    deadlineOffset: 11,
    category: "need",
    degreeLevel: "high-school",
    field: "Any",
    location: "National",
    eligibility:
      "High-school senior\nPell-eligible\nU.S. citizen, national, or permanent resident\nAfrican American, American Indian/Alaska Native, Asian & Pacific Islander American, and/or Hispanic American\nA minimum GPA near 3.3",
    essayRequired: true,
    renewable: true,
    website: "https://www.thegatesscholarship.org/",
    yearHint: "",
    tags: "need,first-gen,high school",
  },
  {
    slug: "harborlight",
    title: "Harborlight First-Generation Promise",
    provider: "Harborlight Community Foundation",
    summary: "A renewable regional award for first-generation undergraduates in the Sound.",
    description:
      "Harborlight is a small foundation, and that is the point. The Promise is for first-generation undergraduates studying in the Seattle area who are already carrying work, family, or both. The essay is short. They want to know what you are holding together, not how many clubs you joined.",
    amount: 12000,
    amountNote: "renewable for one more year if you stay enrolled",
    deadlineOffset: -20,
    category: "first-gen",
    degreeLevel: "undergraduate",
    field: "Any",
    location: "Seattle",
    eligibility:
      "First-generation college student\nUndergraduate enrolled in the Seattle area\nDemonstrated financial need\nA short essay and one recommendation",
    essayRequired: true,
    renewable: true,
    website: "",
    yearHint: "freshman,sophomore,junior,senior",
    tags: "first-gen,need,community,seattle",
  },
  {
    slug: "olive-wren",
    title: "Olive & Wren Creative Practice Award",
    provider: "Olive & Wren Foundation",
    summary: "A quiet arts award for undergraduates making work in Seattle.",
    description:
      "Olive & Wren funds time, not trophies. The award is for undergraduates in the Seattle area with a writing, design, or studio practice that needs a season of attention. You send a short statement and a few samples. There is no interview unless they are truly stuck between two people.",
    amount: 8000,
    amountNote: "one season of practice",
    deadlineOffset: 52,
    category: "arts",
    degreeLevel: "undergraduate",
    field: "Arts",
    location: "Seattle",
    eligibility:
      "Undergraduate in the Seattle area\nA current creative practice in writing, design, or studio art\nThree samples and a one-page statement\nNo minimum GPA",
    essayRequired: true,
    renewable: false,
    website: "",
    yearHint: "",
    tags: "arts,writing,seattle",
  },
  {
    slug: "cascadian-writers",
    title: "Cascadian Writers’ Room Fellowship",
    provider: "Cascadian Writers’ Room",
    summary: "A Portland fellowship for undergraduates who write in public.",
    description:
      "The Writers’ Room fellowship gives a Portland undergraduate a stipend and a desk one evening a week. It is for essays, reporting, poetry, or research writing. The form matters less than the habit. They ask for eight pages and a note about who you write for.",
    amount: 4500,
    amountNote: "stipend plus a reserved desk",
    deadlineOffset: 36,
    category: "writing",
    degreeLevel: "undergraduate",
    field: "Writing",
    location: "Portland",
    eligibility:
      "Undergraduate based in Portland\nEight pages of recent work\nA short note about the audience you write for\nAny major",
    essayRequired: true,
    renewable: false,
    website: "",
    yearHint: "freshman,sophomore,junior,senior",
    tags: "writing,community,portland",
  },
  {
    slug: "adler-lab",
    title: "Adler Lab Summer Stipend",
    provider: "Adler Learning Lab",
    summary: "A summer stipend Maya found for cognitive science research in Seattle.",
    description:
      "A small departmental stipend for a student continuing memory and learning research over the summer. It is not widely posted. The ask is a one-page plan and a note from the faculty sponsor. Maya added it so it would not live only in an email thread.",
    amount: 4200,
    amountNote: "ten weeks in the lab",
    deadlineOffset: 24,
    category: "research",
    degreeLevel: "undergraduate",
    field: "Cognitive science",
    location: "Seattle",
    eligibility:
      "Undergraduate already connected to a Seattle research group\nA one-page summer plan\nA faculty sponsor\nCognitive science, psychology, or a close neighbor",
    essayRequired: false,
    renewable: false,
    website: "",
    yearHint: "sophomore,junior,senior",
    tags: "research,cognitive science,science,seattle",
    owner: "maya",
  },
  {
    slug: "westbridge",
    title: "Westbridge Alumni Microgrant",
    provider: "Westbridge Alumni Circle",
    summary: "A small, no-essay grant Maya added from an alumni note.",
    description:
      "The alumni circle sets aside a few microgrants each term for former students now in college. There is no essay. You send a paragraph about what the money would unstick, such as a fee, a train ticket, or a software license, and a proof of enrollment. Maya keeps it here so the deadline does not vanish into a newsletter.",
    amount: 1500,
    amountNote: "one-time, no essay",
    deadlineOffset: 13,
    category: "community",
    degreeLevel: "undergraduate",
    field: "Any",
    location: "Seattle",
    eligibility:
      "Alum of a Westbridge school now enrolled in college\nA short paragraph, not an essay\nProof of enrollment\nAny major",
    essayRequired: false,
    renewable: false,
    website: "",
    yearHint: "",
    tags: "community,seattle,first-gen",
    owner: "maya",
  },
];

export function buildInitialState(): LocalState {
  const mayaId = uid();
  const jordanId = uid();
  const passwordHash = makePasswordHash("demo1234");

  const users: UserRecord[] = [
    {
      id: mayaId,
      email: "maya@scholarlane.studio",
      name: "Maya Chen",
      passwordHash,
      school: "University of Washington",
      major: "Cognitive Science",
      year: "junior",
      gpa: "3.84",
      location: "Seattle, WA",
      bio: "First-generation junior studying how people learn. I want support that leaves room to stay in the lab.",
      interests: "research, writing, first-gen, community",
    },
    {
      id: jordanId,
      email: "jordan@scholarlane.studio",
      name: "Jordan Hale",
      passwordHash,
      school: "Reed College",
      major: "Anthropology",
      year: "sophomore",
      gpa: "3.71",
      location: "Portland, OR",
      bio: "Second-year anthropology student looking for support that can travel: fieldwork, language, and community work.",
      interests: "writing, community, global",
    },
  ];

  const scholarships: ScholarshipRecord[] = awards.map((award) => ({
    id: uid(),
    ownerId: award.owner === "maya" ? mayaId : null,
    slug: award.slug,
    title: award.title,
    provider: award.provider,
    summary: award.summary,
    description: award.description,
    amount: award.amount,
    amountNote: award.amountNote,
    deadline: award.deadlineOffset === null ? null : isoDays(award.deadlineOffset),
    category: award.category,
    degreeLevel: award.degreeLevel,
    field: award.field,
    location: award.location,
    eligibility: award.eligibility,
    essayRequired: award.essayRequired,
    renewable: award.renewable,
    website: award.website,
    yearHint: award.yearHint,
    tags: award.tags,
  }));

  const idBySlug = new Map(scholarships.map((row) => [row.slug, row.id]));
  const need = (slug: string) => {
    const id = idBySlug.get(slug);
    if (!id) throw new Error(`Missing seeded award ${slug}`);
    return id;
  };

  const applications: ApplicationRecord[] = [
    {
      id: uid(),
      userId: mayaId,
      scholarshipId: need("mary-gates"),
      title: "Mary Gates Research Scholarship",
      provider: "University of Washington",
      amount: 5000,
      amountNote: "for two quarters of research",
      status: "interview",
      deadline: isoDays(6),
      submittedOn: isoDays(-18),
      notes:
        "Proposal is about how people notice their own learning. Prof. Adler has the latest draft. Interview is a conversation, not a defense.",
      nextStep: "Send the revised proposal PDF to Prof. Adler",
      updatedAt: new Date().toISOString(),
    },
    {
      id: uid(),
      userId: mayaId,
      scholarshipId: need("truman"),
      title: "Harry S. Truman Scholarship",
      provider: "Harry S. Truman Scholarship Foundation",
      amount: 30000,
      amountNote: "toward graduate study in public service",
      status: "preparing",
      deadline: isoDays(27),
      submittedOn: null,
      notes:
        "Campus nomination is required. I can talk about tutoring and the lab’s community nights, but I should not pretend I am heading to policy school.",
      nextStep: "Decide whether the public-service frame is honest",
      updatedAt: new Date().toISOString(),
    },
    {
      id: uid(),
      userId: mayaId,
      scholarshipId: need("gilman"),
      title: "Gilman International Scholarship",
      provider: "U.S. Department of State",
      amount: 5000,
      amountNote: "up to, with more for some languages",
      status: "submitted",
      deadline: isoDays(34),
      submittedOn: isoDays(-12),
      notes: "Submitted for a spring term with a memory lab in Edinburgh. Advisor already signed the campus form.",
      nextStep: "Check the portal once, then leave it alone",
      updatedAt: new Date().toISOString(),
    },
    {
      id: uid(),
      userId: mayaId,
      scholarshipId: need("harborlight"),
      title: "Harborlight First-Generation Promise",
      provider: "Harborlight Community Foundation",
      amount: 12000,
      amountNote: "renewable for one more year if you stay enrolled",
      status: "awarded",
      deadline: isoDays(-20),
      submittedOn: isoDays(-40),
      notes: "Award letter is in. Renewable if enrollment holds. A short thank-you is still unsent.",
      nextStep: "Send the thank-you note",
      updatedAt: new Date().toISOString(),
    },
    {
      id: uid(),
      userId: mayaId,
      scholarshipId: need("olive-wren"),
      title: "Olive & Wren Creative Practice Award",
      provider: "Olive & Wren Foundation",
      amount: 8000,
      amountNote: "one season of practice",
      status: "exploring",
      deadline: isoDays(52),
      submittedOn: null,
      notes: "Could send the lab notebook essays rather than a story. Only if it does not steal a week from Mary Gates.",
      nextStep: "Choose three writing samples, or let it go",
      updatedAt: new Date().toISOString(),
    },
    {
      id: uid(),
      userId: jordanId,
      scholarshipId: need("udall"),
      title: "Udall Undergraduate Scholarship",
      provider: "Udall Foundation",
      amount: 7000,
      amountNote: "for the upcoming academic year",
      status: "exploring",
      deadline: isoDays(41),
      submittedOn: null,
      notes: "Faculty nomination is the real gate. I should ask before I write a word.",
      nextStep: "Email a faculty nominator",
      updatedAt: new Date().toISOString(),
    },
  ];

  const appByScholarship = new Map(applications.map((row) => [row.scholarshipId, row.id]));

  const reminders: ReminderRecord[] = [
    {
      id: uid(),
      userId: mayaId,
      applicationId: appByScholarship.get(need("mary-gates")) ?? null,
      title: "Send the Mary Gates proposal to Prof. Adler",
      note: "PDF, not the Google doc. Ask whether the interview slot on Thursday still holds.",
      dueOn: isoDays(2),
      done: false,
    },
    {
      id: uid(),
      userId: mayaId,
      applicationId: appByScholarship.get(need("truman")) ?? null,
      title: "Write the Truman paragraph, or cross it off",
      note: "If the public-service story is thin, release the deadline instead of forcing it.",
      dueOn: isoDays(5),
      done: false,
    },
    {
      id: uid(),
      userId: mayaId,
      applicationId: appByScholarship.get(need("gilman")) ?? null,
      title: "One calm check of the Gilman portal",
      note: "Look for a reviewer question. Do not refresh it twice.",
      dueOn: isoDays(9),
      done: false,
    },
    {
      id: uid(),
      userId: mayaId,
      applicationId: null,
      title: "Order the official transcript",
      note: "Registrar takes two days. Needed if Truman stays alive.",
      dueOn: isoDays(1),
      done: false,
    },
    {
      id: uid(),
      userId: mayaId,
      applicationId: appByScholarship.get(need("harborlight")) ?? null,
      title: "Thank-you note to Harborlight",
      note: "Sent Tuesday. Keep the copy with the award letter.",
      dueOn: isoDays(-2),
      done: true,
    },
    {
      id: uid(),
      userId: jordanId,
      applicationId: appByScholarship.get(need("udall")) ?? null,
      title: "Email a faculty member about Udall",
      note: "Ask if they would nominate, and what they would need from me.",
      dueOn: isoDays(7),
      done: false,
    },
  ];

  const saves: SaveRecord[] = [
    { userId: mayaId, scholarshipId: need("goldwater") },
    { userId: mayaId, scholarshipId: need("adler-lab") },
    { userId: mayaId, scholarshipId: need("olive-wren") },
    { userId: mayaId, scholarshipId: need("cascadian-writers") },
    { userId: jordanId, scholarshipId: need("gilman") },
    { userId: jordanId, scholarshipId: need("cascadian-writers") },
    { userId: jordanId, scholarshipId: need("fulbright") },
  ];

  return { users, sessionUserId: null, scholarships, applications, reminders, saves };
}
