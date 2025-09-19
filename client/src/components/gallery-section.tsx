import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useRef } from "react";

export function GallerySection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const section = sectionRef.current;
    if (section) {
      const animatedElements = section.querySelectorAll('.animate-fade-in');
      animatedElements.forEach((el) => observer.observe(el));
    }

    return () => observer.disconnect();
  }, []);
  const galleryItems = [
    {
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      title: "첨단 레이저 장비",
      description: "최신 레이저 기술로 안전하고 효과적인 치료",
    },
    {
      image: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      title: "프리미엄 치료실",
      description: "개인 프라이버시가 보장되는 쾌적한 치료 공간",
    },
    {
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      title: "전문의 상담실",
      description: "1:1 맞춤 상담으로 최적의 치료 계획 수립",
    },
    {
      image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      title: "편안한 대기실",
      description: "편안하고 안락한 분위기의 접수 및 대기 공간",
    },
    {
      image: "https://images.unsplash.com/photo-1486825586573-7131f7991bdd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      title: "병원 전경",
      description: "접근하기 편리한 위치의 현대적인 의료시설",
    },
  ];

  return (
    <section ref={sectionRef} className="py-20" data-testid="section-gallery">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h3 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            최첨단 시설
          </h3>
          <p className="text-lg text-muted-foreground">
            안전하고 쾌적한 환경에서 제공하는 프리미엄 의료 서비스
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleryItems.map((item, index) => (
            <Card
              key={index}
              className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all animate-fade-in"
              data-testid={`card-gallery-${index}`}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
              <CardContent className="p-6">
                <h4 className="font-bold mb-2">{item.title}</h4>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
