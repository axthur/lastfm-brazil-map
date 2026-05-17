export function ArtistsWithoutStatePopup({ artists, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <h3>
          Não conseguimos encontrar o estado dos seguintes artistas
          possivelmente brasileiros:
        </h3>
        <div className="popup-scroll-content">
          <ul>
            {artists.map((artist) => (
              <li key={artist.name}>
                {artist.name} - {artist.playcount.toLocaleString("pt-BR")} plays
              </li>
            ))}
          </ul>
        </div>
        <h3>
          Contribua adicionando o estado desses artistas no nosso repositório do
          GitHub!
        </h3>
        <button className="lastfm-button" onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  );
}
