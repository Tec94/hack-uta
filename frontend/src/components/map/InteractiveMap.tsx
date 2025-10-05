import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { Merchant, UserLocation } from "@/types";
import { getCategoryIcon } from "@/lib/utils";
import "mapbox-gl/dist/mapbox-gl.css";

interface InteractiveMapProps {
  userLocation: UserLocation;
  merchants: Merchant[];
  onMerchantSelect?: (merchant: Merchant) => void;
  className?: string;
}

export function InteractiveMap({
  userLocation,
  merchants,
  onMerchantSelect,
  className = "",
}: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!mapboxToken) {
      console.error("Mapbox token not found");
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [userLocation.lng, userLocation.lat],
      zoom: 15,
      scrollZoom: false,
      boxZoom: false,
      doubleClickZoom: false,
      touchZoomRotate: false,
      dragRotate: false,
    });

    map.current.on("load", () => {
      setMapLoaded(true);
    });

    // Add user location marker
    new mapboxgl.Marker({ color: "#3b82f6" })
      .setLngLat([userLocation.lng, userLocation.lat])
      .setPopup(
        new mapboxgl.Popup().setHTML(
          '<div class="p-2"><strong>Your Location</strong></div>'
        )
      )
      .addTo(map.current);

    // Cleanup
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Add merchant markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Add merchant markers
    merchants.forEach((merchant) => {
      const icon = getCategoryIcon(merchant.category);

      const el = document.createElement("div");
      el.className = "merchant-marker";
      el.style.backgroundColor = getCategoryColor(merchant.category);
      el.style.width = "30px";
      el.style.height = "30px";
      el.style.borderRadius = "50%";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.cursor = "pointer";
      el.style.border = "2px solid white";
      el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
      el.textContent = icon;

      new mapboxgl.Marker(el)
        .setLngLat([merchant.location.lng, merchant.location.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-3">
              <strong class="text-base">${merchant.name}</strong>
              <p class="text-sm mt-1">${merchant.category}</p>
              ${
                merchant.address
                  ? `<p class="text-xs mt-1 opacity-80">${merchant.address}</p>`
                  : ""
              }
              ${
                merchant.estimatedSpend
                  ? `<p class="text-xs mt-2 font-medium">Est: $${merchant.estimatedSpend}</p>`
                  : ""
              }
            </div>
          `)
        )
        .addTo(map.current!);

      el.addEventListener("click", () => {
        if (onMerchantSelect) {
          onMerchantSelect(merchant);
        }
      });
    });
  }, [merchants, mapLoaded, onMerchantSelect]);

  return (
    <div
      ref={mapContainer}
      className={`w-full h-[300px] md:h-[400px] rounded-xl shadow-md ${className}`}
    />
  );
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    dining: "#ef4444",
    gas: "#f59e0b",
    groceries: "#10b981",
    travel: "#3b82f6",
    shopping: "#8b5cf6",
    entertainment: "#ec4899",
  };
  return colors[category.toLowerCase()] || "#6b7280";
}
