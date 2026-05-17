export type KnowledgeSection = {
  id: string;
  title: string;
  body: string;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
};

export type KnowledgeBase = {
  sections: KnowledgeSection[];
  faqs: Faq[];
  contact: {
    email: string;
    telegram?: string;
  };
  updatedAt: string;
};

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatRequest = {
  messages: ChatMessage[];
};

export type ChatResponse = {
  reply: string;
};

// --- Participants ---

export type ParticipantStatus = "pending" | "accepted" | "rejected" | "waitlist";

export type Participant = {
  id: string;
  fullName: string;
  nationality: "Indonesia" | "Russia";
  university: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  messenger: string;
  dietary: string;
  priorExperience: string;
  motivation: string;
  passportFileId: string | null;
  consentFileId: string | null;
  status: ParticipantStatus;
  notes: string;
  submittedAt: string;
  updatedAt: string;
};

export type ParticipantInput = Omit<
  Participant,
  "id" | "status" | "notes" | "submittedAt" | "updatedAt"
>;

export type ParticipantPatch = Partial<
  Pick<
    Participant,
    | "fullName"
    | "nationality"
    | "university"
    | "age"
    | "gender"
    | "email"
    | "phone"
    | "messenger"
    | "dietary"
    | "priorExperience"
    | "motivation"
    | "status"
    | "notes"
  >
>;

export type StoredFile = {
  id: string;
  originalName: string;
  mime: string;
  size: number;
  path: string;
};

export type AuthClaims = {
  sub: "admin";
  iat: number;
  exp: number;
};
