import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./style/index.css";
import { apiCache } from "./lib/apiCache.js";
import { useArtistSearch } from "./hooks/useArtistSearch";
import { usePopup } from "./hooks/usePopup";
import { TopBar } from "./components/TopBar";
import { SearchForm } from "./components/SearchForm";
import { LoadingBar } from "./components/LoadingBar";
import { MapSection } from "./components/MapSection";
import { TopArtists } from "./components/TopArtists";
import { ArtistsWithoutStateButton } from "./components/ArtistsWithoutStateButton";
import { ArtistsWithoutStatePopup } from "./components/ArtistsWithoutStatePopup";

// Expor apiCache no console para debug
window.apiCache = apiCache;

export function App() {
  const {
    username,
    setUsername,
    artists,
    artistsByState,
    loading,
    loadedCount,
    brazilianArtistsWithoutState,
    handleSearch,
  } = useArtistSearch();

  const popup = usePopup();

  return (
    <>
      <TopBar />

      <div className="container">
        <SearchForm
          username={username}
          onUsernameChange={setUsername}
          onSearch={handleSearch}
          isLoading={loading}
        />

        {loading && <LoadingBar loaded={loadedCount} />}

        {!loading && artists && artists.length > 0 && (
          <MapSection artistsByState={artistsByState} />
        )}

        {!loading && brazilianArtistsWithoutState.length > 0 && (
          <ArtistsWithoutStateButton onClick={popup.open} />
        )}

        <ArtistsWithoutStatePopup
          artists={brazilianArtistsWithoutState}
          isOpen={popup.isOpen}
          onClose={popup.close}
        />

        {!loading && artists.length > 0 && <TopArtists artists={artists} />}
      </div>
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
