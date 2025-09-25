import { useEffect, useRef, useState } from "react";

// Declare naver global for TypeScript
declare global {
  interface Window {
    naver: any;
    initNaverMap?: () => void;
  }
}

interface NaverMapProps {
  width?: string;
  height?: string;
  center?: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  markers?: Array<{
    lat: number;
    lng: number;
    title?: string;
    content?: string;
  }>;
  className?: string;
  [key: string]: any; // Allow additional props like data-testid
}

export function NaverMap({
  width = "100%",
  height = "400px",
  center = { lat: 37.5137, lng: 127.0982 }, // Default to Seoul coordinates
  zoom = 15,
  markers = [],
  className = "",
  ...rest
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  console.log('NaverMap: Rendering...');

  useEffect(() => {
    (window as any).navermap_authFailure = () => {
      console.error('[NAVER] auth failure');
      setLoadError('지도 인증에 실패했습니다. 키/도메인 설정을 확인해 주세요.');
    };
  }, []);

  // 1) 스크립트 '한 번만' 로드
  useEffect(() => {
    if (window.naver?.maps) {
      console.log('NaverMap: Already loaded!');
      setIsLoaded(true);
      return;
    }
    console.log('1--------------------');

    (window as any).initNaverMap = () => setIsLoaded(true);

    // 이미 붙어있으면 재첨부 방지
    //if (document.getElementById('naver-maps-api-script')) return;

    fetch('/api/naver/client-id')
      .then(r => r.json())
      .then(data => {
        if (!data?.clientId) throw new Error('Missing clientId');
        const script = document.createElement('script');
        script.id = 'naver-maps-api-script';
        script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${data.clientId}&callback=initNaverMap`;
        script.async = true;
        script.onerror = () => setLoadError('지도를 불러오는데 실패했습니다.');

        console.log('[NAVER] origin=', window.location.origin);
        console.log('[NAVER] referrer(meta)=', document.referrer);
        console.log('[NAVER] src=', script.src);

        document.head.appendChild(script);
      })
      .catch(() => setLoadError('지도 API 설정을 불러오는데 실패했습니다.'));

    return () => {
      delete (window as any).initNaverMap;
      // 스크립트는 보통 유지. 필요 시에만 제거
      // const s = document.getElementById('naver-maps-api-script');
      // if (s) s.remove();
    };
  }, []);

  // 2) 지도 초기화 (isLoaded가 true가 된 뒤 한 번)
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.naver?.maps) 
    {
      console.log('2-1--------------------');
      return;
    }
    console.log('2--------------------');

    try {
      console.log('NaverMap: Initializing map...');
      console.log('NaverMap: mapRef.current=', mapRef.current);

      const map = new window.naver.maps.Map(mapRef.current, {
        center: new window.naver.maps.LatLng(center.lat, center.lng),
        zoom,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: window.naver.maps.MapTypeControlStyle.BUTTON,
          position: window.naver.maps.Position.TOP_RIGHT,
        },
        zoomControl: true,
        zoomControlOptions: {
          style: window.naver.maps.ZoomControlStyle.SMALL,
          position: window.naver.maps.Position.TOP_LEFT,
        },
      });

      console.log('NaverMap: Map initialized!');

      mapInstanceRef.current = map;
      setLoadError(null);
    } catch {
      setLoadError('지도 초기화에 실패했습니다.');
    }

  }, [isLoaded]);

  // 3) 중심/줌 업데이트
  useEffect(() => {
    if (!mapInstanceRef.current || !window.naver?.maps) 
    {
      console.log('3-1--------------------');
      return;
    }
    console.log('3--------------------');

    console.log('NaverMap: Updating center/zoom...');
    mapInstanceRef.current.setCenter(
      new window.naver.maps.LatLng(center.lat, center.lng)
    );
    mapInstanceRef.current.setZoom(zoom);
    console.log('NaverMap: Center/zoom updated!');
  }, [center.lat, center.lng, zoom]);

  // 4) 마커 업데이트
  useEffect(() => {
    if (!mapInstanceRef.current || !window.naver?.maps) 
    {
      console.log('4-1--------------------');
      return;
    }
    console.log('4--------------------');

    // 기존 마커 정리
    console.log('NaverMap: Updating markers...');
    markersRef.current.forEach(({ marker, listener }) => {
      if (listener) window.naver.maps.Event.removeListener(listener);
      if (marker) marker.setMap(null);
    });
    markersRef.current = [];

    const arr: any[] = [];
    markers.forEach(m => {
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(m.lat, m.lng),
        map: mapInstanceRef.current,
        title: m.title || '',
      });

       console.log('NaverMap: Marker created!', marker)
      // (infoWindow 처리 필요 시 여기서)
      arr.push({ marker, listener: null });
    });
    markersRef.current = arr;
  }, [markers]);

  if (loadError) {
    console.error('NaverMap: Error loading map:', loadError);
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={{ width, height }}
        data-testid="map-error"
      >
        <div className="text-center">
          <p className="text-red-500 mb-2">🗺️</p>
          <p className="text-sm text-gray-600">{loadError}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    console.log('NaverMap: Loading...');
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={{ width, height }}
        data-testid="map-loading"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">지도 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className={className}
      style={{ width, height }}
      {...rest}
    />
  );
}