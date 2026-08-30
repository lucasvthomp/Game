type GoogleMapsWindow = Window & {
  google?: {
    maps?: Record<string, any>;
  };
};

const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
export const GOOGLE_MAPS_API_KEY = String(env?.VITE_GOOGLE_MAPS_API_KEY || "").trim();

export function hasGoogleMapsKey() {
  return GOOGLE_MAPS_API_KEY.length > 0;
}

let mapsPromise: Promise<Record<string, any>> | null = null;

/**
 * Load the Google Maps JavaScript API once per page. The key is intentionally
 * read from Vite's public env namespace so it can be configured per deploy
 * without ever checking credentials into the repository.
 */
export function loadGoogleMaps(): Promise<Record<string, any>> {
  if (typeof window === "undefined") return Promise.reject(new Error("Google Maps só pode carregar no navegador."));
  const existing = (window as GoogleMapsWindow).google?.maps;
  if (existing) return Promise.resolve(existing);
  if (!GOOGLE_MAPS_API_KEY) return Promise.reject(new Error("VITE_GOOGLE_MAPS_API_KEY não configurada."));
  if (mapsPromise) return mapsPromise;

  mapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const callbackName = "__marcamarGoogleMapsReady";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&libraries=geometry&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    (window as any)[callbackName] = () => {
      const maps = (window as GoogleMapsWindow).google?.maps;
      if (maps) resolve(maps);
      else reject(new Error("Google Maps carregou sem o objeto maps."));
      delete (window as any)[callbackName];
    };
    script.onerror = () => {
      delete (window as any)[callbackName];
      reject(new Error("Não foi possível carregar o Google Maps."));
    };
    document.head.appendChild(script);
  });

  return mapsPromise;
}

/** A warm, neutral map surface that keeps Google cartography readable. */
export const GOOGLE_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#e9e6dd" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#5d6864" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#e9e6dd" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#c7cfc8" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#dfe8df" }] },
  { featureType: "poi", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "poi.natural_feature", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "landscape.natural.terrain", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry.fill", stylers: [{ color: "#cfe1d3" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#f6f3eb" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#d9d6cc" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#ddd8cc" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry.fill", stylers: [{ color: "#b8d2d5" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#4d7474" }] },
] as const;
