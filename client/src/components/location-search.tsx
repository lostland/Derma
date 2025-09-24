import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Search, X } from "lucide-react";

export interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
}

interface LocationSearchProps {
  value?: LocationData | null;
  onChange: (location: LocationData | null) => void;
  placeholder?: string;
  className?: string;
}

interface SearchResult {
  roadAddress: string;
  jibunAddress: string;
  x: string; // longitude
  y: string; // latitude
}

export function LocationSearch({
  value,
  onChange,
  placeholder = "주소를 검색하거나 지도에서 위치를 선택하세요",
  className = ""
}: LocationSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // Initialize map when showMap becomes true
  useEffect(() => {
    if (showMap && mapRef.current && !mapInstanceRef.current) {
      initializeMap();
    }
  }, [showMap]);

  const initializeMap = async () => {
    try {
      // Check if Naver Maps is already loaded
      if (!window.naver || !window.naver.maps) {
        // Load Naver Maps API
        const response = await fetch('/api/naver/client-id');
        const data = await response.json();
        
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${data.clientId}`;
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Naver Maps'));
          document.head.appendChild(script);
        });
      }

      if (!mapRef.current || !window.naver?.maps) return;

      const mapOptions = {
        center: value 
          ? new window.naver.maps.LatLng(value.latitude, value.longitude)
          : new window.naver.maps.LatLng(37.5665, 126.9780), // Default to Seoul
        zoom: 15,
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

      // Add existing marker if location is selected
      if (value) {
        addMarker(value.latitude, value.longitude, value.address);
      }

      // Add click listener to map
      window.naver.maps.Event.addListener(map, 'click', async (e: any) => {
        const lat = e.coord.y;
        const lng = e.coord.x;
        
        try {
          // Reverse geocode to get address
          const response = await fetch(`/api/naver/reverse-geocode?coords=${lng},${lat}`);
          const data = await response.json();
          
          let address = '';
          if (data.results && data.results.length > 0) {
            const result = data.results[0];
            address = result.region?.area1?.name + ' ' + 
                     result.region?.area2?.name + ' ' + 
                     result.region?.area3?.name + ' ' + 
                     (result.land?.number1 || '');
            address = address.trim();
          }

          if (!address) {
            address = `위도: ${lat.toFixed(6)}, 경도: ${lng.toFixed(6)}`;
          }

          const locationData: LocationData = {
            address,
            latitude: lat,
            longitude: lng
          };

          onChange(locationData);
          addMarker(lat, lng, address);
        } catch (error) {
          console.error('Error reverse geocoding:', error);
          // Still allow selection with coordinates
          const locationData: LocationData = {
            address: `위도: ${lat.toFixed(6)}, 경도: ${lng.toFixed(6)}`,
            latitude: lat,
            longitude: lng
          };
          onChange(locationData);
          addMarker(lat, lng, locationData.address);
        }
      });

      setMapError(null);
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('지도를 불러오는데 실패했습니다.');
    }
  };

  const addMarker = (lat: number, lng: number, title: string) => {
    if (!mapInstanceRef.current || !window.naver?.maps) return;

    // Clear existing markers
    mapInstanceRef.current.markers?.forEach((marker: any) => marker.setMap(null));

    const marker = new window.naver.maps.Marker({
      position: new window.naver.maps.LatLng(lat, lng),
      map: mapInstanceRef.current,
      title: title
    });

    // Store marker reference
    if (!mapInstanceRef.current.markers) {
      mapInstanceRef.current.markers = [];
    }
    mapInstanceRef.current.markers = [marker];

    // Center map on marker
    mapInstanceRef.current.setCenter(new window.naver.maps.LatLng(lat, lng));
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`/api/naver/geocoding?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (data.addresses && data.addresses.length > 0) {
        setSearchResults(data.addresses);
        setShowResults(true);
      } else {
        setSearchResults([]);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error searching location:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    const locationData: LocationData = {
      address: result.roadAddress || result.jibunAddress,
      latitude: parseFloat(result.y),
      longitude: parseFloat(result.x)
    };

    onChange(locationData);
    setShowResults(false);
    setSearchQuery("");

    // If map is open, add marker
    if (showMap && mapInstanceRef.current) {
      addMarker(locationData.latitude, locationData.longitude, locationData.address);
    }
  };

  const clearLocation = () => {
    onChange(null);
    setSearchQuery("");
    if (mapInstanceRef.current?.markers) {
      mapInstanceRef.current.markers.forEach((marker: any) => marker.setMap(null));
      mapInstanceRef.current.markers = [];
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            data-testid="input-location-search"
          />
          {showResults && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-8 w-8 p-0"
              onClick={() => setShowResults(false)}
              data-testid="button-close-search-results"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={isSearching || !searchQuery.trim()}
          data-testid="button-search-location"
        >
          <Search className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setShowMap(!showMap)}
          data-testid="button-toggle-map"
        >
          <MapPin className="h-4 w-4" />
        </Button>
      </div>

      {/* Search Results */}
      {showResults && (
        <Card data-testid="card-search-results">
          <CardContent className="p-3">
            {searchResults.length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">검색 결과</h4>
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="p-2 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => handleSelectResult(result)}
                    data-testid={`result-location-${index}`}
                  >
                    <div className="text-sm font-medium">
                      {result.roadAddress || result.jibunAddress}
                    </div>
                    {result.roadAddress && result.jibunAddress && result.roadAddress !== result.jibunAddress && (
                      <div className="text-xs text-gray-500">
                        {result.jibunAddress}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500" data-testid="text-no-results">
                검색 결과가 없습니다.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Selected Location Display */}
      {value && (
        <Card data-testid="card-selected-location">
          <CardContent className="p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium mb-1">선택된 위치</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300" data-testid="text-selected-address">
                  {value.address}
                </p>
                <p className="text-xs text-gray-500 mt-1" data-testid="text-selected-coordinates">
                  위도: {value.latitude.toFixed(6)}, 경도: {value.longitude.toFixed(6)}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearLocation}
                data-testid="button-clear-location"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map */}
      {showMap && (
        <Card data-testid="card-location-map">
          <CardContent className="p-3">
            <div className="mb-2">
              <h4 className="text-sm font-medium">지도에서 위치 선택</h4>
              <p className="text-xs text-gray-500">지도를 클릭하여 위치를 선택하세요</p>
            </div>
            {mapError ? (
              <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded" data-testid="text-map-error">
                <p className="text-sm text-gray-500">{mapError}</p>
              </div>
            ) : (
              <div 
                ref={mapRef} 
                className="h-64 w-full rounded border"
                data-testid="div-location-map"
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}