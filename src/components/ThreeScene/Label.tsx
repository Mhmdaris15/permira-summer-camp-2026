/**
 * Label — HTML overlay anchored to a 3D position. Glassmorphic chips
 * read as premium architectural callouts and tie the UI to the scene
 * optically (blurred background absorbs the colour of the zone beneath).
 *
 * Variants:
 *   primary — main zone names
 *   small   — short marks like "N"
 *   arrow   — bold uppercase pill for entrance/exit
 */
import { Html } from "@react-three/drei";

type Props = {
  position?: [number, number, number];
  children: React.ReactNode;
  variant?: "primary" | "small" | "arrow";
};

const baseFont: React.CSSProperties = {
  fontFamily: "Inter, system-ui, sans-serif",
  fontFeatureSettings: '"ss01", "ss02"',
  letterSpacing: 0.2,
  pointerEvents: "none",
  whiteSpace: "nowrap",
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

export function Label({ position = [0, 0, 0], children, variant = "primary" }: Props) {
  return (
    <Html position={position} center zIndexRange={[40, 0]} style={styles[variant]}>
      {children}
    </Html>
  );
}
