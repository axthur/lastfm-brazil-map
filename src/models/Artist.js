class Artist {
    constructor({
        name,
        image,
        genres,
        playcount,
        beginArea,
    }) {
        this.name = name;
        this.image = image;
        this.playcount = playcount;
        this.genres = genres || [];
        this.beginArea = beginArea || null;
    }

    // Para o top 10 mais escutados, onde só tem dados do Lastfm
    static fromLastFm(data) {
        return new Artist({
            name: data.name,
            image: data?.image?.[3]?.["#text"] || null,
            playcount: parseInt(data.playcount, 10),
            beginArea: null,
        });
    }

    // Para o mapa do Brasil, onde tem dados do Spotify e do Lastfm
    static fromAPIs(lastfmData, spotifyData, musicbrainzData) {
        return new Artist({
            name: lastfmData?.name || spotifyData?.name, // Tenta pegar o nome do Lastfm primeiro, mas se não tiver, pega do Spotify
            image: spotifyData?.image || // Tenta pegar primeiro a imagem do Spotify
                lastfmData?.image?.[3]?.["#text"] || // Large image do Lastfm
                null,
            playcount: lastfmData?.playcount,
            genres: spotifyData?.genres || [],
            beginArea: musicbrainzData || null,
        });
    }
}

export default Artist;