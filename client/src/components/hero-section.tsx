import { Button } from "@/components/ui/button";
import { Calendar, Phone, MessageSquare } from "lucide-react";
import clinicVideo from "@assets/clinic.mp4";

interface HeroSectionProps {
  onKakaoClick: () => void;
}

export function HeroSection({ onKakaoClick }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <video className="w-full h-full object-cover" autoPlay loop muted playsInline preload="metadata">
          <source src={clinicVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-primary/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
        <h2 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
          아름다운 피부를 위한<br />
          <span className="text-accent">프리미엄 케어</span>
        </h2>
        <p className="text-xl md:text-2xl mb-8 opacity-90 animate-fade-in">
          최첨단 기술과 풍부한 경험으로 여러분의 피부 건강을 책임집니다
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center animate-fade-in">
          <Button
            size="lg"
            className="bg-accent hover:bg-accent/90 text-white px-8 py-6 text-lg font-medium transform hover:scale-105 transition-all"
            data-testid="button-appointment"
          >
            <Calendar className="w-5 h-5 mr-2" />
            진료 예약하기
          </Button>
          <a
            href="tel:010-1234-5678"
            className="md:hidden"
            data-testid="link-call-hero"
          >
            <Button
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg font-medium transform hover:scale-105 transition-all"
            >
              <Phone className="w-5 h-5 mr-2" />
              전화 걸기
            </Button>
          </a>
          <Button
            size="lg"
            onClick={onKakaoClick}
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-6 text-lg font-medium transform hover:scale-105 transition-all"
            data-testid="button-kakao-hero"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            카카오톡 상담
          </Button>
        </div>
      </div>
    </section>
  );
}
