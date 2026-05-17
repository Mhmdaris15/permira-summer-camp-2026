import { useEffect } from "react";

/**
 * Adds `.is-visible` to any descendant `.reveal` once it enters the viewport.
 * IntersectionObserver keeps this cheap; GSAP is reserved for richer scenes.
 */
export function useScrollReveal(rootSelector = "body") {
  useEffect(() => {
    const root = document.querySelector(rootSelector);
    if (!root) return;
    const targets = root.querySelectorAll<HTMLElement>(".reveal");
    if (!targets.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px" },
    );

    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rootSelector]);
}
