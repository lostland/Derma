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
      description: "주름 개선, 탄력 증진을 위한 전문적인 안티에이징 치료",
    },
    {
      media: re_img,
      title: "피부재생",
      description: "손상된 피부의 재생과 회복을 돕는 첨단 치료법",
    },
    {
      media: lift_img,
      title: "피부 리프팅",
      description: "피부의 탄력과 주름을 개선",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-secondary"
      data-testid="section-services"
    >
      <div className="mx-auto w-full px-0 md:container md:mx-auto md:px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h3 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            전문 진료 분야
          </h3>
          <p className="text-lg text-muted-foreground">
            최고의 전문성으로 제공하는 맞춤형 피부 치료
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card
              key={index}
              className="overflow-hidden transition-all animate-fade-in rounded-none border-none bg-transparent shadow-none backdrop-blur-0 md:rounded-2xl md:bg-card md:shadow-xl md:hover:shadow-2xl md:backdrop-blur-sm"
              data-testid={`card-service-${index}`}
            >
              {/* 카드 전체를 채우는 이미지 */}
              <div className="w-full h-48 md:h-64">
                {String(service.media).toLowerCase().endsWith(".mp4") ? (
                  <VideoWithPreview src={service.media as string} className="h-full" preload="auto" />
                ) : (
                  <img src={service.media as any} alt={service.title} className="block w-full h-full object-cover" />
                )}
              </div>
              <CardContent className="px-6 py-6 md:p-6">
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
