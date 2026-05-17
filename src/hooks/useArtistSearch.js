import {
    useState,
    useRef
} from "react";
import {
    getTopArtists
} from "../services/lastfmService";
import {
    groupByState
} from "../controllers/artistController";


export function useArtistSearch() {
    const [username, setUsername] = useState(""); // Nome do usuário
    const [artists, setArtists] = useState([]); // Lista de artistas encontrados
    const [artistsByState, setArtistsByState] = useState({}); // Artistas agrupados por estado
    const [loading, setLoading] = useState(false); // Flag de loading
    const [loadedCount, setLoadedCount] = useState(0); // Contagem de artistas carregados
    const [brazilianArtistsWithoutState, setBrazilianArtistsWithoutState] = useState([]); // Artistas brasileiros sem estado definido
    const isSearchingRef = useRef(false); // Ref para evitar múltiplas buscas simultâneas

    const handleSearch = async () => {
        // Previne múltiplas execuções simultâneas
        if (isSearchingRef.current) {
            console.log("[Artist search] Busca já está em andamento, ignorando nova chamada");
            return;
        }

        try {
            isSearchingRef.current = true;
            console.log("[Artist search] Iniciando nova busca para usuário:", username);
            setLoading(true);
            setLoadedCount(0);
            setBrazilianArtistsWithoutState([]);

            // Busca os top artistas do usuário
            const topArtists = await getTopArtists(username);

            if (!topArtists || topArtists.length === 0) {
                console.log("[Artist search] Nenhum artista encontrado para:", username);
                setArtists([]);
                setArtistsByState({});
                setBrazilianArtistsWithoutState([]);
                alert("Não foi possível encontrar artistas para este usuário.");
                return;
            }

            setArtists(topArtists);

            // Agrupa os artistas por estado
            const groupedResult = await groupByState(topArtists, (count) => {
                setLoadedCount(count);
            });
            setArtistsByState(groupedResult.grouped);
            setBrazilianArtistsWithoutState(groupedResult.artistsWithoutState);
        } catch (error) {
            console.error("[Artist search] Erro durante a busca:", error);
            alert(error.message);
        } finally {
            isSearchingRef.current = false;
            console.log("[Artist search] Busca finalizada");
            setLoading(false);
        }
    };

    return {
        username,
        setUsername,
        artists,
        artistsByState,
        loading,
        loadedCount,
        brazilianArtistsWithoutState,
        handleSearch,
    };
}

export default useArtistSearch;