/**
 * Scene state — a tiny React context that owns the cross-cutting state
 * shared by the canvas, the camera controller, and the HTML overlay UI.
 *
 *   inspectedId — zone currently focused (drives camera + InfoPanel)
 *   hoveredId   — zone currently under the pointer (drives ambient highlight)
 *
 * Lives ABOVE the Canvas in the page tree so HTML components (InfoPanel,
 * hints) and 3D components (Zone, CameraController) share the same store.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type SceneState = {
  inspectedId: string | null;
  hoveredId: string | null;
  hasInteracted: boolean;
  inspect: (id: string) => void;
  clearInspect: () => void;
  setHover: (id: string | null) => void;
};

const SceneStateContext = createContext<SceneState | null>(null);

export function SceneStateProvider({ children }: { children: ReactNode }) {
  const [inspectedId, setInspectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const inspect = useCallback((id: string) => {
    setInspectedId(id);
    setHasInteracted(true);
  }, []);
  const clearInspect = useCallback(() => setInspectedId(null), []);
  const setHover = useCallback((id: string | null) => setHoveredId(id), []);

  const value = useMemo<SceneState>(
    () => ({ inspectedId, hoveredId, hasInteracted, inspect, clearInspect, setHover }),
    [inspectedId, hoveredId, hasInteracted, inspect, clearInspect, setHover],
  );

  return <SceneStateContext.Provider value={value}>{children}</SceneStateContext.Provider>;
}

export function useSceneState() {
  const ctx = useContext(SceneStateContext);
  if (!ctx) throw new Error("useSceneState must be used inside <SceneStateProvider>");
  return ctx;
}
