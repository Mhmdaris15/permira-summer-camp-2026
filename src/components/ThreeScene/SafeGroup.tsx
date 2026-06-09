/**
 * SafeGroup — tiny class-based error boundary intended to wrap optional
 * decorative subtrees (e.g. lazy-loaded GLB props). If anything inside
 * throws — texture 404, GLTF parse error, missing geometry — the
 * boundary swallows it and renders nothing, so the rest of the scene
 * still draws. Errors are logged once for visibility.
 *
 * Use sparingly: only around tree branches whose absence is acceptable.
 */
import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { name: string; children: ReactNode };
type State = { hasError: boolean };

export class SafeGroup extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error(`[SafeGroup:${this.props.name}] swallowed`, error, info.componentStack);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
