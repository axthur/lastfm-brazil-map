import artistsData from "../data/artists.json";
import Artist from "../models/Artist";
import {
    getSpotifyArtist
} from "../services/spotifyService";
import {
    getArtistBeginArea
} from "../services/musicbrainzService";
import {
    getStateByCity
} from "../services/ibgeService";

// Array para registrar artistas brasileiros encontrados pelo MusicBrainz, mas sem estado definido
let brazilianArtistsWithoutState = [];
export function getBrazilianArtistsWithoutState() {
    return brazilianArtistsWithoutState;
}

async function getArtistState(artistName, artist) {
    const artistNameUpper = artistName.toUpperCase();

    // Prioriza o JSON local
    if (artistsData[artistNameUpper]) {
        const state = artistsData[artistNameUpper];
        console.log(`[Controller] Usando estado do JSON para ${artistName}: ${state}`);
        return state;
    }

    // Se não estiver no JSON, tenta buscar a cidade via MusicBrainz
    console.log(`[Controller] Artista ${artistName} não está no JSON, buscando via MusicBrainz...`);
    const mbData = await getArtistBeginArea(artistName);

    // Se foi encontrado dados do MusicBrainz
    if (mbData && mbData.country === 'BR') {
        console.log(`[Controller] MusicBrainz retornou artista brasileiro: ${artistName}`);

        // Se tem cidade, tenta buscar o estado via IBGE
        if (mbData.city) {
            console.log(`[Controller] MusicBrainz retornou cidade brasileira: ${mbData.city}`);

            // Tenta buscar o estado via IBGE
            const state = await getStateByCity(mbData.city);
            if (state) {
                console.log(`[Controller] IBGE retornou o estado ${state} para a cidade de: ${mbData.city}`);
                return state;
            }

            console.log(`[Controller] IBGE não encontrou estado para cidade de: ${mbData.city}`);
        }

        // Artista é brasileiro mas não conseguimos determinar o estado
        console.log(`[Controller] Artista brasileiro sem estado definido: ${artistName}`);
        brazilianArtistsWithoutState.push(artist);
    }

    return null;
}

export async function groupByState(artists, onProgress) {
    const grouped = {};
    let processedCount = 0;

    // Limpa o array antes de começar um novo processamento
    brazilianArtistsWithoutState = [];

    const statePromises = artists.map(async (artist) => {
        const state = await getArtistState(artist.name, artist);

        processedCount++;
        if (onProgress) {
            onProgress(processedCount);
        }

        return {
            artist,
            state
        };
    });

    const results = await Promise.all(statePromises);

    // Processa resultados
    for (const {
        artist,
        state
    }
        of results) {
        if (!state) {
            continue;
        }

        const playcount = Number(artist.playcount) || 0;

        // Se não tem nenhum artista do estado ou se este artista tem mais plays naquele estado
        if (!grouped[state] || grouped[state].playcount < playcount) {
            grouped[state] = artist;
        }
    }

    // Busca dados do Spotify para os artistas agrupados
    const entries = await Promise.all(
        Object.entries(grouped).map(async ([state, artist]) => {
            console.log(`[Controller] Buscando dados Spotify para: ${artist.name} (Estado: ${state})`);
            const spotifyData = await getSpotifyArtist(artist.name);
            if (spotifyData) {
                console.log(`[Controller] Spotify retornou para ${spotifyData.name}`);
            }
            const mergedArtist = Artist.fromAPIs(artist, spotifyData);

            return [state, mergedArtist];
        }),
    );

    return {
        grouped: Object.fromEntries(entries),
        artistsWithoutState: brazilianArtistsWithoutState
    };
}