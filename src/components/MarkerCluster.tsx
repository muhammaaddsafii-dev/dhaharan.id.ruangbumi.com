import { useEffect } from "react";
import L from "leaflet";
import "leaflet.markercluster";

export default function MarkerCluster({ map, points }) {
  useEffect(() => {
    if (!map) return;

    const clusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      maxClusterRadius: 60,
    });

    points.forEach((p) => {
      const marker = L.marker([p.lat, p.lng]);
      if (p.popup) marker.bindPopup(p.popup);
      clusterGroup.addLayer(marker);
    });

    map.addLayer(clusterGroup);

    return () => {
      map.removeLayer(clusterGroup);
    };
  }, [map, points]);

  return null;
}
