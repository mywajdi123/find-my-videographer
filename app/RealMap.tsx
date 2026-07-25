"use client";

import { useEffect, useRef, useState } from "react";

type MapCreator = {
  studio: string;
  distance: number;
};

type RealMapProps = {
  center: [number, number];
  locationLabel: string;
  radius: number;
  creators: MapCreator[];
  onSelectCreator: (studio: string) => void;
};

const markerOffsets: Array<[number, number]> = [
  [0.026, -0.018],
  [-0.048, -0.043],
  [0.078, 0.056],
];

export function RealMap({
  center,
  locationLabel,
  radius,
  creators,
  onSelectCreator,
}: RealMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const layerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function createMap() {
      if (!containerRef.current || mapRef.current) return;
      const L = await import("leaflet");
      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView(center, 11);

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      mapRef.current = map;
      layerRef.current = L.layerGroup().addTo(map);
      setMapReady(true);
      window.setTimeout(() => map.invalidateSize(), 50);
    }

    void createMap();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function updateMap() {
      const L = await import("leaflet");
      if (cancelled || !mapReady || !mapRef.current || !layerRef.current) return;

      const map = mapRef.current;
      const layers = layerRef.current;
      layers.clearLayers();
      map.setView(center, radius <= 5 ? 12 : radius <= 15 ? 11 : 10);

      L.circle(center, {
        radius: radius * 1609.34,
        color: "#e89b78",
        weight: 2,
        fillColor: "#e89b78",
        fillOpacity: 0.08,
      }).addTo(layers);

      L.circleMarker(center, {
        radius: 8,
        color: "#ffffff",
        weight: 4,
        fillColor: "#e89b78",
        fillOpacity: 1,
      })
        .bindTooltip(locationLabel, { direction: "top" })
        .addTo(layers);

      creators.forEach((creator, index) => {
        const offset = markerOffsets[index] ?? [0.02 * (index + 1), 0.02];
        const markerPosition: [number, number] = [
          center[0] + offset[0],
          center[1] + offset[1],
        ];
        const marker = L.marker(markerPosition, {
          icon: L.divIcon({
            className: "real-map-marker",
            html: `<span><i>${index + 1}</i></span><small>${creator.studio}</small>`,
            iconSize: [126, 48],
            iconAnchor: [17, 34],
          }),
        });
        marker.on("click", () => onSelectCreator(creator.studio));
        marker.addTo(layers);
      });
    }

    const timer = window.setTimeout(() => void updateMap(), 80);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [center, creators, locationLabel, mapReady, onSelectCreator, radius]);

  return <div ref={containerRef} className="real-map-canvas" />;
}
