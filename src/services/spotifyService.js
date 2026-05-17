import {
    rateLimiter
} from "../lib/rateLimiter";
import {
    apiCache
} from "../lib/apiCache";

const SPOTIFY_LABEL = 'spotify';

function getCachedArtist(name) {
    return apiCache.get(SPOTIFY_LABEL, name);
}

function setCachedArtist(name, data) {
    apiCache.set(SPOTIFY_LABEL, name, data);
}

async function fetchSpotifyArtist(name) {
    return fetch(`/api/spotify?artist=${encodeURIComponent(name)}`);
}

async function withSpotifyConcurrency(task) {
    await rateLimiter.waitForConcurrencyLimit(SPOTIFY_LABEL);

    try {
        return await task();
    } finally {
        rateLimiter.releaseConcurrencyLimit(SPOTIFY_LABEL);
    }
}

export async function getSpotifyArtist(name) {
    try {
        const cached = getCachedArtist(name);
        if (cached !== undefined) {
            console.log(`[SpotifyService] Artista encontrado no cache: ${name}`);
            return cached;
        }

        console.log(`[SpotifyService] Buscando no Spotify: ${name}`);

        const data = await withSpotifyConcurrency(async () => {
            await rateLimiter.waitForRateLimit(SPOTIFY_LABEL);

            const response = await fetchSpotifyArtist(name);
            if (!response.ok) {
                console.log(`[SpotifyService] Erro na requisição Spotify para: ${name} (Status: ${response.status})`);
                return null;
            }

            return response.json();
        });

        if (data === null || data?.error) {
            console.log(`[SpotifyService] Erro retornado pela API Spotify para: ${name} (Erro: ${data?.error?.message || 'Unknown error'})`);
            setCachedArtist(name, null); // Cache do erro
            return null;
        }

        setCachedArtist(name, data); // Cache do resultado válido
        return data;
    } catch (error) {
        console.log(`[SpotifyService] Exception ao buscar dados do artista: ${name}`, error);
        return null;
    }
}