import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Shield } from "lucide-react";

export function FabAdminButton() {
  const [, navigate] = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const vh = window.innerHeight;
      const full = document.documentElement.scrollHeight;
      setVisible(scrollY + vh >= full - 200);
    }
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;
  return (
    <button
      onClick={() => navigate('/admin-login')}
      className="fixed bottom-4 right-4 z-50 rounded-full shadow-2xl bg-gradient-to-br from-fuchsia-500 to-sky-500 text-white p-4 hover:scale-105 transition-transform"
      aria-label="Admin"
      data-testid="fab-admin"
    >
      <Shield className="w-6 h-6" />
    </button>
  );
}
