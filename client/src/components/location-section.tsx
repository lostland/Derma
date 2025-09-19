import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Train, Bus, Clock, Map } from "lucide-react";
import { useEffect, useRef } from "react";

export function LocationSection() {
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
  return (
    <section ref={sectionRef} className="py-20" data-testid="section-location">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h3 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            병원 위치
          </h3>
          <p className="text-lg text-muted-foreground">
            찾아오시는 길과 교통편 안내
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="animate-fade-in">
            <Card className="p-8 shadow-lg">
              <CardContent className="p-0">
                <h4 className="text-2xl font-bold mb-6">오시는 길</h4>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <MapPin className="w-6 h-6 text-accent mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-lg mb-1">주소</p>
                      <p className="text-muted-foreground">서울 송파구 올림픽로 99</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Train className="w-6 h-6 text-accent mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-lg mb-1">지하철</p>
                      <p className="text-muted-foreground">
                        8호선 잠실나루역 2번 출구 도보 5분
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Bus className="w-6 h-6 text-accent mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-lg mb-1">버스</p>
                      <p className="text-muted-foreground">
                        146, 340, 3411 올림픽로 정류장 하차
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Clock className="w-6 h-6 text-accent mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-lg mb-1">진료시간</p>
                      <div className="text-muted-foreground">
                        <p>평일 09:00 - 18:00</p>
                        <p>토요일 09:00 - 15:00</p>
                        <p>일요일 휴진</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="animate-fade-in">
            <Card className="h-96 overflow-hidden shadow-lg">
              <CardContent className="p-0 h-full relative bg-gray-100">
                {/* Placeholder for Naver Map */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Map className="w-16 h-16 text-accent mb-4 mx-auto" />
                    <p className="text-lg font-medium text-primary mb-2">네이버 지도</p>
                    <p className="text-muted-foreground mb-1">서울 송파구 올림픽로 99</p>
                    <p className="text-sm text-muted-foreground">
                      지도 API 연동이 필요합니다
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
