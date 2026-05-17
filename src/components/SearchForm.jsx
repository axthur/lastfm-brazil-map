export function SearchForm({
  username,
  onUsernameChange,
  onSearch,
  isLoading,
}) {
  const handleKeyUp = (e) => {
    if (e.key === "Enter" && !isLoading) {
      onSearch();
    }
  };

  return (
    <div className="search-section">
      <h2>Pesquisar usuário</h2>
      <div className="search-form">
        <input
          type="text"
          placeholder="Digite seu username do Last.fm"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          onKeyUp={handleKeyUp}
        />
        <button
          className="lastfm-button"
          onClick={onSearch}
          disabled={isLoading}
        >
          Buscar
        </button>
      </div>
    </div>
  );
}
