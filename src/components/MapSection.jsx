import { BrazilMap } from "./BrazilMap";

export function MapSection({ artistsByState }) {
  return (
    <div className="map-section">
      <div className="map-header">
        <h2>Mapa do Brasil</h2>
      </div>
      <BrazilMap artistsByState={artistsByState} />
    </div>
  );
}
