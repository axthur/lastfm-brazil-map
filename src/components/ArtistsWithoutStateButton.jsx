export function ArtistsWithoutStateButton({ onClick }) {
  return (
    <button
      className="artists-without-state-button"
      onClick={onClick}
      title="Artistas sem estado"
      aria-label="Ver artistas brasileiros sem estado identificado"
    >
      <img src="/src/assets/info.png" alt="Info" />
    </button>
  );
}
