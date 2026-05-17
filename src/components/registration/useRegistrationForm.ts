import { useCallback, useMemo, useRef, useState } from "react";
import { emptyRegistration, type FieldErrors, type RegistrationData } from "./types";
import { validate } from "./validate";

type Touched = Partial<Record<keyof RegistrationData, true>>;

/**
 * Centralizes form state, dirty/touched tracking, and a small debounce
 * so submissions issued faster than 600ms after the last keystroke are
 * deferred — a soft anti-spam in addition to the honeypot.
 */
export function useRegistrationForm() {
  const [data, setData] = useState<RegistrationData>(emptyRegistration);
  const [touched, setTouched] = useState<Touched>({});
  const lastChangeRef = useRef<number>(0);

  const errors: FieldErrors = useMemo(() => validate(data), [data]);

  const isValid = Object.keys(errors).length === 0;

  const setField = useCallback(<K extends keyof RegistrationData>(key: K, value: RegistrationData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
    lastChangeRef.current = Date.now();
  }, []);

  const markTouched = useCallback((key: keyof RegistrationData) => {
    setTouched((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  }, []);

  const touchAll = useCallback(() => {
    setTouched(
      Object.keys(emptyRegistration).reduce<Touched>((acc, k) => {
        acc[k as keyof RegistrationData] = true;
        return acc;
      }, {}),
    );
  }, []);

  const reset = useCallback(() => {
    setData(emptyRegistration);
    setTouched({});
  }, []);

  /** Returns true if the user has been quiet for at least `ms` milliseconds. */
  const isSettled = useCallback((ms = 600) => Date.now() - lastChangeRef.current >= ms, []);

  return {
    data,
    errors,
    touched,
    isValid,
    setField,
    markTouched,
    touchAll,
    reset,
    isSettled,
  };
}
