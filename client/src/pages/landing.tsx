import { HeroSection } from "@/components/hero-section";
import { ServicesSection } from "@/components/services-section";
import { GallerySection } from "@/components/gallery-section";
import { AppointmentBooking } from "@/components/appointment-booking";
import { ContactForm } from "@/components/contact-form";
import { LocationSection } from "@/components/location-section";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Phone, MessageSquare, Settings } from "lucide-react";
import { useLocation } from "wouter";
import logoImage from "@assets/logo001.png";

export default function Landing() {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [, navigate] = useLocation();
  const [adminId, setAdminId] = useState('admin');
  const [adminPw, setAdminPw] = useState('');

  const { toast } = useToast();

  const handleAdminLogin = async () => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminId, password: adminPw })
      });
      if (!res.ok) {
        const j = await res.json().catch(()=>({ message: '로그인 실패' }));
        throw new Error(j.message || '로그인 실패');
      }
      window.location.href = '/admin';
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : undefined;
      toast({ title: '로그인 실패', description: message || '아이디/비밀번호를 확인해 주세요.', variant: 'destructive' });
    }
  };

  const openKakaoTalk = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // Try to open KakaoTalk app directly on mobile
      const kakaoAppUrl = "kakaotalk://plusfriend/chat/_SeoulAntiAgingSkinClinic";
      const fallbackUrl = "http://pf.kakao.com/_Bxdjmxl/chat";

      const openApp = () => {
        window.location.href = kakaoAppUrl;

        // Fallback to web if app doesn't open
        setTimeout(() => {
          window.open(fallbackUrl, '_blank');
        }, 1500);
      };

      openApp();
    } else {
      // Desktop - open web version
      window.open("https://pf.kakao.com/_SeoulAntiAgingSkinClinic/chat", '_blank');
    }

    toast({
      title: "카카오톡 상담",
      description: isMobile ? "카카오톡 앱으로 연결됩니다." : "카카오톡 웹 채팅으로 연결됩니다.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="h-16 md:h-20 flex items-center justify-center"><img src={logoImage} alt="서울 안티에이징 피부과 의원" className="max-h-full object-contain mx-auto" /></div>
          <div className="flex items-center space-x-4">

            <div className="hidden md:flex items-center space-x-2 text-theme font-medium">
              <Phone className="w-4 h-4" />
              <span>010-1234-5678</span>
            </div>

            <a
              href="tel:010-1234-5678"
              className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md transition"
              data-testid="link-call-desktop"
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm">전화하기</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20">
        <HeroSection onKakaoClick={openKakaoTalk} />
        <ServicesSection />
        <GallerySection />
        {/* <AppointmentBooking /> */}
        <ContactForm />
        <LocationSection />
      </main>

      {/* Fixed Contact Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-40">
        <Button
          onClick={openKakaoTalk}
          className="bg-yellow-400 hover:bg-yellow-500 text-black w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110"
          data-testid="button-kakao-floating"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
        <a
          href="tel:010-1234-5678"
          className="md:hidden bg-green-600 hover:bg-green-700 text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 flex items-center justify-center"
          data-testid="link-call-floating"
        >
          <Phone className="w-6 h-6" />
        </a>
      </div>

      {/* Admin Login Modal */}
      <Dialog open={showAdminModal} onOpenChange={setShowAdminModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-theme">관리자 로그인</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="adminId">아이디</Label>
              <Input id="adminId" value={adminId} onChange={(e)=>setAdminId(e.target.value)} placeholder="admin" data-testid="input-admin-id" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="adminPw">비밀번호</Label>
              <Input id="adminPw" type="password" value={adminPw} onChange={(e)=>setAdminPw(e.target.value)} placeholder="비밀번호" data-testid="input-admin-pw" />
            </div>

            <p className="text-sm text-muted-foreground">
              관리자 권한으로 로그인하여 문의 내역을 확인하세요.
            </p>
            <Button
              onClick={handleAdminLogin}
              className="w-full"
              data-testid="button-admin-auth"
            >
              로그인
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin floating action button (shows near bottom) */}
      {/* Admin settings button - fixed bottom-left */}
      <button
        onClick={() => navigate("/admin")}
        className="fixed bottom-5 left-5 z-50 rounded-full p-3 bg-card border border-border text-theme shadow-lg hover:shadow-xl hover:bg-accent/30 transition"
        data-testid="button-admin-settings"
        aria-label="Admin settings"
        title="Admin"
      >
        <Settings className="w-6 h-6" />
      </button>

    </div>
  );
}