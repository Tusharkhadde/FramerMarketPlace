import {
    Map,
    MapLocateControl,
    MapTileLayer,
    MapZoomControl,
} from "@/components/ui/map"

/**
 * MapWithCustomControlPosition - Documentation Example
 * Demonstrates custom positioning of map controls (Zoom and Locate)
 */
export function MapWithCustomControlPosition() {
    const TORONTO_COORDINATES = [43.6532, -79.3832]

    return (
        <Map center={TORONTO_COORDINATES} className="h-[400px] w-full">
            <MapTileLayer />
            {/* Custom positioned controls using Tailwind-like classes */}
            <MapZoomControl position="bottom-4 right-4" />
            <MapLocateControl position="top-4 left-4" />
        </Map>
    )
}
