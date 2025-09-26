import { VideoWithPreview } from "@/components/video-with-preview";
import { Button } from "@/components/ui/button";
import { Calendar, Phone, MessageSquare } from "lucide-react";
import clinicVideo from "@assets/clinic.mp4";

interface HeroSectionProps {
  onKakaoClick: () => void;
}

export function HeroSection({ onKakaoClick }: HeroSectionProps) {
  const taglineTitle = "서울 안티에이징 피부과";
  const taglineSubtitle = "동안을 디자인하는 프리미엄 안티에이징 클리닉";

  return (
    <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden pb-32 md:pb-40">
      {/* Background Image */}
      <div className="absolute inset-0">
        <VideoWithPreview
          src={clinicVideo}
          className="h-full w-full object-cover"
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 z-20 bg-primary/80"></div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-48 bg-gradient-to-b from-transparent via-primary/60 to-slate-50 dark:to-slate-950"></div>
      </div>

      {/* Tagline Overlay */}
      <div className="absolute inset-x-0 bottom-20 z-40 px-4 text-center">
        <div className="space-y-1 font-semibold drop-shadow-lg">
          <p className="text-white text-xl md:text-2xl font-bold [text-shadow:_1px_1px_2px_black]">
            {taglineTitle}
          </p>
          <p className="text-white text-2xl md:text-4xl font-extrabold [text-shadow:_2px_2px_3px_black]">
            {taglineSubtitle}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-40 text-center text-white max-w-4xl mx-auto px-4 pt-24 md:pt-32">
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
