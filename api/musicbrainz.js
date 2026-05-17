const MUSICBRAINZ_API_URL = 'https://musicbrainz.org/ws/2/artist/';
const MUSICBRAINZ_HEADERS = {
    'User-Agent': 'br-lastfm-map/1.0 ( your@email.com )',
};

function buildMusicBrainzUrl(artist) {
    const params = new URLSearchParams({
        query: `artist:${artist}`,
        fmt: 'json',
    });

    return `${MUSICBRAINZ_API_URL}?${params.toString()}`;
}

async function fetchArtist(artist) {
    return fetch(buildMusicBrainzUrl(artist), {
        headers: MUSICBRAINZ_HEADERS,
    });
}

function findArtist(data, artist) {
    return data.artists?.find(
        (candidate) =>
            candidate.name.toUpperCase() === artist.toUpperCase()
    );
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
        console.log(`[MusicBrainz API] Buscando artista: ${artist}`);

        let response;
        let data;

        try {
            response = await fetchArtist(artist);

            if (response.ok) {
                console.log(`[MusicBrainz API] Sucesso ao buscar artista: ${artist}`);
                data = await response.json();
            }
        } catch (fetchError) {
            throw fetchError;
        }

        if (!response || !response.ok) {
            return res.status(response?.status || 503).json({
                error: 'MusicBrainz API request failed',
            });
        }

        const foundArtist = findArtist(data, artist);

        if (!foundArtist) {
            console.log(`[MusicBrainz API] Artista não encontrado: ${artist}`);
            return res.status(404).json({
                error: 'Artist not found',
            });
        }

        const city = foundArtist?.['begin-area']?.name || null;
        const country = foundArtist?.country || null;

        console.log(`[MusicBrainz API] Retornando dados: ${artist} (Cidade: ${city ?? 'N/A'}, País: ${country ?? 'N/A'})`);
        return res.status(200).json({
            name: foundArtist?.name,
            city,
            country,
        });
    } catch (err) {
        console.error(`[MusicBrainz API] Erro ao buscar ${artist}:`, err);
        return res.status(500).json({
            error: 'MusicBrainz error',
        });
    }
}