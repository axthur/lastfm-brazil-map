export function TopArtists({ artists }) {
  return (
    <div className="artists-section">
      <h2>Top 10 Artistas</h2>
      <ul className="artists-list">
        {artists.slice(0, 10).map((artist, index) => (
          <li key={artist.name} className="artist-item">
            <div style={{ display: "flex", alignItems: "center" }}>
              <span className="artist-rank">{index + 1}</span>
              <span className="artist-name">{artist.name}</span>
            </div>
            <span className="artist-playcount">
              {artist.playcount.toLocaleString("pt-BR")} plays
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
