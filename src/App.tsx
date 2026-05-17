import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { SmoothScroll } from "./lib/SmoothScroll";
import { LandingPage } from "./pages/LandingPage";
import { Admin } from "./pages/Admin";
import { AdminParticipants } from "./pages/AdminParticipants";
import { RegistrationModal } from "./components/registration/RegistrationModal";
import { ChatWidget } from "./components/chat/ChatWidget";

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
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/participants" element={<AdminParticipants />} />
      </Routes>
      <RegistrationModal open={open} onClose={() => setOpen(false)} />
      <ChatWidget />
    </Wrapper>
  );
}

function Passthrough({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
