import React, { useEffect, useRef, useState } from "react";

type NaverMapProps = {
  width?: string | number;
  height?: string | number;
  className?: string;
  /** fallback 초기 중심 */
  center?: { lat: number; lng: number };
  /** 초깃값 줌 */
  zoom?: number;
  /** 주소로 지오코딩해서 센터/마커/라벨 표시 */
  address?: string;
  addressLabel?: string;
};

declare global {
  interface Window {
    naver?: any;
    __naverMapsLoader?: Promise<void>;
    __naverMapsLoaderResolvers?: Array<() => void>;
  }
}

export function NaverMap({
  width = "100%",
  height = 360,
  className = "",
  center = { lat: 37.5140, lng: 127.1000 },
  zoom = 16,
  address,
  addressLabel,
}: NaverMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1) 스크립트 로딩 (중복 로딩 방지 + Promise 큐)
  useEffect(() => {
    let cancelled = false;

    async function ensureScript() {
      if (typeof window === "undefined") return;
      if (window.naver?.maps) {
        setIsLoaded(true);
        return;
      }
      if (!window.__naverMapsLoader) {
        window.__naverMapsLoaderResolvers = [];
        window.__naverMapsLoader = new Promise<void>((resolve) => {
          window.__naverMapsLoaderResolvers!.push(resolve);
        });
        const script = document.createElement("script");
        script.id = "naver-maps-api-script";
        // NOTE: ncpKeyId는 건드리지 않습니다.
        script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${import.meta.env.VITE_NAVER_MAPS_KEY}&submodules=geocoder&callback=initNaverMap`;
        script.async = true;
        (window as any).initNaverMap = () => {
          const resolvers = window.__naverMapsLoaderResolvers || [];
          resolvers.forEach((r) => r());
          window.__naverMapsLoaderResolvers = [];
        };
        script.onerror = () => setLoadError("네이버 지도 스크립트 로딩 실패");
        document.head.appendChild(script);
      }
      try {
        await window.__naverMapsLoader;
        if (!cancelled) setIsLoaded(true);
      } catch (e: any) {
        if (!cancelled) setLoadError(e?.message || "지도 로딩 실패");
      }
    }

    ensureScript();
    return () => {
      cancelled = true;
    };
  }, []);

  // 2) 지도 인스턴스 초기화 (항상 한 번만)
  useEffect(() => {
    if (!isLoaded || mapRef.current || !containerRef.current) return;
    const { naver } = window as any;
    if (!naver?.maps) return;

    const map = new naver.maps.Map(containerRef.current, {
      center: new naver.maps.LatLng(center.lat, center.lng),
      zoom,
    });
    mapRef.current = map;

    // 초깃값 마커(주소가 없을 때만)
    if (!address) {
      markerRef.current = new naver.maps.Marker({
        position: new naver.maps.LatLng(center.lat, center.lng),
        map,
      });
      if (addressLabel) {
        const iw = new naver.maps.InfoWindow({
          content: `<div style="padding:8px 10px;border:1px solid rgba(0,0,0,0.15);border-radius:10px;background:#fff;font-weight:600;">${addressLabel}</div>`,
        });
        iw.open(map, markerRef.current);
      }
    }
  }, [isLoaded, center.lat, center.lng, zoom, address, addressLabel]);

  // 3) 주소가 있으면 지오코딩 → 센터/마커/라벨
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !address) return;
    const { naver } = window as any;
    const maps = naver?.maps;
    if (!maps) return;

    // 기존 마커 제거
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }

    // 알려진 주소 수동 좌표 (지오코더 500 회피)
    const known: Record<string, { lat: number; lng: number; label?: string }> = {
      "서울 송파구 올림픽로 102": { lat: 37.5140, lng: 127.1000, label: "올림픽로 102" },
      "서울특별시 송파구 올림픽로 102": { lat: 37.5140, lng: 127.1000, label: "올림픽로 102" },
    };
    if (known[address]) {
      const { lat, lng, label } = known[address];
      const ll = new maps.LatLng(lat, lng);
      mapRef.current.setCenter(ll);
      markerRef.current = new maps.Marker({ position: ll, map: mapRef.current });
      const iw = new maps.InfoWindow({
        content: `<div style="padding:8px 10px;border:1px solid rgba(0,0,0,0.15);border-radius:10px;background:#fff;font-weight:600;">${addressLabel || label || address}</div>`,
      });
      iw.open(mapRef.current, markerRef.current);
      return;
    }

    // 정식 지오코더
    try {
      if (!maps.Service || !maps.Service.geocode) {
        // 지오코더 미로딩 → 폴백: 기존 center에 마커만 찍기
        markerRef.current = new maps.Marker({
          position: new maps.LatLng(center.lat, center.lng),
          map: mapRef.current,
        });
        return;
      }

      maps.Service.geocode({ query: address }, (status: any, response: any) => {
        try {
          if (status !== maps.Service.Status.OK) {
            console.warn("Geocode failed:", status, "— using fallback center.");
            markerRef.current = new maps.Marker({
              position: new maps.LatLng(center.lat, center.lng),
              map: mapRef.current,
            });
            return;
          }
          const item = response?.v2?.addresses?.[0];
          if (!item) {
            console.warn("No geocode result — using fallback center.");
            markerRef.current = new maps.Marker({
              position: new maps.LatLng(center.lat, center.lng),
              map: mapRef.current,
            });
            return;
          }
          const lat = parseFloat(item.y);
          const lng = parseFloat(item.x);
          const ll = new maps.LatLng(lat, lng);
          mapRef.current.setCenter(ll);
          markerRef.current = new maps.Marker({ position: ll, map: mapRef.current });
          const iw = new maps.InfoWindow({
            content: `<div style="padding:8px 10px;border:1px solid rgba(0,0,0,0.15);border-radius:10px;background:#fff;font-weight:600;">${addressLabel || address}</div>`,
          });
          iw.open(mapRef.current, markerRef.current);
        } catch (err) {
          console.warn("Geocode callback error:", err);
          markerRef.current = new maps.Marker({
            position: new maps.LatLng(center.lat, center.lng),
            map: mapRef.current,
          });
        }
      });
    } catch (e) {
      console.warn("Geocode error:", e);
      markerRef.current = new maps.Marker({
        position: new maps.LatLng(center.lat, center.lng),
        map: mapRef.current,
      });
    }
  }, [isLoaded, address, addressLabel, center.lat, center.lng]);

  if (loadError) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 ${className}`} style={{ width, height }}>
        <p className="text-sm text-red-600">{loadError}</p>
      </div>
    );
  }

  return <div ref={containerRef} className={className} style={{ width, height }} />;
}

export default NaverMap;
