import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { SmoothScroll } from "./lib/SmoothScroll";
import { LandingPage } from "./pages/LandingPage";
import { RegistrationModal } from "./components/registration/RegistrationModal";
import { ChatWidget } from "./components/chat/ChatWidget";

// Code-split heavy / secondary routes so the landing page never ships them.
// /proposal pulls in three + @react-three/fiber + @react-three/drei (~600KB+)
// and only loads when a visitor actually opens it. Admin pages similarly
// stay out of the public bundle.
const LayoutProposal = lazy(() =>
  import("./pages/LayoutProposal").then((m) => ({ default: m.LayoutProposal })),
);
const Admin = lazy(() => import("./pages/Admin").then((m) => ({ default: m.Admin })));
const AdminParticipants = lazy(() =>
  import("./pages/AdminParticipants").then((m) => ({ default: m.AdminParticipants })),
);
const AdminAnalytics = lazy(() =>
  import("./pages/AdminAnalytics").then((m) => ({ default: m.AdminAnalytics })),
);
const AdminGroups = lazy(() =>
  import("./pages/AdminGroups").then((m) => ({ default: m.AdminGroups })),
);
const AdminEmail = lazy(() =>
  import("./pages/AdminEmail").then((m) => ({ default: m.AdminEmail })),
);
const AdminEmailHistory = lazy(() =>
  import("./pages/AdminEmailHistory").then((m) => ({ default: m.AdminEmailHistory })),
);

function AppShell() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement | null)?.closest('a[href="#register"]');
      if (!link) return;
      e.preventDefault();
      setOpen(true);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Smooth scroll only suits the storytelling landing page; the admin
  // pages benefit from the browser's native scroll for long forms/tables.
  const isLanding = location.pathname === "/";
  const Wrapper = isLanding ? SmoothScroll : Passthrough;

  return (
    <Wrapper>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/participants" element={<AdminParticipants />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/groups" element={<AdminGroups />} />
          <Route path="/admin/email" element={<AdminEmail />} />
          <Route path="/admin/email/history" element={<AdminEmailHistory />} />
          <Route path="/maps" element={<LayoutProposal />} />
        </Routes>
      </Suspense>
      <RegistrationModal open={open} onClose={() => setOpen(false)} />
      <ChatWidget />
    </Wrapper>
  );
}

function Passthrough({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Minimal fallback shown while a lazy route chunk downloads.
function RouteFallback() {
  return (
    <div className="grid min-h-screen place-items-center bg-cream-50">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-terracotta-500/30 border-t-terracotta-500" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
