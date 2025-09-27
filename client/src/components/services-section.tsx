import { Card, CardContent } from "@/components/ui/card";
import { VideoWithPreview } from "@/components/video-with-preview";
import { useEffect, useRef } from "react";
import lift_img from "@assets/lift.mp4";
import anti_img from "@assets/anti.mp4";
import re_img from "@assets/re.mp4";

export function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const section = sectionRef.current;
    if (section) {
      const animatedElements = section.querySelectorAll(".animate-fade-in");
      animatedElements.forEach((el) => observer.observe(el));
    }

    return () => observer.disconnect();
  }, []);

  const services = [
    {
      media: anti_img,
      title: "안티에이징",
      description:
        "깊은 주름과 잔주름을 동시에 케어하며, 피부 속 콜라겐 생성을 활성화하는 맞춤형 프로그램입니다. 혈류 순환을 도와 탄력을 되찾게 하고, 생활 습관에 맞춘 홈케어 솔루션까지 제안해 장기적인 젊음을 유지하도록 돕습니다.",
    },
    {
      media: re_img,
      title: "피부재생",
      description:
        "여드름 흉터부터 외부 자극으로 인한 민감성 피부까지 단계별로 회복시키는 집중 관리입니다. 최신 재생 레이저와 성장인자 치료를 병행해 피부 장벽을 강화하고, 맞춤형 재생 크림으로 회복 속도를 높여드립니다.",
    },
    {
      media: lift_img,
      title: "피부 리프팅",
      description:
        "탄력이 떨어진 부위를 정밀하게 타겟팅해 처짐을 개선하고 윤곽 라인을 정돈하는 리프팅 솔루션입니다. 고강도 초음파 에너지와 콜라겐 부스터를 함께 적용해 시술 직후 탄력 변화를 느낄 수 있도록 설계되었습니다.",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-secondary"
      data-testid="section-services"
    >
      <div className="mx-auto w-full px-0">

        <div className="grid gap-8">
          {services.map((service, index) => (
            <Card
              key={index}
              className="overflow-hidden transition-all animate-fade-in rounded-none border-none bg-transparent shadow-none backdrop-blur-0"
              data-testid={`card-service-${index}`}
            >
              {/* 카드 전체를 채우는 이미지 */}
              <div className="w-full h-48">
                {String(service.media).toLowerCase().endsWith(".mp4") ? (
                  <VideoWithPreview src={service.media as string} className="h-full" preload="auto" />
                ) : (
                  <img src={service.media as any} alt={service.title} className="block w-full h-full object-cover" />
                )}
              </div>
              <CardContent className="px-6 py-6">
                <h4 className="text-xl font-bold mb-4 text-center">{service.title}</h4>
                <p className="text-muted-foreground">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
