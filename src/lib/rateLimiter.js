class RateLimiter {
    constructor() {
        // Armazena o timestamp da última request para cada API
        this.lastRequestTime = {};
        this.requestQueue = {};

        // Configuração de delays em milissegundos para cada API
        this.delays = {
            lastfm: 500,
            spotify: 500,
            musicbrainz: 3000,
            ibge: 150,
        };

        // Limite de requisições concorrentes por API
        this.maxConcurrent = {
            lastfm: 1,
            spotify: 5,
            musicbrainz: 1,
            ibge: 5,
        };

        this.activeRequests = {};
    }

    async waitForRateLimit(apiName) {
        const delay = this.delays[apiName];
        const now = Date.now();
        const lastRequest = this.lastRequestTime[apiName] || 0;
        const timeSinceLastRequest = now - lastRequest;

        if (timeSinceLastRequest < delay) {
            const waitTime = delay - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        this.lastRequestTime[apiName] = Date.now();
    }

    async waitForConcurrencyLimit(apiName) {
        if (!this.activeRequests[apiName]) {
            this.activeRequests[apiName] = 0;
        }

        while (this.activeRequests[apiName] >= this.maxConcurrent[apiName]) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        this.activeRequests[apiName]++;
    }

    releaseConcurrencyLimit(apiName) {
        if (this.activeRequests[apiName]) {
            this.activeRequests[apiName]--;
        }
    }
}

export const rateLimiter = new RateLimiter();