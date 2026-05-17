class APICache {
    constructor() {
        this.cache = {
            lastfm: new Map(), // username -> artists
            musicbrainz: new Map(), // artist -> city
            ibge: new Map(), // city -> state
            spotify: new Map(), // artist -> spotifyData
        };
        console.log('[APICache] Cache inicializado');
    }

    set(api, key, value) {
        this.cache[api].set(key, value);
    }

    get(api, key) {
        const value = this.cache[api].get(key);
        if (value === undefined) {
            return undefined; // Retorna undefined quando não está no cache
        }
        return value; // Pode retornar null se foi cacheado como null
    }
}

export const apiCache = new APICache();