import React, { createContext, useContext, useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

const MapboxContext = createContext();

const accessToken = process.env.REACT_APP_MAPBOX_TOKEN;
const mapboxStyleBaseUrl = process.env.REACT_APP_MAPBOX_STYLE_URL;
const BASEMAP_STYLES_MAPBOX_ID =
  process.env.REACT_APP_BASEMAP_STYLES_MAPBOX_ID || '';

export const MapboxProvider = ({ children }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return;

    let mapboxStyleUrl = 'mapbox://styles/mapbox/streets-v12';
    if (mapboxStyleBaseUrl) {
      mapboxStyleUrl = `${mapboxStyleBaseUrl}/${BASEMAP_STYLES_MAPBOX_ID}`;
    }

    mapboxgl.accessToken = accessToken;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapboxStyleUrl,
      center: [-98.771556, 32.967243], // Centered on the US
      zoom: 4,
      projection: 'equirectangular',
      options: {
        trackResize: true,
      },
    });

    map.current.dragRotate.disable();
    map.current.touchZoomRotate.disableRotation();

    return () => map.current.remove();
  }, []);

  return (
    <MapboxContext.Provider value={{ map: map.current }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      {children}
    </MapboxContext.Provider>
  );
};

export const useMapbox = () => useContext(MapboxContext);
