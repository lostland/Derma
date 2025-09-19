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

  useEffect(() => {
    const loadNaverMaps = () => {
      // Check if Naver Maps is already loaded
      if (window.naver && window.naver.maps) {
        setIsLoaded(true);
        initializeMap();
        return () => {}; // No cleanup needed if API already loaded
      }

      // Set up global callback
      window.initNaverMap = () => {
        setIsLoaded(true);
        initializeMap();
      };

      // Get client ID from backend and load Naver Maps API
      fetch('/api/naver/client-id')
        .then(res => res.json())
        .then(data => {
          const script = document.createElement('script');
          script.id = 'naver-maps-api-script';
          script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${data.clientId}&callback=initNaverMap`;
          script.async = true;
          script.onerror = () => {
            setLoadError("지도를 불러오는데 실패했습니다.");
          };
          document.head.appendChild(script);
        })
        .catch(() => {
          setLoadError("지도 API 설정을 불러오는데 실패했습니다.");
        });

      return () => {
        // Cleanup
        const existingScript = document.getElementById('naver-maps-api-script');
        if (existingScript) {
          document.head.removeChild(existingScript);
        }
        if (window.initNaverMap) {
          delete window.initNaverMap;
        }
      };
    };

    const initializeMap = () => {
      if (!mapRef.current || !window.naver?.maps) return;

      try {
        // Clean up existing map and markers
        cleanupMarkersAndListeners();

        const mapOptions = {
          center: new window.naver.maps.LatLng(center.lat, center.lng),
          zoom: zoom,
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: window.naver.maps.MapTypeControlStyle.BUTTON,
            position: window.naver.maps.Position.TOP_RIGHT
          },
          zoomControl: true,
          zoomControlOptions: {
            style: window.naver.maps.ZoomControlStyle.SMALL,
            position: window.naver.maps.Position.TOP_LEFT
          }
        };

        const map = new window.naver.maps.Map(mapRef.current, mapOptions);
        mapInstanceRef.current = map;

        // Add markers
        const newMarkers: any[] = [];
        markers.forEach((markerData) => {
          const marker = new window.naver.maps.Marker({
            position: new window.naver.maps.LatLng(markerData.lat, markerData.lng),
            map: map,
            title: markerData.title || ""
          });

          // Add info window if content is provided (sanitized)
          if (markerData.content) {
            // Basic XSS protection: remove script tags and escape HTML
            const sanitizedContent = markerData.content
              .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#x27;');

            const infoWindow = new window.naver.maps.InfoWindow({
              content: `<div style="padding: 10px; font-size: 14px;">${sanitizedContent}</div>`
            });

            const listener = window.naver.maps.Event.addListener(marker, 'click', () => {
              if (infoWindow.getMap()) {
                infoWindow.close();
              } else {
                infoWindow.open(map, marker);
              }
            });

            newMarkers.push({ marker, infoWindow, listener });
          } else {
            newMarkers.push({ marker, infoWindow: null, listener: null });
          }
        });

        markersRef.current = newMarkers;
        setLoadError(null);
      } catch (error) {
        console.error("Error initializing Naver Map:", error);
        setLoadError("지도 초기화에 실패했습니다.");
      }
    };

    const cleanupMarkersAndListeners = () => {
      markersRef.current.forEach(({ marker, listener }) => {
        if (listener) {
          window.naver.maps.Event.removeListener(listener);
        }
        if (marker) {
          marker.setMap(null);
        }
      });
      markersRef.current = [];
    };

    return loadNaverMaps();
  }, [center.lat, center.lng, zoom, markers]);

  // Update map center/zoom without recreating the entire map
  useEffect(() => {
    if (mapInstanceRef.current && isLoaded) {
      mapInstanceRef.current.setCenter(new window.naver.maps.LatLng(center.lat, center.lng));
      mapInstanceRef.current.setZoom(zoom);
    }
  }, [center.lat, center.lng, zoom, isLoaded]);

  if (loadError) {
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