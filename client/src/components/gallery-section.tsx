import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useRef } from "react";
import waiting_vid from "@assets/waiting.mp4";
import talk_vid from "@assets/talk.mp4";
import laser_vid from "@assets/laser.mp4";
import careroom_vid from "@assets/careroom.mp4";

/**
 * GallerySection
 * 기존: 4장의 카드를 grid로 나열
 * 변경: 각 이미지를 '섹션' 단위로 분리하여, 제목 + 큰 이미지 + 긴 설명이 함께 나오도록 구성
 */
export function GallerySection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove("opacity-0");
          entry.target.classList.add("opacity-100");
        } else {
          entry.target.classList.remove("opacity-100");
          entry.target.classList.add("opacity-0");
        }
      });
    }, { threshold: 0.1 });

    const nodes = sectionRef.current?.querySelectorAll("[data-observe]") || [];
    nodes.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const sections = [
    {
      title: "프리미엄 대기 공간",
      media: waiting_vid,
      long:
        "첫 방문부터 쾌적함을 느낄 수 있는 프리미엄 대기 공간입니다. 자연광을 충분히 들이는 동선 설계와 소음 흡수 재질의 마감재로, 긴장감을 줄이고 편안한 대기를 돕습니다. " +
        "공간 내 동선은 휠체어 이용 고객도 불편함 없이 이동할 수 있도록 충분한 폭을 확보하였으며, 항균 소재의 가구를 사용해 위생적 환경을 유지합니다. " +
        "대기 시간에는 안내 모니터를 통해 시술 전 유의사항과 회복 가이드를 제공하여, 시술 전 기대와 불안을 균형 있게 관리할 수 있도록 돕습니다.",
    },
    {
      title: "전문의 1:1 상담실",
      media: talk_vid,
      long:
        "상담은 단순한 설명을 넘어, 개인 피부 타입·생활 패턴·과거 시술 이력까지 종합적으로 고려하여 최적의 계획을 수립합니다. " +
        "프라이버시가 보장되는 독립형 공간에서 진행되며, 고해상도 피부 스캐너 및 라이팅 시스템으로 미세한 질감 변화까지 확인합니다. " +
        "상담 결과는 맞춤형 케어 플랜으로 저장되어 추후 내원 시에도 일관성 있게 적용됩니다.",
    },
    {
      title: "최첨단 레이저 치료실",
      media: laser_vid,
      long:
        "다양한 파장대와 모드로 세분화된 장비가 구비되어 있어 색소·혈관·모공·탄력 등 문제 유형에 따른 정밀한 치료가 가능합니다. " +
        "시술 전 자동 캘리브레이션과 테스트 샷을 통해 개별 피부 반응을 확인하고, 냉각·흡입 시스템을 연동해 통증과 붓기를 최소화합니다. " +
        "모든 장비는 주기적 유지보수와 실사용 로그를 통해 성능이 관리됩니다.",
    },
    {
      title: "프라이빗 케어룸",
      media: careroom_vid,
      long:
        "시술 직후 케어와 진정이 이뤄지는 공간입니다. 조도와 온습도를 미세 조절해 회복에 최적화된 환경을 제공합니다. " +
        "민감 반응을 줄이는 쿨링·보습 케어와 광선 테라피가 필요에 따라 적용되며, 개인별 홈케어 루틴을 안내해 회복 속도를 높입니다. " +
        "퇴실 전에는 다음 방문 일정과 주의사항을 알림톡으로 자동 전송하여 사후 관리의 완성도를 높입니다.",
    },
  ] as const;

  return (
    <section ref={sectionRef} className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-bold text-primary mb-4">최첨단 시설</h3>
          <p className="text-lg text-muted-foreground">안전하고 쾌적한 환경에서 제공하는 프리미엄 의료 서비스</p>
        </div>

        {/* 섹션 단위로 렌더링 */}
        <div className="space-y-16">
          {sections.map((s, idx) => (
            <article
              key={idx}
              data-observe
              className="opacity-0 transition-opacity duration-700"
            >
              <h4 className="text-2xl md:text-3xl font-semibold mb-6">{s.title}</h4>

              <Card className="bg-card rounded-2xl shadow-sm overflow-hidden">
                {String(s.media).toLowerCase().endsWith(".mp4") ? (
                  <video className="w-full h-[260px] md:h-[360px] object-cover" autoPlay loop muted playsInline preload="metadata">
                    <source src={s.media as any} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    src={s.media as any}
                    alt={s.title}
                    className="w-full h-[260px] md:h-[360px] object-cover"
                    loading="lazy"
                  />
                )}
                <CardContent className="p-6 md:p-8">
                  <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
                    {s.long}
                  </p>
                </CardContent>
              </Card>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
