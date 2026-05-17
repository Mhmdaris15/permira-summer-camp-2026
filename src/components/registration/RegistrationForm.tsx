import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { submitRegistration, type SubmitResult } from "../../lib/api";
import { useRegistrationForm } from "./useRegistrationForm";
import { LIMITS } from "./types";
import { TextField, TextAreaField, SelectField, RadioGroup, FileField } from "./Field";

type Status = "idle" | "submitting" | "success" | "error";

export function RegistrationForm({ onClose }: { onClose: () => void }) {
  const form = useRegistrationForm();
  const { data, errors, touched, setField, markTouched, touchAll, isValid, reset } = form;

  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmationId, setConfirmationId] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    touchAll();

    // Honeypot — silently "succeed" to keep bots from learning anything.
    if (data.website.trim()) {
      setStatus("success");
      setConfirmationId("ok");
      return;
    }

    if (!isValid) return;

    setStatus("submitting");
    setErrorMessage(null);
    const result: SubmitResult = await submitRegistration(data);
    if (result.ok) {
      setStatus("success");
      setConfirmationId(result.id);
      reset();
    } else {
      setStatus("error");
      setErrorMessage(result.error);
    }
  }

  if (status === "success") {
    return <SuccessState onClose={onClose} confirmationId={confirmationId} />;
  }

  const showErr = (key: keyof typeof errors) => Boolean(touched[key]) && Boolean(errors[key]);
  const submitting = status === "submitting";

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Honeypot — visually hidden, ignored by humans, attractive to naive bots. */}
      <div aria-hidden className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden">
        <label>
          Website
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={data.website}
            onChange={(e) => setField("website", e.target.value)}
          />
        </label>
      </div>

      <Section title="About you" subtitle="Just the basics so we know who's coming.">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <TextField
            label="Full name"
            required
            placeholder="e.g. Anya Petrova"
            autoComplete="name"
            value={data.fullName}
            onChange={(e) => setField("fullName", e.target.value)}
            onBlur={() => markTouched("fullName")}
            error={errors.fullName}
            showError={showErr("fullName")}
            count={data.fullName.length}
            max={LIMITS.fullName}
          />
          <SelectField
            label="Nationality"
            required
            placeholder="Choose one"
            value={data.nationality}
            onChange={(e) => {
              setField("nationality", e.target.value as typeof data.nationality);
              markTouched("nationality");
            }}
            onBlur={() => markTouched("nationality")}
            options={[
              { value: "Indonesia", label: "🇮🇩 Indonesia" },
              { value: "Russia", label: "🇷🇺 Russia" },
            ]}
            error={errors.nationality}
            showError={showErr("nationality")}
          />
          <TextField
            label="University"
            required
            placeholder="Where you study"
            value={data.university}
            onChange={(e) => setField("university", e.target.value)}
            onBlur={() => markTouched("university")}
            error={errors.university}
            showError={showErr("university")}
            count={data.university.length}
            max={LIMITS.university}
          />
          <TextField
            label="Age"
            required
            type="number"
            min={16}
            max={35}
            inputMode="numeric"
            placeholder="18"
            value={data.age}
            onChange={(e) => setField("age", e.target.value)}
            onBlur={() => markTouched("age")}
            error={errors.age}
            showError={showErr("age")}
          />
        </div>
        <div className="mt-5">
          <RadioGroup
            label="Gender"
            required
            name="gender"
            value={data.gender}
            onChange={(v) => {
              setField("gender", v as typeof data.gender);
              markTouched("gender");
            }}
            options={[
              { value: "Female", label: "Female" },
              { value: "Male", label: "Male" },
              { value: "Non-binary", label: "Non-binary" },
              { value: "Prefer not to say", label: "Prefer not to say" },
            ]}
            error={errors.gender}
            showError={showErr("gender")}
          />
        </div>
      </Section>

      <Section title="How to reach you" subtitle="We'll only write you about the camp.">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <TextField
            label="Email"
            required
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={data.email}
            onChange={(e) => setField("email", e.target.value)}
            onBlur={() => markTouched("email")}
            error={errors.email}
            showError={showErr("email")}
          />
          <TextField
            label="Phone"
            required
            type="tel"
            autoComplete="tel"
            placeholder="+7 921 000 00 00"
            value={data.phone}
            onChange={(e) => setField("phone", e.target.value)}
            onBlur={() => markTouched("phone")}
            error={errors.phone}
            showError={showErr("phone")}
          />
          <TextField
            label="Telegram or WhatsApp"
            required
            placeholder="@your_handle or +country code"
            value={data.messenger}
            onChange={(e) => setField("messenger", e.target.value)}
            onBlur={() => markTouched("messenger")}
            error={errors.messenger}
            showError={showErr("messenger")}
            className="md:col-span-2"
          />
        </div>
      </Section>

      <Section
        title="Documents"
        subtitle="We need these on file before we can review your application."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FileField
            label="Passport scan"
            required
            accept="image/jpeg,image/png,image/webp,application/pdf"
            value={data.passport}
            onChange={(f) => {
              setField("passport", f);
              markTouched("passport");
            }}
            error={errors.passport}
            showError={showErr("passport")}
            hint="A clear scan of your passport's photo page."
          />
          <FileField
            label="Signed consent form"
            required
            accept="image/jpeg,image/png,image/webp,application/pdf"
            value={data.consent}
            onChange={(f) => {
              setField("consent", f);
              markTouched("consent");
            }}
            error={errors.consent}
            showError={showErr("consent")}
            hint="Download the form from our site, sign it, and re-upload."
          />
        </div>
      </Section>

      <Section
        title="Tell us a little more"
        subtitle="The parts where your voice matters most."
      >
        <div className="flex flex-col gap-5">
          <TextAreaField
            label="Dietary restrictions"
            hint="Allergies, halal, vegetarian, etc. Optional, but helps us plan."
            placeholder="e.g. peanut allergy, halal"
            value={data.dietary}
            onChange={(e) => setField("dietary", e.target.value)}
            onBlur={() => markTouched("dietary")}
            error={errors.dietary}
            showError={showErr("dietary")}
            count={data.dietary.length}
            max={LIMITS.dietary}
          />
          <TextAreaField
            label="Prior experience with cultural or international programs"
            hint="Optional. Conferences, exchanges, language camps — anything counts."
            placeholder="Share briefly if you have."
            value={data.priorExperience}
            onChange={(e) => setField("priorExperience", e.target.value)}
            onBlur={() => markTouched("priorExperience")}
            error={errors.priorExperience}
            showError={showErr("priorExperience")}
            count={data.priorExperience.length}
            max={LIMITS.priorExperience}
          />
          <TextAreaField
            label="Why do you want to join PERMIRA Summer Camp 2026?"
            required
            hint="A short essay. We read every one — be honest, not perfect."
            placeholder="What draws you to the table?"
            value={data.motivation}
            onChange={(e) => setField("motivation", e.target.value)}
            onBlur={() => markTouched("motivation")}
            error={errors.motivation}
            showError={showErr("motivation")}
            count={data.motivation.length}
            max={LIMITS.motivation}
            rows={6}
          />
        </div>
      </Section>

      {status === "error" && errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="rounded-xl border border-terracotta-500/30 bg-terracotta-500/8 px-4 py-3 text-sm text-terracotta-600"
        >
          <strong className="font-medium">Submission failed.</strong> {errorMessage}
        </motion.div>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-clove-900/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-clove-700/60">
          By submitting you agree we may contact you about the camp. <span className="text-terracotta-500">*</span> required.
        </p>
        <div className="flex gap-3 sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-full border border-clove-900/15 bg-cream-50 px-6 py-3 text-sm font-medium text-clove-900 transition hover:border-clove-900/30 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-clove-900 px-7 py-3 text-sm font-medium text-cream-50 shadow-[0_10px_30px_-10px_rgba(74,32,20,0.6)] transition-all hover:bg-terracotta-500 hover:shadow-[0_14px_36px_-10px_rgba(196,80,42,0.6)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (
              <>
                <Spinner /> Sending…
              </>
            ) : (
              <>
                Reserve my seat
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5">
      <header>
        <h3 className="font-display text-xl font-medium text-clove-900 md:text-2xl">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-clove-700/70">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 1-9 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function SuccessState({
  onClose,
  confirmationId,
}: {
  onClose: () => void;
  confirmationId: string | null;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-6 py-8 text-center"
    >
      <div className="grid h-16 w-16 place-items-center rounded-full bg-saffron/15 text-saffron">
        <motion.svg
          viewBox="0 0 24 24"
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <motion.path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </div>
      <div>
        <h3 className="font-display text-3xl font-light text-clove-900 md:text-4xl">
          Your seat is held.
        </h3>
        <p className="mx-auto mt-3 max-w-md text-pretty text-base leading-relaxed text-clove-700/80">
          Thank you. We'll write you in early 2026 with the next steps — and a recipe to read while you wait.
        </p>
        {confirmationId && confirmationId !== "ok" && (
          <p className="mt-4 font-mono text-xs text-clove-700/50">Reference · {confirmationId}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-full bg-clove-900 px-7 py-3 text-sm font-medium text-cream-50 transition hover:bg-terracotta-500"
      >
        Back to the story
      </button>
      <p className="font-script text-2xl text-saffron">selamat makan · приятного аппетита</p>
    </motion.div>
  );
}
