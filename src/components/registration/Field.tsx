import { useId, type ReactNode, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type BaseProps = {
  label: string;
  hint?: string;
  error?: string;
  showError?: boolean;
  required?: boolean;
  className?: string;
  /** When given alongside maxLength, render a counter under the field. */
  count?: number;
  max?: number;
};

const baseInputCls =
  "w-full rounded-xl border bg-cream-50/70 px-4 py-3 text-clove-900 placeholder:text-clove-700/40 transition-colors outline-none focus:bg-cream-50";

const stateBorder = (showError?: boolean) =>
  showError
    ? "border-terracotta-500/60 focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20"
    : "border-clove-900/12 focus:border-terracotta-500/60 focus:ring-2 focus:ring-terracotta-500/15";

function Wrap({
  id,
  label,
  hint,
  error,
  showError,
  required,
  className,
  count,
  max,
  children,
}: BaseProps & { id: string; children: ReactNode }) {
  const errorId = `${id}-err`;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="flex items-center justify-between gap-3 text-sm font-medium text-clove-900">
        <span>
          {label}
          {required && <span aria-hidden className="ml-1 text-terracotta-500">*</span>}
        </span>
        {typeof count === "number" && typeof max === "number" && (
          <span
            className={cn(
              "font-mono text-[11px]",
              count > max ? "text-terracotta-500" : "text-clove-700/50",
            )}
          >
            {count}/{max}
          </span>
        )}
      </label>
      {children}
      {showError && error ? (
        <p id={errorId} role="alert" className="text-xs text-terracotta-500">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-clove-700/55">{hint}</p>
      ) : null}
    </div>
  );
}

type TextFieldProps = BaseProps & InputHTMLAttributes<HTMLInputElement>;

export function TextField({
  label,
  hint,
  error,
  showError,
  required,
  className,
  count,
  max,
  ...input
}: TextFieldProps) {
  const auto = useId();
  const id = input.id ?? auto;
  return (
    <Wrap
      id={id}
      label={label}
      hint={hint}
      error={error}
      showError={showError}
      required={required}
      className={className}
      count={count}
      max={max}
    >
      <input
        id={id}
        aria-invalid={showError && !!error}
        aria-describedby={showError && error ? `${id}-err` : undefined}
        className={cn(baseInputCls, stateBorder(showError && !!error))}
        {...input}
      />
    </Wrap>
  );
}

type TextAreaFieldProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function TextAreaField({
  label,
  hint,
  error,
  showError,
  required,
  className,
  count,
  max,
  ...textarea
}: TextAreaFieldProps) {
  const auto = useId();
  const id = textarea.id ?? auto;
  return (
    <Wrap
      id={id}
      label={label}
      hint={hint}
      error={error}
      showError={showError}
      required={required}
      className={className}
      count={count}
      max={max}
    >
      <textarea
        id={id}
        aria-invalid={showError && !!error}
        aria-describedby={showError && error ? `${id}-err` : undefined}
        className={cn(baseInputCls, "min-h-[120px] resize-y leading-relaxed", stateBorder(showError && !!error))}
        {...textarea}
      />
    </Wrap>
  );
}

type SelectFieldProps = BaseProps &
  SelectHTMLAttributes<HTMLSelectElement> & {
    options: { value: string; label: string }[];
    placeholder?: string;
  };

export function SelectField({
  label,
  hint,
  error,
  showError,
  required,
  className,
  options,
  placeholder,
  ...select
}: SelectFieldProps) {
  const auto = useId();
  const id = select.id ?? auto;
  return (
    <Wrap
      id={id}
      label={label}
      hint={hint}
      error={error}
      showError={showError}
      required={required}
      className={className}
    >
      <div className="relative">
        <select
          id={id}
          aria-invalid={showError && !!error}
          aria-describedby={showError && error ? `${id}-err` : undefined}
          className={cn(
            baseInputCls,
            stateBorder(showError && !!error),
            "appearance-none pr-10",
            !select.value && "text-clove-700/40",
          )}
          {...select}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="text-clove-900">
              {opt.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-clove-700/60"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Wrap>
  );
}

type FileFieldProps = BaseProps & {
  accept: string;
  value: File | null;
  onChange: (file: File | null) => void;
  onBlur?: () => void;
};

export function FileField({
  label,
  hint,
  error,
  showError,
  required,
  className,
  accept,
  value,
  onChange,
  onBlur,
}: FileFieldProps) {
  const auto = useId();
  const id = `file-${auto}`;
  return (
    <Wrap
      id={id}
      label={label}
      hint={hint}
      error={error}
      showError={showError}
      required={required}
      className={className}
    >
      <label
        htmlFor={id}
        className={cn(
          "group flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed bg-cream-50/70 px-4 py-3 transition-colors",
          showError && error
            ? "border-terracotta-500/60 hover:border-terracotta-500"
            : value
              ? "border-leaf/50 bg-leaf/5"
              : "border-clove-900/15 hover:border-terracotta-500/50",
        )}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cream-100 text-clove-700 group-hover:bg-terracotta-500/10 group-hover:text-terracotta-500">
          {value ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 16V4m0 0L8 8m4-4l4 4M4 20h16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span className="flex-1 truncate text-sm">
          {value ? (
            <>
              <span className="font-medium text-clove-900">{value.name}</span>
              <span className="ml-2 text-clove-700/55">
                {(value.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </>
          ) : (
            <span className="text-clove-700/55">Click to upload · PDF, JPG, PNG, WebP up to 10 MB</span>
          )}
        </span>
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onChange(null);
            }}
            className="text-xs text-clove-700/60 hover:text-terracotta-500"
            aria-label="Remove file"
          >
            Remove
          </button>
        )}
        <input
          id={id}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            onChange(f);
          }}
          onBlur={onBlur}
        />
      </label>
    </Wrap>
  );
}

type RadioGroupProps = BaseProps & {
  name: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
};

export function RadioGroup({
  label,
  error,
  showError,
  required,
  className,
  name,
  value,
  options,
  onChange,
}: RadioGroupProps) {
  return (
    <fieldset className={cn("flex flex-col gap-2", className)}>
      <legend className="text-sm font-medium text-clove-900">
        {label}
        {required && <span aria-hidden className="ml-1 text-terracotta-500">*</span>}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const checked = value === opt.value;
          return (
            <label
              key={opt.value}
              className={cn(
                "cursor-pointer rounded-full border px-4 py-2 text-sm transition-all",
                checked
                  ? "border-terracotta-500 bg-terracotta-500 text-cream-50 shadow-sm"
                  : "border-clove-900/12 bg-cream-50/70 text-clove-700 hover:border-terracotta-500/40 hover:text-clove-900",
              )}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={checked}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              {opt.label}
            </label>
          );
        })}
      </div>
      {showError && error && (
        <p role="alert" className="text-xs text-terracotta-500">{error}</p>
      )}
    </fieldset>
  );
}
