import Artist from "../models/Artist";
import {
    rateLimiter
} from "../lib/rateLimiter";
import {
    apiCache
} from "../lib/apiCache";

const LASTFM_LABEL = 'lastfm';

function getCachedTopArtists(username) {
    return apiCache.get(LASTFM_LABEL, username);
}

function setCachedTopArtists(username, artists) {
    apiCache.set(LASTFM_LABEL, username, artists);
}

async function fetchTopArtists(username) {
    return fetch(`/api/lastfm?username=${encodeURIComponent(username)}`);
}

function mapTopArtists(data) {
    return (data.topartists?.artist || []).map((artist) => Artist.fromLastFm(artist));
}

export async function getTopArtists(username) {
    try {
        const cached = getCachedTopArtists(username);
        if (cached !== undefined) {
            console.log(`[Last.fmService] Usuário encontrado no cache: ${username}`);
            return cached;
        }

        console.log(`[Last.fmService] Buscando artistas top para: ${username}`);
        await rateLimiter.waitForRateLimit(LASTFM_LABEL);

        const response = await fetchTopArtists(username);
        if (!response.ok) {
            console.log(`[Last.fmService] Erro na requisição Last.fm para: ${username} (Status: ${response.status})`);
            return null;
        }

        const data = await response.json();
        if (data?.error) {
            console.log(`[Last.fmService] Erro retornado pela API Last.fm para: ${username} (Erro: ${data.error})`);
            return null;
        }

        const artists = mapTopArtists(data);
        setCachedTopArtists(username, artists);

        return artists;
    } catch (error) {
        console.log(`[Last.fmService] Exception ao buscar informações do usuário: ${username}`, error);
        return null;
    }
}