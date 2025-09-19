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
import { Phone, MessageSquare } from "lucide-react";

export default function Landing() {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const { toast } = useToast();

  const handleAdminLogin = () => {
    // Redirect to Replit auth for admin login
    window.location.href = "/api/login";
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
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-primary">
            서울 안티에이징 피부과 의원
          </h1>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdminModal(true)}
              data-testid="button-admin-login"
            >
              <i className="fas fa-user-shield mr-1"></i> Admin
            </Button>
            <div className="hidden md:flex items-center space-x-2 text-primary font-medium">
              <Phone className="w-4 h-4" />
              <span>010-1234-5678</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20">
        <HeroSection onKakaoClick={openKakaoTalk} />
        <ServicesSection />
        <GallerySection />
        <AppointmentBooking />
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
            <DialogTitle className="text-primary">관리자 로그인</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
    </div>
  );
}
