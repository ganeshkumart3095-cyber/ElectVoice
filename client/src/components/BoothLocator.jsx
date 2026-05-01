import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Navigation, List, Search, Loader2 } from 'lucide-react';
import { fetchPollingBooths } from '../services/searchService';
import { loadGoogleMapsScript, getUserLocation } from '../services/mapsService';
import { MAP_CONFIG } from '../constants';
import BoothListItem from './booths/BoothListItem';

/**
 * BoothLocator — Interactive Google Maps integration for locating polling booths.
 * Orchestrates map rendering, booth searching, and geolocation.
 * @returns {JSX.Element}
 */
export default function BoothLocator() {
  const [booths, setBooths] = useState([]);
  const [selectedBooth, setSelectedBooth] = useState(null);
  const [isLoadingBooths, setIsLoadingBooths] = useState(false);
  const [isLoadingMap, setIsLoadingMap] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [boothError, setBoothError] = useState(null);
  const [constituencyInput, setConstituencyInput] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeView, setActiveView] = useState('split');

  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const searchInputRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);

  /**
   * Places markers on the map for each booth in the list.
   * @param {Array} boothList - List of booth objects
   */
  const placeMarkers = useCallback((boothList) => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    boothList.forEach((booth) => {
      const pinElement = new window.google.maps.marker.PinElement({
        background: '#FF9933',
        borderColor: '#ffffff',
        glyphColor: '#ffffff',
        scale: 0.8,
      });

      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        position: { lat: booth.lat, lng: booth.lng },
        map: googleMapRef.current,
        title: booth.name,
        content: pinElement.element,
      });

      marker.addListener('click', () => {
        setSelectedBooth(booth);
        infoWindowRef.current.setContent(buildInfoWindowContent(booth));
        infoWindowRef.current.open(googleMapRef.current, marker);
      });

      markersRef.current.push(marker);
    });

    if (boothList.length > 0 && googleMapRef.current) {
      const bounds = new window.google.maps.LatLngBounds();
      boothList.forEach((b) => bounds.extend({ lat: b.lat, lng: b.lng }));
      googleMapRef.current.fitBounds(bounds, 60);
    }
  }, []);

  /**
   * Fetches booths based on coordinates and updates the map.
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   */
  const loadBoothsByLocation = useCallback(async (lat, lng) => {
    setIsLoadingBooths(true);
    setBoothError(null);
    try {
      const fetchedBooths = await fetchPollingBooths({ lat, lng });
      setBooths(fetchedBooths);
      if (googleMapRef.current) {
        placeMarkers(fetchedBooths);
      }
    } catch {
      setBoothError('Failed to load booths. Please try again.');
    } finally {
      setIsLoadingBooths(false);
    }
  }, [placeMarkers]);

  // Map Initialization Effect
  useEffect(() => {
    setIsLoadingMap(true);
    loadGoogleMapsScript()
      .then(() => {
        setMapLoaded(true);
        setIsLoadingMap(false);
        initAutocomplete();
      })
      .catch((err) => {
        setMapError(err.message);
        setIsLoadingMap(false);
        loadBoothsByLocation(MAP_CONFIG.DELHI_CENTER.lat, MAP_CONFIG.DELHI_CENTER.lng);
      });
  }, [loadBoothsByLocation]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    googleMapRef.current = new window.google.maps.Map(mapRef.current, {
      center: MAP_CONFIG.DELHI_CENTER,
      zoom: MAP_CONFIG.DEFAULT_ZOOM,
      mapId: 'DEMO_MAP_ID',
      styles: MAP_CONFIG.DARK_STYLES,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });

    infoWindowRef.current = new window.google.maps.InfoWindow();
    loadBoothsByLocation(MAP_CONFIG.DELHI_CENTER.lat, MAP_CONFIG.DELHI_CENTER.lng);
  }, [mapLoaded, loadBoothsByLocation]);

  /**
   * Initializes Google Places Autocomplete for the search input.
   */
  const initAutocomplete = () => {
    if (searchInputRef.current && window.google) {
      const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
        types: ['(regions)'],
        componentRestrictions: { country: 'in' },
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          setConstituencyInput(place.formatted_address);
          handleMapSearch(place.geometry.location.lat(), place.geometry.location.lng());
        }
      });
    }
  };

  const handleMapSearch = async (lat, lng) => {
    if (googleMapRef.current) {
      googleMapRef.current.setCenter({ lat, lng });
      googleMapRef.current.setZoom(MAP_CONFIG.SEARCH_ZOOM);
    }
    await loadBoothsByLocation(lat, lng);
  };

  const handleUseMyLocation = async () => {
    try {
      setIsLoadingBooths(true);
      const { lat, lng } = await getUserLocation();
      await handleMapSearch(lat, lng);
    } catch {
      setBoothError('Location access denied. Please search by constituency name.');
      setIsLoadingBooths(false);
    }
  };

  const handleConstituencySearch = async (e) => {
    e.preventDefault();
    if (!constituencyInput.trim()) return;
    setIsLoadingBooths(true);
    setBoothError(null);
    try {
      const fetchedBooths = await fetchPollingBooths({ constituency: constituencyInput });
      setBooths(fetchedBooths);
      if (googleMapRef.current && fetchedBooths.length > 0) {
        placeMarkers(fetchedBooths);
      }
    } catch {
      setBoothError('Failed to search booths. Please try again.');
    } finally {
      setIsLoadingBooths(false);
    }
  };

  return (
    <div className="space-y-4">
      <header className="text-center">
        <h2 className="font-display font-bold text-2xl text-gradient-saffron mb-1">Polling Booth Locator</h2>
        <p className="text-sm text-gray-500">Find your nearest polling booth in India</p>
      </header>

      <section className="flex flex-col sm:flex-row gap-3 items-stretch">
        <button onClick={handleUseMyLocation} disabled={isLoadingBooths} className="loc-btn">
          <Navigation size={15} /> Use My Location
        </button>

        <form onSubmit={handleConstituencySearch} className="flex gap-2 flex-1 h-[42px]">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              ref={searchInputRef}
              type="text"
              value={constituencyInput}
              onChange={(e) => setConstituencyInput(e.target.value)}
              placeholder="Search by constituency..."
              className="search-input"
            />
          </div>
          <button type="submit" disabled={isLoadingBooths} className="search-btn">Search</button>
        </form>

        <ViewToggles activeView={activeView} onChange={setActiveView} />
      </section>

      {(boothError || mapError) && <ErrorMessage mapError={mapError} boothError={boothError} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[450px]">
        {(activeView === 'split' || activeView === 'map') && (
          <div className={`map-container ${activeView === 'map' ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
            {isLoadingMap && <LoaderOverlay />}
            {mapError && <MapFallback />}
            <div ref={mapRef} className="w-full h-full min-h-[400px]" />
          </div>
        )}

        {(activeView === 'split' || activeView === 'list') && (
          <div className={`list-sidebar ${activeView === 'list' ? 'lg:col-span-3' : 'lg:col-span-1'}`}>
            <SidebarHeader count={booths.length} />
            <div className="flex-1 overflow-y-auto">
              <BoothList 
                booths={booths} 
                isLoading={isLoadingBooths} 
                selectedId={selectedBooth?.id} 
                onSelect={(b) => {
                  setSelectedBooth(b);
                  if (googleMapRef.current) {
                    googleMapRef.current.setCenter({ lat: b.lat, lng: b.lng });
                    googleMapRef.current.setZoom(MAP_CONFIG.DETAIL_ZOOM);
                  }
                }} 
              />
            </div>
          </div>
        )}
      </div>
      <Disclaimer />
    </div>
  );
}

/**
 * Builds HTML content for the map info window.
 */
function buildInfoWindowContent(booth) {
  return `
    <div class="info-window">
      <h3>${booth.name}</h3>
      <p>📍 ${booth.address}</p>
      <p>🗳️ Booth No: ${booth.boothNo}</p>
      <p>⏰ ${booth.timings}</p>
      <a href="https://www.google.com/maps/dir/?api=1&destination=${booth.lat},${booth.lng}" target="_blank">Get Directions →</a>
    </div>
  `;
}

// Sub-components for better organization
const LoaderOverlay = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
    <Loader2 size={28} className="animate-spin text-saffron" />
    <p className="text-sm text-gray-500">Loading Google Maps...</p>
  </div>
);

const MapFallback = () => (
  <div className="absolute inset-0 m-6 flex flex-col items-center justify-center gap-3 glass-card">
    <MapPin size={48} className="opacity-40 text-saffron" />
    <h3 className="text-lg font-semibold text-white">Map unavailable</h3>
    <p className="text-sm text-center text-gray-500">Google Maps requires a valid API key.</p>
  </div>
);

const SidebarHeader = ({ count }) => (
  <div className="px-4 py-3 flex items-center gap-2 border-b border-white/10">
    <List size={15} className="text-saffron" />
    <span className="font-semibold text-sm text-white">
      Nearby Booths {count > 0 && <span className="badge ml-1">{count}</span>}
    </span>
  </div>
);

const BoothList = ({ booths, isLoading, selectedId, onSelect }) => {
  if (isLoading) return <div className="p-4 space-y-3">Loading booths...</div>;
  if (booths.length === 0) return <div className="p-8 text-center text-gray-500">No booths found. Search to begin.</div>;
  return (
    <div className="divide-y divide-white/5">
      {booths.map((booth) => (
        <BoothListItem key={booth.id} booth={booth} isSelected={selectedId === booth.id} onClick={() => onSelect(booth)} />
      ))}
    </div>
  );
};

const ViewToggles = ({ activeView, onChange }) => (
  <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 h-[42px]">
    {['split', 'map', 'list'].map((view) => (
      <button
        key={view}
        onClick={() => onChange(view)}
        className={`px-3 h-full rounded-lg text-xs font-semibold uppercase ${activeView === view ? 'bg-saffron text-white' : 'text-gray-500 hover:text-white'}`}
      >
        {view}
      </button>
    ))}
  </div>
);

const ErrorMessage = ({ mapError, boothError }) => (
  <div className={`px-4 py-3 rounded-xl text-sm ${mapError ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-400'}`}>
    {mapError ? `⚠️ Maps API: ${mapError}` : `❌ ${boothError}`}
  </div>
);

const Disclaimer = () => (
  <p className="text-[10px] text-center text-gray-700">
    ⓘ Booth data shown for demonstration. Verify with official ECI sources.
  </p>
);
