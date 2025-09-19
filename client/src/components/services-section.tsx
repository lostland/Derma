import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Leaf, Shield } from "lucide-react";

export function ServicesSection() {
  const services = [
    {
      icon: Sparkles,
      title: "안티에이징",
      description: "주름 개선, 탄력 증진을 위한 전문적인 안티에이징 치료",
    },
    {
      icon: Leaf,
      title: "피부재생",
      description: "손상된 피부의 재생과 회복을 돕는 첨단 치료법",
    },
    {
      icon: Shield,
      title: "여드름 치료",
      description: "개인 맞춤형 여드름 치료로 건강한 피부로 회복",
    },
  ];

  return (
    <section className="py-20 bg-secondary" data-testid="section-services">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h3 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            전문 진료 분야
          </h3>
          <p className="text-lg text-muted-foreground">
            최고의 전문성으로 제공하는 맞춤형 피부 치료
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Card
                key={index}
                className="bg-card p-8 shadow-lg hover:shadow-xl transition-all animate-fade-in"
                data-testid={`card-service-${index}`}
              >
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-6">
                    <IconComponent className="w-8 h-8 text-accent" />
                  </div>
                  <h4 className="text-xl font-bold mb-4">{service.title}</h4>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
