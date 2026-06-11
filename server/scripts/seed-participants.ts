import "dotenv/config";
import {
  createParticipant,
  listParticipants,
  updateParticipant,
} from "../services/participants.js";
import type { ParticipantInput, ParticipantStatus } from "../types.js";
import { logger } from "../logger.js";

/**
 * Seeds sample registrations into the participants database so the admin
 * dashboard has realistic data to manage (search, filters, status workflow,
 * detail modal).
 *
 * Idempotent: skips any sample whose email already exists, so it's safe to
 * re-run. Documents are left null (the detail modal shows "Not provided") —
 * real passports/consent come through the public registration form.
 *
 * Run with:  npm run seed:participants
 * Then restart the API so the running server reloads the snapshot.
 */

type Sample = ParticipantInput & {
  /** Desired final status (createParticipant always starts "pending"). */
  status?: ParticipantStatus;
  /** Optional internal note set alongside the status. */
  note?: string;
};

// Empty strings (not null): the schema field is option<string>, which rejects
// SurrealDB NULL. The admin UI treats a falsy file id as "Not provided".
const base = { passportFileId: "", consentFileId: "", priorExperience: "" };

const SAMPLES: Sample[] = [
  {
    ...base,
    fullName: "Anya Petrova",
    nationality: "Russia",
    university: "Saint Petersburg State University",
    age: 21,
    gender: "Female",
    email: "anya.petrova@spbu.example",
    phone: "+7 921 555 0101",
    messenger: "@anya_p",
    dietary: "Vegetarian",
    motivation:
      "I want to learn Indonesian cooking and make friends across cultures through food and shared work.",
    status: "accepted",
    note: "Strong motivation, prior exchange experience.",
  },
  {
    ...base,
    fullName: "Budi Santoso",
    nationality: "Indonesia",
    university: "Universitas Indonesia",
    age: 22,
    gender: "Male",
    email: "budi.santoso@ui.example",
    phone: "+62 812 3456 7890",
    messenger: "@budi_s",
    dietary: "Halal",
    motivation:
      "As an Indonesian, I'd love to share Nusantara flavors with Russian students and learn their traditions too.",
    status: "accepted",
  },
  {
    ...base,
    fullName: "Dmitri Volkov",
    nationality: "Russia",
    university: "ITMO University",
    age: 24,
    gender: "Male",
    email: "d.volkov@itmo.example",
    phone: "+7 911 555 0202",
    messenger: "+79115550202",
    dietary: "",
    motivation:
      "Curious about culinary diplomacy and eager to practice cross-cultural teamwork in the kitchen.",
    status: "pending",
  },
  {
    ...base,
    fullName: "Siti Rahmawati",
    nationality: "Indonesia",
    university: "Institut Teknologi Bandung",
    age: 20,
    gender: "Female",
    email: "siti.r@itb.example",
    phone: "+62 813 2222 1111",
    messenger: "@siti_rahma",
    dietary: "Halal, no shellfish",
    motivation:
      "Cooking is how my family shows love. I want to bring that warmth to new friends in Saint Petersburg.",
    status: "pending",
  },
  {
    ...base,
    fullName: "Ekaterina Smirnova",
    nationality: "Russia",
    university: "Higher School of Economics",
    age: 23,
    gender: "Female",
    email: "e.smirnova@hse.example",
    phone: "+7 916 555 0303",
    messenger: "@katya_sm",
    dietary: "Lactose intolerant",
    motivation:
      "I study international relations and see food as the most honest form of diplomacy between people.",
    status: "waitlist",
    note: "Great essay; hold pending capacity.",
  },
  {
    ...base,
    fullName: "Reza Pratama",
    nationality: "Indonesia",
    university: "Universitas Gadjah Mada",
    age: 25,
    gender: "Male",
    email: "reza.pratama@ugm.example",
    phone: "+62 811 9988 7766",
    messenger: "@reza_p",
    dietary: "",
    motivation:
      "I run a small food blog and want to document this exchange while learning Russian home cooking.",
    status: "pending",
  },
  {
    ...base,
    fullName: "Olga Kuznetsova",
    nationality: "Russia",
    university: "Peter the Great St. Petersburg Polytechnic",
    age: 19,
    gender: "Female",
    email: "olga.k@spbpu.example",
    phone: "+7 921 555 0404",
    messenger: "@olga_k",
    dietary: "Vegan",
    motivation:
      "First time meeting Indonesian peers — I want to break the ice with a wooden spoon and a shared pot.",
    status: "pending",
  },
  {
    ...base,
    fullName: "Wayan Adi",
    nationality: "Indonesia",
    university: "Universitas Udayana",
    age: 27,
    gender: "Male",
    email: "wayan.adi@unud.example",
    phone: "+62 819 4455 6677",
    messenger: "@wayan_adi",
    dietary: "No pork",
    motivation:
      "From Bali, I want to bring island spices to the table and learn how Russians keep warm in winter kitchens.",
    status: "accepted",
  },
  {
    ...base,
    fullName: "Mikhail Sokolov",
    nationality: "Russia",
    university: "Saint Petersburg State University",
    age: 28,
    gender: "Male",
    email: "m.sokolov@spbu.example",
    phone: "+7 905 555 0505",
    messenger: "@misha_s",
    dietary: "",
    motivation:
      "Amateur cook hoping to add Indonesian techniques to my repertoire and meet people outside my field.",
    status: "rejected",
    note: "Outside age range confirmation pending; declined this round.",
  },
  {
    ...base,
    fullName: "Putri Lestari",
    nationality: "Indonesia",
    university: "Universitas Airlangga",
    age: 18,
    gender: "Female",
    email: "putri.lestari@unair.example",
    phone: "+62 822 3344 5566",
    messenger: "@putri_l",
    dietary: "Halal, vegetarian-friendly",
    motivation:
      "Youngest of my cohort and the most excited — I want to prove food really can be a universal language.",
    status: "waitlist",
  },
  {
    ...base,
    fullName: "Irina Morozova",
    nationality: "Russia",
    university: "ITMO University",
    age: 22,
    gender: "Female",
    email: "irina.m@itmo.example",
    phone: "+7 921 555 0606",
    messenger: "@irina_mz",
    dietary: "Gluten-free",
    motivation:
      "I want to understand a culture through its kitchen, not a textbook — and make a few friends for life.",
    status: "pending",
  },
  {
    ...base,
    fullName: "Joko Nugroho",
    nationality: "Indonesia",
    university: "Institut Pertanian Bogor",
    age: 24,
    gender: "Male",
    email: "joko.n@ipb.example",
    phone: "+62 856 7788 9900",
    messenger: "@joko_n",
    dietary: "Halal",
    motivation:
      "Agriculture student fascinated by how spices travel — I want to trace galangal from soil to shared plate.",
    status: "pending",
  },
];

async function main() {
  const existing = await listParticipants({ limit: 500 });
  const existingEmails = new Set(existing.rows.map((r) => r.email.toLowerCase()));

  let created = 0;
  let skipped = 0;

  for (const sample of SAMPLES) {
    if (existingEmails.has(sample.email.toLowerCase())) {
      skipped++;
      continue;
    }
    const { status, note, ...input } = sample;
    const participant = await createParticipant(input);
    if ((status && status !== "pending") || note) {
      await updateParticipant(participant.id, {
        ...(status ? { status } : {}),
        ...(note ? { notes: note } : {}),
      });
    }
    created++;
  }

  const after = await listParticipants({ limit: 500 });
  logger.info(
    { created, skipped, total: after.total },
    "[seed:participants] done",
  );
  process.exit(0);
}

main().catch((err) => {
  logger.fatal({ err }, "[seed:participants] failed");
  process.exit(1);
});
