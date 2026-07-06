import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { submitRegistration, type SubmitResult } from "../../lib/api";
import { useRegistrationForm } from "./useRegistrationForm";
import { LIMITS } from "./types";
import { TextField, TextAreaField, SelectField, RadioGroup, FileField } from "./Field";

type Status = "idle" | "submitting" | "success" | "error";

export function RegistrationForm({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
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

      <Section title={t("registration.sectionAbout")} subtitle={t("registration.sectionAboutSub")}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <TextField
            label={t("registration.fullName")}
            required
            placeholder={t("registration.fullNamePh")}
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
            label={t("registration.nationality")}
            required
            placeholder={t("registration.nationalityPh")}
            value={data.nationality}
            onChange={(e) => {
              setField("nationality", e.target.value as typeof data.nationality);
              markTouched("nationality");
            }}
            onBlur={() => markTouched("nationality")}
            options={[
              { value: "Indonesia", label: `🇮🇩 ${t("registration.indonesia")}` },
              { value: "Russia", label: `🇷🇺 ${t("registration.russia")}` },
            ]}
            error={errors.nationality}
            showError={showErr("nationality")}
          />
          <TextField
            label={t("registration.university")}
            required
            placeholder={t("registration.universityPh")}
            value={data.university}
            onChange={(e) => setField("university", e.target.value)}
            onBlur={() => markTouched("university")}
            error={errors.university}
            showError={showErr("university")}
            count={data.university.length}
            max={LIMITS.university}
            className="md:col-span-2"
          />
        </div>
        <div className="mt-5">
          <RadioGroup
            label={t("registration.gender")}
            required
            name="gender"
            value={data.gender}
            onChange={(v) => {
              setField("gender", v as typeof data.gender);
              markTouched("gender");
            }}
            options={[
              { value: "Female", label: t("registration.female") },
              { value: "Male", label: t("registration.male") },
            ]}
            error={errors.gender}
            showError={showErr("gender")}
          />
        </div>
      </Section>

      <Section title={t("registration.sectionContact")} subtitle={t("registration.sectionContactSub")}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <TextField
            label={t("registration.email")}
            required
            type="email"
            autoComplete="email"
            placeholder={t("registration.emailPh")}
            value={data.email}
            onChange={(e) => setField("email", e.target.value)}
            onBlur={() => markTouched("email")}
            error={errors.email}
            showError={showErr("email")}
          />
          <TextField
            label={t("registration.phone")}
            required
            type="tel"
            autoComplete="tel"
            placeholder={t("registration.phonePh")}
            value={data.phone}
            onChange={(e) => setField("phone", e.target.value)}
            onBlur={() => markTouched("phone")}
            error={errors.phone}
            showError={showErr("phone")}
          />
          <TextField
            label={t("registration.messenger")}
            required
            placeholder={t("registration.messengerPh")}
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
        title={t("registration.sectionDocs")}
        subtitle={t("registration.sectionDocsSub")}
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FileField
            label={t("registration.passport")}
            required
            accept="image/jpeg,image/png,image/webp,application/pdf"
            value={data.passport}
            onChange={(f) => {
              setField("passport", f);
              markTouched("passport");
            }}
            error={errors.passport}
            showError={showErr("passport")}
            hint={t("registration.passportHint")}
          />
          <FileField
            label={t("registration.studentCard")}
            required
            accept="image/jpeg,image/png,image/webp,application/pdf"
            value={data.studentCard}
            onChange={(f) => {
              setField("studentCard", f);
              markTouched("studentCard");
            }}
            error={errors.studentCard}
            showError={showErr("studentCard")}
            hint={t("registration.studentCardHint")}
          />
        </div>
      </Section>

      <Section
        title={t("registration.sectionMore")}
        subtitle={t("registration.sectionMoreSub")}
      >
        <div className="flex flex-col gap-5">
          <TextAreaField
            label={t("registration.dietary")}
            hint={t("registration.dietaryHint")}
            placeholder={t("registration.dietaryPh")}
            value={data.dietary}
            onChange={(e) => setField("dietary", e.target.value)}
            onBlur={() => markTouched("dietary")}
            error={errors.dietary}
            showError={showErr("dietary")}
            count={data.dietary.length}
            max={LIMITS.dietary}
          />
          <TextAreaField
            label={t("registration.prior")}
            hint={t("registration.priorHint")}
            placeholder={t("registration.priorPh")}
            value={data.priorExperience}
            onChange={(e) => setField("priorExperience", e.target.value)}
            onBlur={() => markTouched("priorExperience")}
            error={errors.priorExperience}
            showError={showErr("priorExperience")}
            count={data.priorExperience.length}
            max={LIMITS.priorExperience}
          />
          {/* Essay is the heaviest factor in selection — call it out clearly. */}
          <div className="rounded-2xl border-2 border-terracotta-500/40 bg-terracotta-500/5 p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-terracotta-500 text-cream-50">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" />
                </svg>
              </span>
              <div>
                <p className="font-display text-base font-medium text-clove-900">
                  {t("registration.essayNoticeTitle")}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-clove-700/85">
                  {t("registration.essayNoticeBody")}
                </p>
              </div>
            </div>
          </div>
          <TextAreaField
            label={t("registration.motivation")}
            required
            hint={t("registration.motivationHint")}
            placeholder={t("registration.motivationPh")}
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
          <strong className="font-medium">{t("registration.failed")}</strong> {errorMessage}
        </motion.div>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-clove-900/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-clove-700/60">
          {t("registration.agree")} <span className="text-terracotta-500">*</span> {t("registration.required")}.
        </p>
        <div className="flex gap-3 sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-full border border-clove-900/15 bg-cream-50 px-6 py-3 text-sm font-medium text-clove-900 transition hover:border-clove-900/30 disabled:opacity-50"
          >
            {t("registration.cancel")}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-clove-900 px-7 py-3 text-sm font-medium text-cream-50 shadow-[0_10px_30px_-10px_rgba(74,32,20,0.6)] transition-all hover:bg-terracotta-500 hover:shadow-[0_14px_36px_-10px_rgba(196,80,42,0.6)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (
              <>
                <Spinner /> {t("registration.submitting")}
              </>
            ) : (
              <>
                {t("registration.submit")}
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
  const { t } = useTranslation();
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
          {t("registration.successTitle")}
        </h3>
        <p className="mx-auto mt-3 max-w-md text-pretty text-base leading-relaxed text-clove-700/80">
          {t("registration.successBody")}
        </p>
        {confirmationId && confirmationId !== "ok" && (
          <p className="mt-4 font-mono text-xs text-clove-700/50">{t("registration.ref")} · {confirmationId}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-full bg-clove-900 px-7 py-3 text-sm font-medium text-cream-50 transition hover:bg-terracotta-500"
      >
        {t("registration.successBack")}
      </button>
      <p className="font-script text-2xl text-saffron">{t("footer.script")}</p>
    </motion.div>
  );
}
