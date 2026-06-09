/**
 * Label — HTML overlay anchored to a 3D position. Glassmorphic chips
 * tie the UI optically to the scene (blur picks up the colour beneath).
 *
 * When `highlighted` is true (set by Zone hover), the chip scales up
 * gently via a CSS transition — no per-frame React state updates.
 */
import { Html } from "@react-three/drei";

type Props = {
  position?: [number, number, number];
  children: React.ReactNode;
  variant?: "primary" | "small" | "arrow";
  highlighted?: boolean;
};

const baseFont: React.CSSProperties = {
  fontFamily: "Inter, system-ui, sans-serif",
  fontFeatureSettings: '"ss01", "ss02"',
  letterSpacing: 0.2,
  pointerEvents: "none",
  whiteSpace: "nowrap",
  transition: "transform 220ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 220ms, background 220ms",
  transformOrigin: "center",
};

const styles: Record<NonNullable<Props["variant"]>, React.CSSProperties> = {
  primary: {
    ...baseFont,
    background: "rgba(255, 255, 255, 0.65)",
    backdropFilter: "blur(14px) saturate(140%)",
    WebkitBackdropFilter: "blur(14px) saturate(140%)",
    border: "1px solid rgba(255, 255, 255, 0.7)",
    padding: "5px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    color: "#2c130b",
    boxShadow: "0 6px 20px -8px rgba(74, 32, 20, 0.35), 0 1px 0 rgba(255,255,255,0.6) inset",
  },
  small: {
    ...baseFont,
    background: "rgba(44, 19, 11, 0.78)",
    backdropFilter: "blur(8px)",
    color: "#fdf8f1",
    padding: "3px 8px",
    borderRadius: 999,
    fontSize: 10,
    fontWeight: 600,
  },
  arrow: {
    ...baseFont,
    background: "linear-gradient(135deg, #d96a3a, #c4502a)",
    color: "#fdf8f1",
    padding: "4px 12px",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    boxShadow: "0 6px 18px -6px rgba(196, 80, 42, 0.55)",
  },
};

export function Label({
  position = [0, 0, 0],
  children,
  variant = "primary",
  highlighted = false,
}: Props) {
  const style: React.CSSProperties = {
    ...styles[variant],
    ...(highlighted
      ? {
          transform: "scale(1.08)",
          background: "rgba(255,255,255,0.88)",
          boxShadow: "0 10px 28px -10px rgba(196, 80, 42, 0.45), 0 1px 0 rgba(255,255,255,0.8) inset",
        }
      : {}),
  };
  return (
    <Html position={position} center zIndexRange={[40, 0]} style={style}>
      {children}
    </Html>
  );
}
