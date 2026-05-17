import {
    rateLimiter
} from "../lib/rateLimiter";
import {
    apiCache
} from "../lib/apiCache";

const MUSICBRAINZ_LABEL = 'musicbrainz';

function getCachedBeginArea(name) {
    return apiCache.get(MUSICBRAINZ_LABEL, name);
}

function setCachedBeginArea(name, value) {
    apiCache.set(MUSICBRAINZ_LABEL, name, value);
}

async function fetchArtistBeginArea(name) {
    return fetch(`/api/musicbrainz?artist=${encodeURIComponent(name)}`);
}

function buildArtistOrigin(data) {
    return {
        city: data.city || null,
        country: data.country || null
    };
}

function isBrazilianArtist(data) {
    return data?.country === 'BR';
}

async function withMusicBrainzConcurrency(task) {
    await rateLimiter.waitForConcurrencyLimit(MUSICBRAINZ_LABEL);

    try {
        return await task();
    } finally {
        rateLimiter.releaseConcurrencyLimit(MUSICBRAINZ_LABEL);
    }
}

export async function getArtistBeginArea(name) {
    try {
        const cached = getCachedBeginArea(name);
        if (cached !== undefined) {
            console.log(`[MusicBrainzService] Artista encontrado no cache: ${name}`);
            return cached;
        }

        console.log(`[MusicBrainzService] Buscando begin area no MusicBrainz para: ${name}`);

        const data = await withMusicBrainzConcurrency(async () => {
            await rateLimiter.waitForRateLimit(MUSICBRAINZ_LABEL);

            let attempt = 0;
            const maxAttempts = 5;
            let response;
            do {
                response = await fetchArtistBeginArea(name);
                if (response.status === 500) {
                    attempt++;
                    console.log(`[MusicBrainzService] Erro na requisição MusicBrainz para: ${name} (Status: ${response.status}). Tentativa ${attempt}/${maxAttempts}.`);
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                } else {
                    break;
                }
            } while (attempt < maxAttempts);

            if (!response?.ok) {
                console.log(`[MusicBrainzService] Falha ao obter dados do MusicBrainz para: ${name}`);
                return null;
            }

            return await response.json();
        });

        if (data === null) {
            console.log(`[MusicBrainzService] Nenhum dado recebido do MusicBrainz para: ${name}`);
            setCachedBeginArea(name, null); // Cache do erro
            return null;
        }

        if (data?.error) {
            console.log(`[MusicBrainzService] Erro retornado pela API MusicBrainz para: ${name}`);
            setCachedBeginArea(name, null); // Cache do erro
            return null;
        }

        if (!isBrazilianArtist(data)) {
            console.log(`[MusicBrainzService] Artista encontrado, mas não é brasileiro ou não tem país registrado: ${name} (País: ${data.country ?? 'N/A'})`);
            setCachedBeginArea(name, null); // Cache do resultado negativo
            return null;
        }

        const result = buildArtistOrigin(data);
        console.log(`[MusicBrainzService] Dados recebidos do MusicBrainz para ${name}: ${result.city ?? 'N/A'}, ${result.country ?? 'N/A'}`);
        setCachedBeginArea(name, result);

        return result;
    } catch (error) {
        console.log(`[MusicBrainzService] Exception ao buscar begin area para: ${name}`, error);
        return null;
    }
}