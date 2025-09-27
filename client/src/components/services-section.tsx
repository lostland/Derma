import { Card, CardContent } from "@/components/ui/card";
import { VideoWithPreview } from "@/components/video-with-preview";
import { useEffect, useMemo, useRef, useState } from "react";
import lift_img from "@assets/lift.mp4";
import anti_img from "@assets/anti.mp4";
import re_img from "@assets/re.mp4";

export function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const startXRef = useRef<number | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const [displayIndex, setDisplayIndex] = useState(1);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);

  const services = useMemo(
    () => [
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
    ],
    []
  );

  const serviceCount = services.length;

  const goToNext = () => {
    if (serviceCount === 0) return;
    setDisplayIndex((prev) => Math.min(prev + 1, serviceCount + 1));
  };

  const goToPrev = () => {
    if (serviceCount === 0) return;
    setDisplayIndex((prev) => Math.max(prev - 1, 0));
  };

  const handlePointerDown = (clientX: number) => {
    startXRef.current = clientX;
  };

  const handlePointerUp = (clientX: number) => {
    if (startXRef.current === null) return;

    const deltaX = clientX - startXRef.current;
    const threshold = 50;

    if (deltaX <= -threshold) {
      goToNext();
    } else if (deltaX >= threshold) {
      goToPrev();
    } else {
      const midpoint = (containerRef.current?.offsetWidth ?? window.innerWidth) / 2;
      if (clientX > midpoint) {
        goToNext();
      } else {
        goToPrev();
      }
    }

    startXRef.current = null;
  };

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

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

  const cardWidth = useMemo(() => {
    if (containerWidth === 0) return 0;
    return containerWidth * 0.78;
  }, [containerWidth]);

  const gap = useMemo(() => {
    if (containerWidth === 0) return 0;
    return containerWidth * 0.02;
  }, [containerWidth]);

  const sidePadding = useMemo(() => {
    if (containerWidth === 0 || cardWidth === 0) return 0;
    return (containerWidth - cardWidth) / 2;
  }, [cardWidth, containerWidth]);

  const previewOffset = useMemo(() => {
    if (containerWidth === 0) return 0;
    const desiredPreview = containerWidth * 0.08;
    if (sidePadding === 0) return desiredPreview;
    return Math.min(desiredPreview, sidePadding);
  }, [containerWidth, sidePadding]);

  const extendedServices = useMemo(() => {
    if (serviceCount === 0) return [] as typeof services;
    const first = services[0];
    const last = services[serviceCount - 1];
    return [last, ...services, first];
  }, [serviceCount, services]);

  useEffect(() => {
    setDisplayIndex(serviceCount ? 1 : 0);
  }, [serviceCount]);

  useEffect(() => {
    if (!isTransitionEnabled) {
      const id = requestAnimationFrame(() => {
        setIsTransitionEnabled(true);
      });
      return () => cancelAnimationFrame(id);
    }
  }, [isTransitionEnabled]);

  const handleTransitionEnd = () => {
    if (!serviceCount) return;
    if (displayIndex === 0) {
      setIsTransitionEnabled(false);
      setDisplayIndex(serviceCount);
      return;
    }
    if (displayIndex === serviceCount + 1) {
      setIsTransitionEnabled(false);
      setDisplayIndex(1);
    }
  };

  const previewDistance = useMemo(() => {
    if (!serviceCount || previewOffset === 0) return 0;

    const isClonePosition =
      displayIndex === 0 || displayIndex === serviceCount + 1;

    return isClonePosition ? previewOffset : 0;
  }, [displayIndex, previewOffset, serviceCount]);

  const translateX = useMemo(() => {
    if (cardWidth === 0) return 0;
    const baseDistance = cardWidth + gap;
    return -(displayIndex * baseDistance + previewDistance);
  }, [cardWidth, displayIndex, gap, previewDistance]);

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-secondary"
      data-testid="section-services"
    >
      <div className="mx-auto w-full px-0">
        <div
          ref={containerRef}
          className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden pb-6"
          style={{ touchAction: "pan-y" }}
          onPointerDown={(event) => {
            pointerIdRef.current = event.pointerId;
            event.currentTarget.setPointerCapture(event.pointerId);
            handlePointerDown(event.clientX);
          }}
          onPointerUp={(event) => {
            if (pointerIdRef.current !== null) {
              event.currentTarget.releasePointerCapture(pointerIdRef.current);
              pointerIdRef.current = null;
            }
            handlePointerUp(event.clientX);
          }}
          onPointerCancel={(event) => {
            if (pointerIdRef.current !== null) {
              event.currentTarget.releasePointerCapture(pointerIdRef.current);
              pointerIdRef.current = null;
            }
            startXRef.current = null;
          }}
          onPointerLeave={() => {
            if (pointerIdRef.current === null) {
              startXRef.current = null;
            }
          }}
        >
          <div
            className="flex transition-transform ease-out"
            style={{
              transform: `translateX(${translateX}px)`,
              gap: gap ? `${gap}px` : undefined,
              padding: sidePadding ? `0 ${sidePadding}px` : undefined,
              transitionDuration: isTransitionEnabled ? "500ms" : "0ms",
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {extendedServices.map((service, index) => {
              const isClone =
                serviceCount > 0 &&
                (index === 0 || index === extendedServices.length - 1);
              const actualIndex =
                serviceCount === 0
                  ? 0
                  : index === 0
                    ? serviceCount - 1
                    : index === extendedServices.length - 1
                      ? 0
                      : index - 1;

              return (
                <Card
                  key={`${service.title}-${index}`}
                  className="flex flex-shrink-0 flex-col overflow-hidden rounded-none border-none bg-transparent shadow-none backdrop-blur-0 animate-fade-in"
                  style={{ width: cardWidth ? `${cardWidth}px` : "78vw" }}
                  data-testid={
                    !isClone ? `card-service-${actualIndex}` : undefined
                  }
                >
                  <div className="relative w-full overflow-hidden aspect-video">
                    {String(service.media).toLowerCase().endsWith(".mp4") ? (
                      <VideoWithPreview
                        src={service.media as string}
                        className="block h-full w-full object-cover"
                        preload="auto"
                      />
                    ) : (
                      <img
                        src={service.media as any}
                        alt={service.title}
                        className="block h-full w-full object-cover"
                      />
                    )}
                    </div>
                    <CardContent className="px-6 py-6">
                      <h4 className="mb-4 text-center text-xl font-bold">{service.title}</h4>
                      <p className="text-muted-foreground">{service.description}</p>
                    </CardContent>
                  </Card>
                );
            })}
          </div>
          <button
            type="button"
            className="pointer-events-auto absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-2xl text-white transition hover:bg-black/60"
            aria-label="이전 서비스"
            onPointerDown={(event) => {
              event.stopPropagation();
            }}
            onPointerUp={(event) => {
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.stopPropagation();
              goToPrev();
            }}
          >
            &lt;
          </button>
          <button
            type="button"
            className="pointer-events-auto absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-2xl text-white transition hover:bg-black/60"
            aria-label="다음 서비스"
            onPointerDown={(event) => {
              event.stopPropagation();
            }}
            onPointerUp={(event) => {
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.stopPropagation();
              goToNext();
            }}
          >
            &gt;
          </button>
        </div>
      </div>
    </section>
  );
}
