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
  nationality: string;
  university: string;
  gender: string;
  email: string;
  phone: string;
  messenger: string;
  dietary: string;
  priorExperience: string;
  motivation: string;
  passportFileId: string | null;
  studentCardFileId: string | null;
  status: ParticipantStatus;
  notes: string;
  submittedAt: string;
  updatedAt: string;
};

export type ParticipantInput = Omit<
  Participant,
  "id" | "status" | "notes" | "submittedAt" | "updatedAt"
>;

/**
 * Shape accepted by the admin bulk-import endpoint. Unlike a public
 * registration, an import preserves the original `status`, `notes`, and
 * `submittedAt` (these are already-vetted records being restored), and
 * carries no uploaded files.
 */
export type ImportParticipantInput = {
  fullName: string;
  nationality: string;
  university: string;
  gender: string;
  email: string;
  phone: string;
  messenger: string;
  dietary: string;
  priorExperience: string;
  motivation: string;
  status: ParticipantStatus;
  notes: string;
  /** ISO 8601 string; preserved from the original submission. */
  submittedAt: string;
};

export type ParticipantPatch = Partial<
  Pick<
    Participant,
    | "fullName"
    | "nationality"
    | "university"
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

// --- Email ---

/** Reusable templates. `custom` is a free-form announcement. */
export type EmailTemplateId =
  | "registrationReceived"
  | "pending"
  | "accepted"
  | "rejected"
  | "custom";

/** Who to send to: one participant, everyone, or everyone in a status. */
export type EmailAudience = "individual" | "all" | ParticipantStatus;

export type SendEmailRequest = {
  audience: EmailAudience;
  templateId: EmailTemplateId;
  /** Required when audience === "individual". A `participant:xxxx` id. */
  participantId?: string;
  /** Overrides the template's default subject. Required for `custom`. */
  subject?: string;
  /** Body text for `custom`; an optional extra note for the others. */
  message?: string;
  /** Optional heading override (mainly for `custom`). */
  heading?: string;
};

export type EmailLogStatus = "sent" | "failed" | "dry-run";

export type EmailLogEntry = {
  id: string;
  to: string;
  toName: string;
  subject: string;
  templateId: EmailTemplateId;
  audience: EmailAudience;
  status: EmailLogStatus;
  providerId?: string;
  error?: string;
  participantId?: string;
  /** Groups all recipients of a single send together. */
  batchId: string;
  sentAt: string;
  /** Who triggered the send (currently the admin session). */
  sentBy?: string;
};

export type SendEmailResult = {
  batchId: string;
  total: number;
  sent: number;
  failed: number;
  dryRun: number;
  entries: EmailLogEntry[];
};

export type EmailTemplateMeta = {
  id: EmailTemplateId;
  label: string;
  description: string;
  /** Whether the admin must supply subject + message (i.e. `custom`). */
  requiresContent: boolean;
};

export type AuthClaims = {
  sub: "admin";
  iat: number;
  exp: number;
};
