/* global process */

const LASTFM_API_URL = 'https://ws.audioscrobbler.com/2.0/';

function buildTopArtistsUrl({
   username,
   apiKey,
   limit
}) {
   const params = new URLSearchParams({
      method: 'user.gettopartists',
      user: username,
      api_key: apiKey,
      format: 'json',
      period: 'overall',
      limit,
   });

   return `${LASTFM_API_URL}?${params.toString()}`;
}

function validateRequest({
   username,
   apiKey,
   limit
}, res) {
   if (!username) {
      res.status(400).json({
         error: 'Nome de usuário não fornecido',
      });
      return false;
   }

   if (!apiKey) {
      res.status(500).json({
         error: 'API key não configurada',
      });
      return false;
   }

   if (!limit) {
      res.status(500).json({
         error: 'Limite de artistas não configurado',
      });
      return false;
   }

   return true;
}

async function fetchTopArtists({
   username,
   apiKey,
   limit
}) {
   const response = await fetch(buildTopArtistsUrl({
      username,
      apiKey,
      limit
   }));
   if (!response.ok) {
      throw new Error('Last.fm API request failed');
   }

   return response.json();
}

export default async function handler(req, res) {
   const {
      username
   } = req.query;
   const apiKey = process.env.LASTFM_KEY;
   const limit = process.env.LASTFM_LIMIT;

   if (!validateRequest({
      username,
      apiKey,
      limit
   }, res)) {
      return;
   }

   try {
      console.log(`[Lastfm API] Buscando artistas para o usuário: ${username}`);

      const data = await fetchTopArtists({
         username,
         apiKey,
         limit
      });

      console.log(`[Lastfm API] Retornando ${data.topartists?.artist?.length || 0} artistas do Last.fm`);
      return res.status(200).json(data);
   } catch (error) {
      console.log(`[Lastfm API] Erro ao buscar dados do usuário ${username}:`, error);
      return res.status(500).json({
         error: 'Erro ao buscar dados do usuário',
         details: error.message,
      });
   }
}