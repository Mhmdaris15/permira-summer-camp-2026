# Content Audit — PERMIRA Summer Camp 2026

**Source of truth:** `src/assets/proposal_summer_camp_2026.md` (official proposal,
PERMIRA Camp 3.0 — III Indonesian–Russian Students Summer Camp 2026).

This audit records website content that was **invented, unverified, or
inconsistent with the proposal**, the recommendation, and the action taken.
Items marked **⚠ COMMITTEE APPROVAL** must be confirmed by the organising
committee before public launch.

---

## Key facts established from the proposal

| Fact | Value |
| ---- | ----- |
| Official name | PERMIRA Summer Camp 3.0 — III Indonesian–Russian Students Summer Camp 2026 |
| Theme | "Taste of Nusantara: The Eco-Culinary Bridge from ASEAN to Russia" |
| Dates | 19–21 July 2026 |
| Location | Camp site in Leningrad Oblast / Leningrad Oblast (venue TBC) |
| Capacity | 35 students — 15 Indonesia · 10 Russia · 10 ASEAN |
| Ages | 18–35, active university students in Saint Petersburg |
| Languages | Indonesian & Russian (basic English required) |
| Context | 76 years of Indonesia–Russia diplomatic relations; SPb Year of Culture |
| Eco practices | BYO utensils, 3-way waste sorting (organic/non-organic/B3), reduced single-use plastic/paper, QR not paper |

---

## Audit findings & actions

| # | Location | Issue | Recommendation | Action taken |
|---|----------|-------|----------------|--------------|
| 1 | `src/data/journey.ts` | **Invented programme names**: "Pasar Pagi", "First Bowl", "Bonfire Stories", "Spice Atelier", "Pair & Cook", "Plate · Trade · Taste", "The Long Table", "Voices & Strings", "Recipe Exchange" | Replace with proposal-backed sessions | ✅ Rewritten to proposal programme (Opening Ceremony, Culinary Masterclass I/II, Fun Session, Cultural Night, Awarding, Closing) |
| 2 | `src/components/CulinaryHighlights.tsx` | Dishes implied as a **guaranteed fixed menu** ("Three dishes worth telling") | Reframe as examples; add disclaimer | ✅ Retitled "Indonesian Culinary Inspirations / Examples of Indonesian culinary heritage" + disclaimer "Actual dishes may vary…" |
| 3 | `src/data/dishes.ts` | Example dishes (Sate Madura, Ayam Lengkuas, Soto Ayam) | Verify against proposal | ✅ Match the proposal's masterclass menu — kept, now framed as examples |
| 4 | `Footer.tsx`, `NavHeader.tsx` | Brand "Permira · Nusantara" / "Permira SPB · Nusantara" | Replace with official name | ✅ Now "PERMIRA Summer Camp · 2026" |
| 5 | `src/components/CulturalExchange.tsx` | Showed only Indonesia ↔ Russia; **ASEAN missing** | Show Indonesia · Russia · ASEAN · Leningrad Oblast | ✅ Added four-way collaboration row (real flags + ASEAN logo); reframed to "Eco-Culinary Bridge from ASEAN to Russia" |
| 6 | `src/components/Partners.tsx`, `organizations.ts` | Weak/flat partner list | Tier as Organized by / In Collaboration With / Supported by; highlight environmental-government partner | ✅ Three tiers; Ecology Committee + Committee for External Relations under "In Collaboration With"; KBRI under "Supported by" |
| 7 | Hero stats | "2 Cultures"; age framing absent | Reflect 35 participants + ASEAN | ✅ "35 Students · Indonesia · Russia · ASEAN"; eyebrow + subtitle include ASEAN |
| 8 | `validate.ts`, `RegistrationForm.tsx` | Age bound **16–35** | Proposal says **18–35** | ✅ Changed to 18–35 |
| 9 | `JoinTheTable.tsx` | "Students · 18–30" | Proposal says 18–35 | ✅ Changed to 18–35 |
| 10 | `server/data/knowledge.json` (chatbot) | Overview said "18–25", Indonesian/Russian only, invented schedule | Align to proposal | ✅ Rewritten: theme, 35 (15/10/10 ASEAN), 18–35, real programme, sustainability practices, languages |
| 11 | `src/components/ThreeScene/zoneInfo.ts` (3D map) | Invented activities ("Spice atelier", "Voices & strings", "The Long Table dinner", "Evening volleyball", "16 participants") | Align to proposal | ✅ Updated to Culinary Masterclass I/II, Fun Session (Lompat Karet, Game Sendal), Cultural Night, 35 participants |
| 12 | `src/components/Footer.tsx` | No social links / contact | Use existing social assets | ✅ Added VK + Telegram (proposal-backed URLs) + email |

---

## ⚠ Content requiring committee approval before publication

| Item | Where | Why it needs approval |
|------|-------|------------------------|
| **Partner attributions** — Committee for Nature Use & Environmental Safety; Committee for External Relations of Leningrad Oblast; KBRI Moscow | `Partners.tsx` | Logos were supplied, but formal partnership/endorsement wording and logo-use permission should be confirmed in writing before public launch. |
| **Tier placement** of each partner (Organized / Collaboration / Supported) | `Partners.tsx` | Confirm each organisation agrees to its tier and naming. |
| **Venue** | site-wide ("Saint Petersburg / Leningrad Oblast") | Exact camp site not yet fixed (proposal lists priority candidates: Ladozhskoye Ozero Beach, Lake Vuoksa, Lake Kavgolovskoye, Lesnaya Skazka). Kept generic on purpose. |
| **Cost/inclusions** | chatbot FAQ | Proposal covers budget but participant-facing cost wording ("provided for selected participants") should be confirmed. |
| **Registration deadline** | chatbot FAQ, registration | Not set in proposal — left as "to be announced". |
| **IDN↔RUS cultural comparison cards** (kopi/chai, soto/borscht, tumpeng/karavai) | `CulturalExchange.tsx` | Illustrative cultural analogies, not from the proposal. Harmless but should be reviewed for tone/accuracy. |
| **Memories gallery photos** | `Memories.tsx` | Archive photos — confirm usage rights / that they depict past PERMIRA camps. |
| **Map flythrough video** (Google Drive) | `MapVideo.tsx` | Confirm the video is approved for public embedding; recommend moving to YouTube unlisted. |

---

## Still outstanding (not in this pass)

- **Full multilingual support (RU default · EN · ID).** Deferred as a dedicated
  phase — see the change summary. A *partial* translation would create the
  mixed-language state the brief explicitly forbids, so it should be done as one
  complete pass (i18n library + RU/EN/ID resource files + language switcher +
  translated forms/validation), not piecemeal.
- **Unused ASEAN member flags** (Malaysia, Thailand, Vietnam, Philippines,
  Myanmar) are available in `src/assets/organization/` and can populate an
  "ASEAN countries" detail once the committee confirms which nations are
  represented among the 10 ASEAN seats.
