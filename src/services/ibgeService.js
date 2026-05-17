import {
    rateLimiter
} from "../lib/rateLimiter";
import {
    apiCache
} from "../lib/apiCache";

const IBGE_LABEL = 'ibge';

function getCachedState(city) {
    return apiCache.get(IBGE_LABEL, city);
}

function setCachedState(city, state) {
    apiCache.set(IBGE_LABEL, city, state);
}

async function fetchIbgeState(city) {
    return fetch(`/api/ibge?city=${encodeURIComponent(city)}`);
}

async function withIbgeConcurrency(task) {
    await rateLimiter.waitForConcurrencyLimit(IBGE_LABEL);

    try {
        return await task();
    } finally {
        rateLimiter.releaseConcurrencyLimit(IBGE_LABEL);
    }
}

export async function getStateByCity(city) {
    try {
        const cached = getCachedState(city);
        if (cached !== undefined) {
            console.log(`[IBGEService] Cidade encontrada no cache: ${city}`);
            return cached;
        }

        console.log(`[IBGEService] Buscando estado para cidade: ${city}`);

        const data = await withIbgeConcurrency(async () => {
            await rateLimiter.waitForRateLimit(IBGE_LABEL);

            const response = await fetchIbgeState(city);
            if (!response.ok) {
                console.log(`[IBGEService] Erro na requisição IBGE para: ${city} (Status: ${response.status})`);
                return null;
            }

            return response.json();
        });

        if (data === null) {
            setCachedState(city, null); // Cache do erro
            return null;
        }

        if (data?.error) {
            console.log(`[IBGEService] Erro retornado pela API IBGE para: ${city}`);
            setCachedState(city, null); // Cache do erro
            return null;
        }

        const state = data.state || null;
        setCachedState(city, state);

        return state;
    } catch (error) {
        console.log(`[IBGEService] Exception ao buscar estado para cidade: ${city}`, error);
        return null;
    }
}