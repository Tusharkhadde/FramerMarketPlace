import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '@/lib/utils';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button } from '@/components/ui/button';
import { useMap } from 'react-leaflet';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const Map = ({ 
  children, 
  className, 
  center = [20.5937, 78.9629], 
  zoom = 13, 
  ...props 
}) => {
  return (
    <div className={cn("relative h-full w-full overflow-hidden rounded-xl border border-border shadow-sm group", className)}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true}
        className="h-full w-full z-10"
        zoomControl={false} // Disable default zoom control to use custom if needed
        {...props}
      >
        {children}
      </MapContainer>
    </div>
  );
};

/**
 * MapTileLayer - Wrapper for TileLayer
 */
const MapTileLayer = ({ 
  url = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  ...props 
}) => {
  return <TileLayer url={url} attribution={attribution} {...props} />;
};
MapTileLayer.isMapElement = true;
MapTileLayer.displayName = 'MapTileLayer';

/**
 * MapMarker - Wrapper for Marker with support for custom icons
 */
const MapMarker = ({ position, icon, children, ...props }) => {
  let leafletIcon;
  
  if (icon && React.isValidElement(icon)) {
    try {
      const iconHtml = renderToStaticMarkup(icon);
      leafletIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-leaflet-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
    } catch (e) {
      console.error("Error rendering icon to static markup:", e);
    }
  }

  return (
    <Marker position={position} icon={leafletIcon} {...props}>
      {children && <Popup>{children}</Popup>}
    </Marker>
  );
};
MapMarker.isMapElement = true;
MapMarker.displayName = 'MapMarker';

/**
 * MapControlContainer - Custom container to place absolute positioned controls on the map
 */
const MapControlContainer = ({ children, className, position }) => {
  // Transform position string (like "top-1 left-1") into Tailwind classes if needed
  // or just pass through if it's already classes
  return (
    <div className={cn(
      "absolute pointer-events-auto transition-all duration-200 z-[1002]",
      position,
      className
    )}>
      {children}
    </div>
  );
};
MapControlContainer.isMapElement = true;
MapControlContainer.displayName = 'MapControlContainer';

/**
 * MapZoomControl - Custom zoom control
 */
const MapZoomControl = ({ position = "bottom-4 right-4", className }) => {
  const map = useMap();
  return (
    <MapControlContainer position={position} className={cn("flex flex-col gap-1", className)}>
      <Button 
        variant="secondary" 
        size="icon" 
        className="w-10 h-10 rounded-lg shadow-md bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background"
        onClick={() => map.zoomIn()}
      >
        <span className="text-xl font-medium">+</span>
      </Button>
      <Button 
        variant="secondary" 
        size="icon" 
        className="w-10 h-10 rounded-lg shadow-md bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background"
        onClick={() => map.zoomOut()}
      >
        <span className="text-xl font-medium">−</span>
      </Button>
    </MapControlContainer>
  );
};
MapZoomControl.isMapElement = true;
MapZoomControl.displayName = 'MapZoomControl';

/**
 * MapLocateControl - Custom locate control
 */
const MapLocateControl = ({ position = "top-4 right-4", className }) => {
  const map = useMap();
  return (
    <MapControlContainer position={position}>
      <Button 
        variant="secondary" 
        size="icon" 
        className="w-10 h-10 rounded-lg shadow-md bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background"
        onClick={() => {
          map.locate({ setView: true, maxZoom: 16 });
        }}
      >
        <div className="w-4 h-4 rounded-full border-2 border-primary relative">
          <div className="absolute inset-0 m-auto w-1 h-1 bg-primary rounded-full" />
        </div>
      </Button>
    </MapControlContainer>
  );
};
MapLocateControl.isMapElement = true;
MapLocateControl.displayName = 'MapLocateControl';

export { Map, MapTileLayer, MapMarker, MapControlContainer, MapZoomControl, MapLocateControl };
