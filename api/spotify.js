const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_SEARCH_URL = 'https://api.spotify.com/v1/search';

function getSpotifyCredentials() {
    return {
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    };
}

async function fetchAccessToken({
    clientId,
    clientSecret
}) {
    const tokenResponse = await fetch(SPOTIFY_TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
        body: 'grant_type=client_credentials',
    });

    return tokenResponse.json();
}

async function fetchArtistByName(artist, accessToken) {
    const params = new URLSearchParams({
        q: artist,
        type: 'artist',
        limit: '1',
    });

    const searchResponse = await fetch(`${SPOTIFY_SEARCH_URL}?${params.toString()}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    return searchResponse.json();
}

export default async function handler(req, res) {
    const {
        artist
    } = req.query;

    if (!artist) {
        return res.status(400).json({
            error: 'Artist required',
        });
    }

    try {
        console.log(`[Spotify API] Buscando artista: "${artist}"`);

        const credentials = getSpotifyCredentials();
        const tokenData = await fetchAccessToken(credentials);
        const searchData = await fetchArtistByName(artist, tokenData.access_token);

        if (!searchData?.artists?.items || searchData.artists.items.length === 0) {
            console.log(`[Spotify API] Nenhum artista encontrado para: "${artist}"`);
            return res.status(404).json({
                error: 'Artist not found',
            });
        }

        const artistData = searchData.artists.items[0];

        console.log(`[Spotify API] Encontrado artista: "${artistData.name}" (procurava por "${artist}")`);
        return res.status(200).json({
            name: artistData.name,
            image: artistData.images[0]?.url || null,
            genres: artistData.genres,
        });
    } catch (err) {
        console.log(`[Spotify API] Erro ao buscar artista "${artist}":`, err);
        return res.status(500).json({
            error: 'Spotify error',
        });
    }
}